import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import throttle from "@/utils/functions/throttle"
import { AntDesign } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import Color from "color"
import { BlurView } from "expo-blur"
import { memo, ReactNode, useMemo } from "react"
import { StyleProp, StyleSheet, TextStyle, View, ViewStyle } from "react-native"
import Haptic from "react-native-haptic-feedback"
import Ripple from "react-native-material-ripple"
import Animated, {
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

const AnimatedRipple = Animated.createAnimatedComponent(Ripple)

const AnimatedBlur = Animated.createAnimatedComponent(BlurView)

const THRESHOLD = 200

interface HeaderProps {
    buttons?: {
        onPress: () => void
        icon: JSX.Element | React.ReactNode
        style?: StyleProp<ViewStyle>
    }[]
    title?: string
    goBack?: boolean
    titleAnimatedStyle?: StyleProp<TextStyle>
    backIcon?: JSX.Element
    children?: JSX.Element
    containerStyle?: StyleProp<ViewStyle>
    scrollY?: SharedValue<number>
    animated?: boolean
    animatedTitle?: string
    animatedSubtitle?: string
    animatedValue?: number
    /**
     * This is used to indicate if the animated value is loading.
     */
    animatedValueLoading?: boolean
    /**
     *
     * @param value This is used to format the animated value displayed in the header.
     * @returns
     */
    animatedValueFormat?: (value: number) => string
    /**
     *
     * @returns This is used to handle long press on the animated title.
     */
    onAnimatedTitleLongPress?: () => void
    /**
     * This is used to style the animated title.
     */
    subtitleStyles?: StyleProp<TextStyle>
    /**
     * This is used to style the animated title and subtitle.
     */
    initialHeight?: number
    /**
     * This is used to style the text container of the animated title and subtitle.
     */
    textContainerStyle?: StyleProp<TextStyle>
    /**
     * This is used to render an animated item below the header.
     */
    renderAnimatedItem?: (props: { scrollY: SharedValue<number> | undefined }) => JSX.Element | ReactNode | null
    /**
     * For screen modals, this will adjust the header
     */
    isScreenModal?: boolean

    /*
     * For animated title, this is used to limit the number of lines
     * for the title when it is animated.
     */
    initialNumberOfLines?: number

    /**
     * This is used to set the initial font size of the animated title.
     */
    initialTitleFontSize?: number
}

const blurOverlayColor = Color(Colors.primary).alpha(0.1).toString()

function Header(props: HeaderProps) {
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
                ["rgba(0,0,0,0.0)", blurOverlayColor],
                "RGB",
            ),
        }
    }, [props.scrollY])

    const memodRenderItem = useMemo(() => {
        return props.renderAnimatedItem?.({ scrollY: props.scrollY })
    }, [props.renderAnimatedItem])

    return (
        <AnimatedBlur tint="dark" animatedProps={animatedBlurProps} style={[styles.blurContainer]}>
            <Animated.View style={[animatedBlurStyle, { position: "relative" }]}>
                <View
                    style={[
                        {
                            flexDirection: "row",
                            paddingHorizontal: 15,
                            justifyContent: "space-between",
                            alignItems: "center",
                        },
                        {
                            paddingTop: !props.isScreenModal ? insets.top : 0,
                            height: !props.isScreenModal ? insets.top + 50 : props.initialHeight || 60,
                        },
                        props.containerStyle,
                    ]}
                >
                    {props.goBack && (
                        <IconButton
                            onPress={throttle(() => {
                                Haptic.trigger("impactLight")
                                navigation.canGoBack() && navigation.goBack()
                            }, 250)}
                            icon={props.backIcon || <AntDesign name="arrow-left" size={24} color={Colors.foreground} />}
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
                                onPress={throttle(() => {
                                    button.onPress()
                                    Haptic.trigger("impactLight")
                                }, 250)}
                                icon={button.icon}
                            />
                        ))}
                    </Animated.View>
                </View>

                {props.renderAnimatedItem && memodRenderItem}

                {(props.animatedTitle || props.animatedValue !== undefined) && <AnimatedContent {...props} />}
            </Animated.View>
        </AnimatedBlur>
    )
}

const AnimatedContent = memo(
    ({ isScreenModal = false, initialTitleFontSize = 60, initialNumberOfLines = 10, ...props }: HeaderProps) => {
        const insets = useSafeAreaInsets()

        const animatedContentStyle = useAnimatedStyle(() => {
            "worklet"
            if (!props.scrollY || !props.animated || typeof props.scrollY.value !== "number") {
                return {
                    transform: [{ scale: 1 }],
                    top: insets.top * 2,
                    left: 15,
                }
            }

            const scrollValue = props.scrollY.value
            const clampedValue = Math.max(0, Math.min(scrollValue, THRESHOLD))

            return {
                top: interpolate(
                    clampedValue,
                    [0, THRESHOLD],
                    [insets.top * (isScreenModal ? 2 : 3), isScreenModal ? 20 : insets.top + 15],
                    Extrapolation.CLAMP,
                ),

                width: interpolate(
                    clampedValue,
                    [0, THRESHOLD],
                    [Layout.screen.width - 30, Layout.screen.width * 0.65],
                    Extrapolation.CLAMP,
                ),

                left: 15,
            }
        }, [props.scrollY, props.animated, insets.top, isScreenModal])

        const animatedLabelStyle = useAnimatedStyle(() => {
            "worklet"
            if (!props.scrollY || !props.animated || typeof props.scrollY.value !== "number") {
                return { opacity: 1 }
            }

            const scrollValue = Math.max(0, Math.min(props.scrollY.value, 100))

            return {
                opacity: interpolate(scrollValue, [0, 100], [1, 0], Extrapolation.CLAMP),

                display: scrollValue > 100 ? "none" : "flex",
            }
        }, [props.scrollY, props.animated])

        const animatedFontSize = useAnimatedStyle(() => {
            return {
                fontSize: interpolate(
                    props.scrollY?.value || 0,
                    [0, THRESHOLD],
                    [initialTitleFontSize, 20],
                    Extrapolation.CLAMP,
                ),
                lineHeight: interpolate(
                    props.scrollY?.value || 0,
                    [0, THRESHOLD],
                    [initialTitleFontSize * 0.95, 24],
                    Extrapolation.CLAMP,
                ),
            }
        })

        const displayValue =
            props.animatedValueLoading && props.animatedValue === undefined
                ? " ..."
                : (props.animatedValue || 0).toFixed(2)

        return (
            <AnimatedRipple
                onLongPress={props.onAnimatedTitleLongPress}
                style={[{ position: "absolute" }, props.textContainerStyle, props.animated && animatedContentStyle]}
            >
                {props.animatedValue !== undefined ? (
                    <AnimatedNumber
                        delay={250}
                        value={parseFloat(displayValue)}
                        style={[styles.numericTitle, animatedFontSize]}
                        formatValue={props.animatedValueFormat || ((value) => `${value.toFixed(2)}`)}
                    />
                ) : (
                    <Animated.Text
                        numberOfLines={initialNumberOfLines}
                        style={[styles.title, props.titleAnimatedStyle, animatedFontSize]}
                    >
                        {props.animatedTitle}
                    </Animated.Text>
                )}

                {props.animatedSubtitle && (
                    <Animated.Text
                        style={[styles.subTitle, props.animated && animatedLabelStyle, props.subtitleStyles || {}]}
                    >
                        {props.animatedSubtitle}
                    </Animated.Text>
                )}
            </AnimatedRipple>
        )
    },
)

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
        color: Colors.secondary_light_2,
        fontSize: 13,
        width: Layout.screen.width - 30,
    },
    title: {
        fontSize: 60,
        fontWeight: "bold",
        color: Colors.foreground,
        letterSpacing: 1,
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
