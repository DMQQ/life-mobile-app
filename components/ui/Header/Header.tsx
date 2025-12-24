import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import throttle from "@/utils/functions/throttle"
import { AntDesign } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import Color from "color"
import { memo, ReactNode, useMemo } from "react"
import { StyleProp, StyleSheet, TextStyle, View, ViewStyle } from "react-native"
import Haptic from "react-native-haptic-feedback"
import Ripple from "react-native-material-ripple"
import Animated, { Extrapolation, interpolate, SharedValue, useAnimatedStyle } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import AnimatedNumber from "../AnimatedNumber"
import IconButton from "../IconButton/IconButton"
import { GlassContainer } from "expo-glass-effect"
import { LinearGradient } from "expo-linear-gradient"
import GlassView from "../GlassView"
import ContextMenuView, { type ContextMenuAction } from "react-native-context-menu-view"

const AnimatedRipple = Animated.createAnimatedComponent(Ripple)

const THRESHOLD = 200

export interface ContextMenuItem {
    title: string
    systemImage?: any
    onPress?: () => void
    destructive?: boolean
    checked?: boolean
    children?: ContextMenuItem[]
}

export interface HeaderItem {
    onPress: () => void
    icon: React.ReactNode
    style?: StyleProp<ViewStyle>

    standalone?: boolean

    position?: "left" | "right"

    tintColor?: string
    contextMenu?: {
        items: ContextMenuItem[]
    }
}

interface HeaderProps {
    buttons?: (HeaderItem | undefined)[]
    title?: string
    goBack?: boolean
    titleAnimatedStyle?: StyleProp<TextStyle>
    backIcon?: React.ReactNode
    children?: React.ReactNode
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
    renderAnimatedItem?: (props: { scrollY: SharedValue<number> | undefined }) => ReactNode | null
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

    shadow?: boolean
}

function Header({ shadow = true, ...props }: HeaderProps) {
    const insets = useSafeAreaInsets()
    const navigation = useNavigation()

    const memodRenderItem = useMemo(() => {
        return props.renderAnimatedItem?.({ scrollY: props.scrollY })
    }, [props.renderAnimatedItem])

    const standaloneButtons = useMemo(() => {
        return (props.buttons || []).filter(Boolean).reduce(
            (acc, button) => {
                if (button!.standalone) {
                    if (button!.position === "left") {
                        acc.left.push(button!)
                    } else if (button!.position === "right") {
                        acc.right.push(button!)
                    } else {
                        acc.left.push(button!)
                    }
                }

                return acc
            },
            {
                left: [] as HeaderItem[],
                right: [] as HeaderItem[],
            },
        )
    }, [props.buttons])

    const regularButtons = useMemo(() => {
        {
            return (props.buttons || []).filter(Boolean).filter((button) => !button!.standalone)
        }
    }, [props.buttons])

    return (
        <GlassContainer style={[styles.blurContainer]}>
            {shadow && (
                <LinearGradient
                    colors={[
                        Color("#000").alpha(0.8).toString(),
                        Color(Colors.primary).alpha(0.6).toString(),
                        Color(Colors.primary).alpha(0.15).toString(),
                        "transparent",
                    ]}
                    style={{
                        position: "absolute",
                        top: 0,
                        width: Layout.screen.width,
                        height: 300,
                    }}
                    pointerEvents="none"
                />
            )}
            <Animated.View style={{ position: "relative" }}>
                <View
                    style={[
                        {
                            flexDirection: "row",
                            paddingHorizontal: 15,
                            justifyContent: props.goBack || props.title ? "space-between" : "flex-end",
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
                        <GlassView style={styles.iconContainer}>
                            <IconButton
                                onPress={throttle(() => {
                                    Haptic.trigger("impactLight")
                                    navigation.canGoBack() && navigation.goBack()
                                }, 250)}
                                icon={
                                    props.backIcon || (
                                        <AntDesign name="arrow-left" size={20} color={Colors.foreground} />
                                    )
                                }
                            />
                        </GlassView>
                    )}

                    {props.titleAnimatedStyle && props.title && (
                        <Animated.Text style={[styles.animatedTitle, props.titleAnimatedStyle]}>
                            {props.title}
                        </Animated.Text>
                    )}

                    {props.children}

                    <View style={{ borderRadius: 100, overflow: "hidden", flexDirection: "row", gap: 10 }}>
                        {standaloneButtons.left.map((button, index) => (
                            <View key={index} style={{ overflow: "hidden", borderRadius: 100 }}>
                                <GlassView style={styles.iconContainer}>
                                    <HeaderIconButton button={button!} index={index} />
                                </GlassView>
                            </View>
                        ))}

                        <GlassView style={styles.iconContainer}>
                            {(regularButtons || []).map((button, index) => {
                                return <HeaderIconButton key={index} button={button!} index={index} />
                            })}
                        </GlassView>

                        {standaloneButtons.right.map((button, index) => (
                            <View key={index} style={{ overflow: "hidden", borderRadius: 100 }}>
                                <GlassView
                                    style={styles.iconContainer}
                                    {...(button.tintColor && { tintColor: button.tintColor })}
                                >
                                    <HeaderIconButton button={button!} index={index} />
                                </GlassView>
                            </View>
                        ))}
                    </View>
                </View>

                {props.renderAnimatedItem && memodRenderItem}

                {(props.animatedTitle || props.animatedValue !== undefined) && <AnimatedContent {...props} />}
            </Animated.View>
        </GlassContainer>
    )
}

const convertMenuItemToAction = (item: ContextMenuItem): ContextMenuAction => {
    const action: ContextMenuAction = {
        title: item.checked ? `✓ ${item.title}` : item.title,
        systemIcon: item.systemImage,
    }

    if (item.destructive) {
        action.destructive = true
    }

    if (item.children && item.children.length > 0) {
        action.actions = item.children.map((child) => convertMenuItemToAction(child))
    }

    return action
}

const HeaderIconButton = memo(({ button, index }: { button: HeaderItem; index: number }) => {
    const handleMenuPress = (e: any) => {
        const indexPath = e.nativeEvent.indexPath || [e.nativeEvent.index]
        const items = button.contextMenu?.items || []

        let currentItem: ContextMenuItem | undefined = undefined
        let currentLevel = items

        for (const idx of indexPath) {
            currentItem = currentLevel[idx]
            if (!currentItem) return
            if (currentItem.children && currentItem.children.length > 0) {
                currentLevel = currentItem.children
            }
        }

        if (currentItem?.onPress) {
            currentItem.onPress()
            Haptic.trigger("impactLight")
        }
    }

    if (button.contextMenu) {
        return (
            <ContextMenuView
                actions={button.contextMenu.items.map((item) => convertMenuItemToAction(item))}
                onPress={handleMenuPress}
                dropdownMenuMode={true}
            >
                <IconButton
                    style={button.style}
                    onPress={throttle(() => {
                        button.onPress()
                        Haptic.trigger("impactLight")
                    }, 250)}
                    icon={button.icon}
                />
            </ContextMenuView>
        )
    } else {
        return (
            <IconButton
                style={button.style}
                key={index}
                onPress={throttle(() => {
                    button.onPress()
                    Haptic.trigger("impactLight")
                }, 250)}
                icon={button.icon}
            />
        )
    }
})

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
    glassButton: {
        borderRadius: 100,
        padding: 10,
    },
    iconContainer: {
        flexDirection: "row",
        gap: 8,
        zIndex: 250,
        padding: 8.5,
        borderRadius: 100,
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
