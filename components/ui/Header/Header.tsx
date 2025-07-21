import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import throttle from "@/utils/functions/throttle"
import { AntDesign } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { BlurView } from "expo-blur"
import { memo, ReactNode, useMemo } from "react"
import { StyleProp, StyleSheet, Text, TextStyle, ViewStyle } from "react-native"
import Ripple from "react-native-material-ripple"
import Animated, {
    AnimatedStyle,
    Extrapolation,
    interpolate,
    interpolateColor,
    SharedValue,
    useAnimatedProps,
    useAnimatedStyle,
} from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import AnimatedNumber from "../AnimatedNumber"
import IconButton from "../IconButton/IconButton"

const AnimatedBlur = Animated.createAnimatedComponent(BlurView)

const THRESHOLD = 200

function Header(props: {
    buttons?: {
        onPress: () => void
        icon: JSX.Element | React.ReactNode
        style?: StyleProp<ViewStyle>
    }[]
    title?: string
    goBack?: boolean
    titleAnimatedStyle?: AnimatedStyle
    backIcon?: JSX.Element
    children?: JSX.Element
    containerStyle?: StyleProp<ViewStyle>
    scrollY?: SharedValue<number>
    animated?: boolean
    animatedTitle?: string
    animatedSubtitle?: string
    animatedValue?: number
    animatedValueLoading?: boolean
    animatedValueFormat?: (value: number) => string
    onAnimatedTitleLongPress?: () => void
    subtitleStyles?: StyleProp<TextStyle>
    initialHeight?: number
    textContainerStyle?: StyleProp<TextStyle>
    renderAnimatedItem?: (props: { scrollY: SharedValue<number> | undefined }) => JSX.Element | ReactNode | null
}) {
    const insets = useSafeAreaInsets()
    const navigation = useNavigation()

    const animatedBlurProps = useAnimatedProps(() => {
        "worklet"
        const scrollValue = Math.max(0, Math.min(props.scrollY?.value || 0, THRESHOLD))
        return {
            intensity: interpolate(scrollValue, [0, THRESHOLD], [0, 80], Extrapolation.CLAMP),
        }
    }, [props.scrollY])

    const animatedBlurStyle = useAnimatedStyle(() => {
        "worklet"
        const scrollValue = Math.max(0, Math.min(props.scrollY?.value || 0, THRESHOLD))
        return {
            backgroundColor: interpolateColor(
                scrollValue,
                [0, THRESHOLD],
                ["rgba(0,0,0,0.0)", "rgba(0,0,0,0.1)"],
                "RGB",
            ),
        }
    }, [props.scrollY])

    const memodRenderItem = useMemo(() => props.renderAnimatedItem?.({ scrollY: props.scrollY }), [])

    return (
        <>
            <AnimatedBlur
                tint="dark"
                animatedProps={animatedBlurProps}
                style={[styles.blurContainer, { overflow: "hidden" }]}
            >
                <Animated.View style={animatedBlurStyle}>
                    <Animated.View
                        style={[
                            {
                                flexDirection: "row",
                                paddingHorizontal: 15,
                                justifyContent: "space-between",
                                alignItems: "center",
                            },
                            { paddingTop: insets.top, height: insets.top + 50 },
                            props.containerStyle,
                        ]}
                    >
                        {props.goBack && (
                            <IconButton
                                onPress={throttle(() => navigation.canGoBack() && navigation.goBack(), 250)}
                                icon={props.backIcon || <AntDesign name="arrowleft" size={24} color={Colors.foreground} />}
                            />
                        )}

                        {props.titleAnimatedStyle && props.title && (
                            <Animated.Text style={[styles.animatedTitle, props.titleAnimatedStyle]}>
                                {props.title}
                            </Animated.Text>
                        )}

                        {props.children}

                        <Animated.View style={styles.iconContainer}>
                            {(props.buttons || []).map((button, index) => (
                                <IconButton
                                    style={button.style}
                                    key={index}
                                    onPress={throttle(button.onPress, 250)}
                                    icon={button.icon}
                                />
                            ))}
                        </Animated.View>
                    </Animated.View>

                    {props.renderAnimatedItem && memodRenderItem}
                </Animated.View>
            </AnimatedBlur>

            {(props.animatedTitle || props.animatedValue !== undefined) && <AnimatedContent {...props} />}
        </>
    )
}

interface AnimatedContentProps {
    animated?: boolean
    animatedTitle?: string
    animatedSubtitle?: string
    animatedValue?: number
    animatedValueFormat?: (value: number) => string
    onAnimatedTitleLongPress?: () => void
    subtitleStyles?: StyleProp<TextStyle>
    textContainerStyle?: StyleProp<TextStyle>
    scrollY?: SharedValue<number>
    animatedValueLoading?: boolean
}

const AnimatedContent = memo(({ ...props }: AnimatedContentProps) => {
    const insets = useSafeAreaInsets()

    const animatedContainerStyle = useAnimatedStyle(() => {
        "worklet"
        if (!props.scrollY || !props.animated || typeof props.scrollY.value !== "number") {
            return { marginTop: 15, height: 0 }
        }

        const scrollValue = Math.max(0, Math.min(props.scrollY.value, THRESHOLD))

        return {
            marginTop: interpolate(scrollValue, [0, THRESHOLD], [15, 0], Extrapolation.CLAMP),
            height: 0,
        }
    }, [props.scrollY, props.animated])

    const animatedContentStyle = useAnimatedStyle(() => {
        "worklet"
        if (!props.scrollY || !props.animated || typeof props.scrollY.value !== "number") {
            return {
                transform: [{ scale: 1 }],
                top: insets.top * 2,
                left: 15,
            }
        }

        const N_THRESHOLD = THRESHOLD * 0.8

        const scrollValue = props.scrollY.value
        const clampedValue = Math.max(0, Math.min(scrollValue, N_THRESHOLD))
        const scale = interpolate(clampedValue, [0, N_THRESHOLD], [1, 0.35], Extrapolation.CLAMP)

        return {
            transform: [{ scale }],
            top: interpolate(
                clampedValue,
                [0, N_THRESHOLD],
                [insets.top * 2, insets.top / 2 + 10],
                Extrapolation.CLAMP,
            ),
            left: interpolate(clampedValue, [0, N_THRESHOLD], [15, -115], Extrapolation.CLAMP),
        }
    }, [props.scrollY, props.animated, insets.top])

    const animatedLabelStyle = useAnimatedStyle(() => {
        "worklet"
        if (!props.scrollY || !props.animated || typeof props.scrollY.value !== "number") {
            return { opacity: 1 }
        }

        const scrollValue = Math.max(0, Math.min(props.scrollY.value, 100))

        return {
            opacity: interpolate(scrollValue, [0, 100], [1, 0], Extrapolation.CLAMP),
        }
    }, [props.scrollY, props.animated])

    const displayValue =
        props.animatedValueLoading && props.animatedValue === undefined ? " ..." : (props.animatedValue || 0).toFixed(2)

    return (
        <Animated.View style={[styles.container, props.animated && animatedContainerStyle]}>
            <Animated.View style={[styles.buttonContainer, props.animated && animatedContentStyle]}>
                <Ripple onLongPress={props.onAnimatedTitleLongPress} style={props.textContainerStyle}>
                    {props.animatedValue !== undefined ? (
                        <AnimatedNumber
                            delay={250}
                            value={parseFloat(displayValue)}
                            style={[styles.numericTitle]}
                            formatValue={props.animatedValueFormat || ((value) => `${value.toFixed(2)}`)}
                        />
                    ) : (
                        <Text style={[styles.title]}>{props.animatedTitle}</Text>
                    )}

                    {props.animatedSubtitle && (
                        <Animated.Text
                            style={[styles.subTitle, props.animated && animatedLabelStyle, props.subtitleStyles || {}]}
                        >
                            {props.animatedSubtitle}
                        </Animated.Text>
                    )}
                </Ripple>
            </Animated.View>
        </Animated.View>
    )
})

const styles = StyleSheet.create({
    iconContainer: {
        flex: 1,
        justifyContent: "flex-end",
        flexDirection: "row",
        gap: 10,
        zIndex: 250,
    },
    animatedTitle: {
        color: Colors.foreground,
        fontSize: 16,
        fontWeight: "600",
        letterSpacing: 0.5,
        zIndex: 210,
    },
    blurContainer: {
        position: "absolute",
        top: 0,
        width: Layout.screen.width,
        zIndex: 100,
    },
    subTitle: {
        color: "rgba(255,255,255,0.6)",
        fontSize: 16,
        opacity: 0.8,
        width: Layout.screen.width - 30,
    },
    title: {
        fontSize: 60,
        fontWeight: "bold",
        color: Colors.foreground,
        letterSpacing: 1,
        width: Layout.screen.width - 30,
    },
    numericTitle: {
        fontSize: 60,
        fontWeight: "bold",
        textAlign: "center",
        color: Colors.foreground,
        letterSpacing: 1,
    },
    container: {
        flexDirection: "row",
        marginBottom: 40,
        zIndex: THRESHOLD,
    },
    buttonContainer: {
        position: "absolute",
        zIndex: THRESHOLD,
    },
})

export default memo(Header)
