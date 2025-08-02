import IconButton from "@/components/ui/IconButton/IconButton"
import ScreenContainer from "@/components/ui/ScreenContainer"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import Url from "@/constants/Url"
import throttle from "@/utils/functions/throttle"
import { AntDesign } from "@expo/vector-icons"
import { useEffect, useLayoutEffect } from "react"
import { Image, InteractionManager, StyleSheet } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Ripple from "react-native-material-ripple"
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import useGetTimelineById from "../hooks/query/useGetTimelineById"
import { TimelineScreenProps } from "../types"

export default function ImagesPreview({ route, navigation }: TimelineScreenProps<"ImagesPreview">) {
    const { data } = useGetTimelineById(route.params.timelineId! as string, {
        fetchPolicy: "cache-only",
    })

    const currentImageIndex = data.images.findIndex(
        (img: { id: string; url: string }) => img.url === route.params.selectedImage,
    )

    useEffect(() => {
        navigation.setOptions({
            headerRight: () =>
                currentImageIndex + 1 < data.images.length ? (
                    <Ripple
                        style={{ paddingRight: 10 }}
                        onPress={() => {
                            InteractionManager.runAfterInteractions(() => {
                                navigation.setParams({
                                    selectedImage: data.images[currentImageIndex + 1].url,
                                    timelineId: route.params.timelineId,
                                })
                            })
                        }}
                    >
                        <Text variant="body" color={Colors.foreground}>
                            Next
                        </Text>
                    </Ripple>
                ) : null,
        })
    }, [data.images, route.params.selectedImage])

    const insets = useSafeAreaInsets()

    return (
        <ScreenContainer
            style={{
                justifyContent: "center",
                alignItems: "center",
                padding: 0,
                backgroundColor: "rgba(0,0,0,0.75)",
                ...StyleSheet.absoluteFillObject,
            }}
        >
            <Ripple style={{ position: "absolute", left: 10, top: insets.top + 10, zIndex: 1000 }}>
                <IconButton
                    onPress={throttle(() => navigation.canGoBack() && navigation.goBack(), 250)}
                    icon={<AntDesign name="arrowleft" size={24} color={Colors.foreground} />}
                />
            </Ripple>
            <GesturedImage uri={route.params.selectedImage} />
        </ScreenContainer>
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
        .onStart((event) => {
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
        .onStart(() => {
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

    const combinedGesture = Gesture.Exclusive(
        doubleTapGesture,
        Gesture.Simultaneous(singleTapGesture, Gesture.Simultaneous(pinchGesture, panGesture)),
    )

    return (
        <GestureDetector gesture={combinedGesture}>
            <Animated.Image source={src} style={animatedStyle} resizeMode="contain" />
        </GestureDetector>
    )
}
