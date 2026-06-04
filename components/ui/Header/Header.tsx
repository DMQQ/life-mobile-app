import Colors from "@/constants/Colors"
import { FONTS } from "@/constants/Fonts"
import Layout from "@/constants/Layout"
import throttle from "@/utils/functions/throttle"
import { useNavigation } from "@react-navigation/native"
import {
    NativeStackHeaderItem,
    NativeStackHeaderItemMenuAction,
    NativeStackHeaderItemMenuSubmenu,
    NativeStackNavigationOptions,
} from "@react-navigation/native-stack"
import Color from "color"
import { LinearGradient } from "expo-linear-gradient"
import { SFSymbol } from "expo-symbols"
import { Button, Host, Menu, Section } from "@expo/ui/swift-ui"
import { buttonStyle, tint } from "@expo/ui/swift-ui/modifiers"
import { memo, ReactNode, useLayoutEffect, useMemo, useState } from "react"
import { StyleProp, StyleSheet, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"
import Haptic from "react-native-haptic-feedback"
import Animated, { Extrapolation, interpolate, SharedValue, useAnimatedStyle } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import AnimatedNumber from "../AnimatedNumber"
import GlassView from "../GlassView"
import IconButton from "../IconButton/IconButton"

const THRESHOLD = 200

function mapContextMenuItems(
    items: ContextMenuItem[],
): (NativeStackHeaderItemMenuAction | NativeStackHeaderItemMenuSubmenu)[] {
    return items.map((item) => {
        if (item.children && item.children.length > 0) {
            return {
                type: "submenu" as const,
                label: item.title,
                icon: item.systemImage ? { type: "sfSymbol" as const, name: item.systemImage } : undefined,
                items: mapContextMenuItems(item.children),
            }
        }
        return {
            type: "action" as const,
            label: item.title,
            icon: item.systemImage ? { type: "sfSymbol" as const, name: item.systemImage } : undefined,
            onPress: item.onPress ?? (() => {}),
            destructive: item.destructive,
            state: item.checked ? ("on" as const) : ("off" as const),
        }
    })
}

function ConfirmHeaderButton({ button }: { button: HeaderItem }) {
    const sfSymbol = typeof button.icon === "string" ? (button.icon as SFSymbol) : undefined

    const triggerModifiers = [...(button.tintColor ? [tint(button.tintColor)] : [])]

    const menuMessage = button.confirmTitle
        ? `This will ${button.confirmTitle.toLowerCase()}. Are you sure you want to continue?`
        : "This action is irreversible. Are you sure you want to continue?"

    return (
        <Host matchContents>
            <Menu label={""} systemImage={sfSymbol} modifiers={triggerModifiers}>
                <Section title={menuMessage}>
                    <Button
                        role="destructive"
                        label="Discard Changes"
                        onPress={() => {
                            button.onPress?.()
                            Haptic.trigger("impactMedium")
                        }}
                        modifiers={[buttonStyle("bordered")]}
                    />
                </Section>
            </Menu>
        </Host>
    )
}

function mapHeaderItem(button: HeaderItem): NativeStackHeaderItem {
    if (button.children) {
        return { type: "custom", element: button.children as React.ReactElement }
    }

    const sfIcon =
        typeof button.icon === "string" ? { type: "sfSymbol" as const, name: button.icon as SFSymbol } : undefined

    if (button.confirm) {
        return {
            type: "custom",
            element: <ConfirmHeaderButton button={button} />,
        }
    }

    if (button.contextMenu) {
        return {
            type: "menu",
            label: "",
            icon: sfIcon,
            tintColor: button.tintColor,
            disabled: button.disabled,
            menu: { items: mapContextMenuItems(button.contextMenu.items) },
            identifier: sfIcon ? sfIcon.name : undefined,
        }
    }

    if (sfIcon) {
        return {
            type: "button",
            label: "",
            icon: sfIcon,
            tintColor: button.tintColor,
            disabled: button.disabled,
            onPress: () => {
                button.onPress?.()
                Haptic.trigger("impactLight")
            },
            identifier: sfIcon.name,
        }
    }

    return {
        type: "custom",
        element: (
            <IconButton
                style={button.style}
                onPress={throttle(() => {
                    button.onPress?.()
                    Haptic.trigger("impactLight")
                }, 250)}
                icon={button.icon}
            />
        ),
    }
}

export interface ContextMenuItem {
    title: string
    systemImage?: SFSymbol
    onPress?: () => void
    destructive?: boolean
    checked?: boolean
    children?: ContextMenuItem[]
    confirm?: boolean
}

export interface HeaderItem {
    onPress?: () => void
    icon?: SFSymbol | React.ReactNode
    style?: StyleProp<ViewStyle>

    standalone?: boolean
    confirm?: boolean
    confirmTitle?: string

    position?: "left" | "right"

    tintColor?: string
    disabled?: boolean
    contextMenu?: {
        items: ContextMenuItem[]
    }

    children?: React.ReactNode
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
    onAnimatedTitlePress?: () => void
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

    screenOptions?: NativeStackNavigationOptions
}

function Header({ shadow = true, ...props }: HeaderProps) {
    const insets = useSafeAreaInsets()
    const navigation = useNavigation()

    const memodRenderItem = useMemo(() => {
        return props.renderAnimatedItem?.({ scrollY: props.scrollY })
    }, [props.renderAnimatedItem])

    useLayoutEffect(() => {
        const buttons = (props.buttons ?? []).filter(Boolean) as HeaderItem[]
        const rightButtons = buttons.filter((b) => b.position !== "left")
        const leftButtons = buttons.filter((b) => b.position === "left")

        const hasLeftItems =
            (!!props.goBack && props.backIcon !== undefined) || !!props.children || leftButtons.length > 0

        navigation.setOptions({
            headerShown: true,
            headerShadowVisible: true,
            headerTransparent: true,
            headerStyle: { backgroundColor: "transparent" },
            title: props.animatedTitle === undefined && props.title !== undefined ? props.title : "",
            headerBackVisible: !!props.goBack && props.backIcon === undefined && !props.children,
            headerBackTitle: "",
            headerBackTitleVisible: false,
            headerBackButtonDisplayMode: "minimal",
            unstable_headerRightItems: () => rightButtons.map(mapHeaderItem),

            unstable_headerLeftItems: hasLeftItems
                ? () => {
                      const items: NativeStackHeaderItem[] = []

                      if (props.goBack && props.backIcon !== undefined) {
                          items.push({
                              type: "custom",
                              element: (
                                  <IconButton
                                      onPress={throttle(() => {
                                          Haptic.trigger("impactLight")
                                          navigation.canGoBack() && navigation.goBack()
                                      }, 250)}
                                      icon={props.backIcon}
                                  />
                              ),
                          })
                      }

                      if (props.children) {
                          items.push({ type: "custom", element: props.children as React.ReactElement })
                      }

                      leftButtons.forEach((b) => items.push(mapHeaderItem(b)))

                      return items
                  }
                : undefined,

            ...props.screenOptions,
        })
    }, [
        props.buttons,
        props.children,
        props.goBack,
        props.title,
        props.animatedTitle,
        props.backIcon,
        navigation,
        props.screenOptions,
    ])

    return (
        <View style={[styles.blurContainer]}>
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
                    {props.titleAnimatedStyle && props.title && (
                        <Animated.Text style={[styles.animatedTitle, props.titleAnimatedStyle]}>
                            {props.title}
                        </Animated.Text>
                    )}

                    {(props.animatedTitle || props.animatedValue !== undefined) && <AnimatedContent {...props} />}
                </View>

                {props.renderAnimatedItem && memodRenderItem}
            </Animated.View>
        </View>
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
                    top: insets.top * 1.25,
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
                    [initialTitleFontSize * 1.15, 20],
                    Extrapolation.CLAMP,
                ),
            }
        })

        const displayValue =
            props.animatedValueLoading && props.animatedValue === undefined
                ? " ..."
                : (props.animatedValue || 0).toFixed(2)

        return (
            <Animated.View
                pointerEvents={props.onAnimatedTitlePress ? "box-none" : "none"}
                style={[{ position: "absolute" }, props.textContainerStyle, animatedContentStyle]}
            >
                {props.animatedValue !== undefined ? (
                    <AnimatedNumber
                        delay={250}
                        value={parseFloat(displayValue)}
                        style={[styles.numericTitle, animatedFontSize]}
                        formatValue={props.animatedValueFormat}
                    />
                ) : props.onAnimatedTitlePress ? (
                    <TouchableOpacity onPress={props.onAnimatedTitlePress} activeOpacity={0.7}>
                        <Animated.Text
                            numberOfLines={initialNumberOfLines}
                            style={[styles.title, props.titleAnimatedStyle, animatedFontSize]}
                        >
                            {props.animatedTitle}
                        </Animated.Text>
                    </TouchableOpacity>
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
            </Animated.View>
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
        fontFamily: FONTS.semibold,
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
        fontFamily: FONTS.bold,
        color: Colors.foreground,
        letterSpacing: 1,
    },
    numericTitle: {
        fontSize: 60,
        fontFamily: FONTS.bold,
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
