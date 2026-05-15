import Layout from "@/constants/Layout"
import Url from "@/constants/Url"
import { useLayoutEffect } from "react"
import { Image, StyleSheet, View } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { BlurView } from "expo-blur"
import { router, useLocalSearchParams } from "expo-router"
import IconBackButton from "@/components/ui/Button/IconBackButton"

export default function ImagesPreview() {
    const { selectedImage } = useLocalSearchParams<{ selectedImage: string }>()
    const insets = useSafeAreaInsets()

    return (
        <View style={{ flex: 1, position: "relative" }}>
            <BlurView tint="dark" intensity={30} style={styles.modalContainer}>
                <GesturedImage
                    uri={selectedImage}
                    onSingleTap={() => {
                        router.back()
                    }}
                />
            </BlurView>
            <IconBackButton
                style={{
                    top: insets.top + 10,
                    left: 15,
                    width: 50,
                }}
            />
        </View>
    )
}

export const GesturedImage = (props: { uri: string; onSingleTap?: () => void }) => {
    const scale = useSharedValue(1)
    const translateX = useSharedValue(0)
    const translateY = useSharedValue(0)

    const savedScale = useSharedValue(1)
    const savedTranslateX = useSharedValue(0)
    const savedTranslateY = useSharedValue(0)

    const dimensions = useSharedValue({ width: 0, height: 0 })

    const src = { uri: Url.API + "/upload/images/" + props.uri }

    useLayoutEffect(() => {
        Image.getSize(src.uri, (width, height) => {
            const imageRatio = width / height
            const screenWidth = Layout.window.width
            const screenHeight = Layout.window.height

            if (imageRatio > screenWidth / screenHeight) {
                dimensions.value = {
                    width: screenWidth,
                    height: screenWidth / imageRatio,
                }
            } else {
                dimensions.value = {
                    width: screenHeight * imageRatio,
                    height: screenHeight,
                }
            }
        })
    }, [props.uri])

    const doubleTapGesture = Gesture.Tap()
        .numberOfTaps(2)
        .maxDuration(250)
        .onStart(() => {
            if (scale.value !== 1) {
                scale.value = withSpring(1)
                translateX.value = withSpring(0)
                translateY.value = withSpring(0)

                savedScale.value = 1
                savedTranslateX.value = 0
                savedTranslateY.value = 0
            } else {
                scale.value = withSpring(2)
                savedScale.value = 2
            }
        })

    const singleTapGesture = Gesture.Tap()
        .maxDuration(250)
        .onEnd(() => {
            if (props.onSingleTap) {
                runOnJS(props.onSingleTap)()
            }
        })

    const panGesture = Gesture.Pan()
        .onStart(() => {
            savedTranslateX.value = translateX.value
            savedTranslateY.value = translateY.value
        })
        .onUpdate((event) => {
            translateX.value = savedTranslateX.value + event.translationX
            translateY.value = savedTranslateY.value + event.translationY
        })
        .onEnd(() => {
            if (scale.value <= 1) {
                translateX.value = withSpring(0)
                translateY.value = withSpring(0)
                savedTranslateX.value = 0
                savedTranslateY.value = 0
            } else {
                savedTranslateX.value = translateX.value
                savedTranslateY.value = translateY.value
            }
        })

    const pinchGesture = Gesture.Pinch()
        .onStart(() => {
            savedScale.value = scale.value
        })
        .onUpdate((event) => {
            const newScale = savedScale.value * event.scale
            scale.value = Math.max(0.5, newScale)
        })
        .onEnd(() => {
            if (scale.value < 1) {
                scale.value = withSpring(1)
                translateX.value = withSpring(0)
                translateY.value = withSpring(0)

                savedScale.value = 1
                savedTranslateX.value = 0
                savedTranslateY.value = 0
            } else if (scale.value > 6) {
                scale.value = withSpring(6)
                savedScale.value = 6
            } else {
                savedScale.value = scale.value
            }
        })

    const animatedStyle = useAnimatedStyle(() => {
        return {
            width: dimensions.value.width,
            height: dimensions.value.height,
            transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale: scale.value }],
        }
    })

    const combinedGesture = Gesture.Race(
        doubleTapGesture,
        singleTapGesture,
        Gesture.Simultaneous(pinchGesture, panGesture),
    )

    return (
        <GestureDetector gesture={combinedGesture}>
            <Animated.Image source={src} style={animatedStyle} resizeMode="contain" />
        </GestureDetector>
    )
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.75)",
        justifyContent: "center",
        alignItems: "center",
        padding: 0,
        ...StyleSheet.absoluteFill,
    },
    closeButton: {},
})
