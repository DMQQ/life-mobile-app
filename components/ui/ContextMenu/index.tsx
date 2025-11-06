import { BlurView } from "expo-blur"
import React, { cloneElement, useMemo, useRef, useState } from "react"
import { Dimensions, Modal, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native"
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    interpolate,
    Easing,
    useAnimatedProps,
} from "react-native-reanimated"
import { GlassView } from "expo-glass-effect"
import { SFSymbol, SymbolView } from "expo-symbols"
import Colors from "@/constants/Colors"
import Color from "color"
import Feedback from "react-native-haptic-feedback"

interface ContextMenuItemProps {
    text: string
    onPress: () => void
    destructive?: boolean
    disabled?: boolean
    leading?: SFSymbol
    trailing?: SFSymbol
    children?: React.ReactNode
    style?: StyleProp<ViewStyle>
}

interface ContextMenuProps {
    children: React.ReactNode
    items: ContextMenuItemProps[]
    anchor?: "left" | "right" | "middle"
}

const ContextMenuItem = ({ text, onPress, destructive, disabled, leading, trailing, style }: ContextMenuItemProps) => {
    const iconColor = destructive
        ? styles.destructiveText.color
        : disabled
          ? styles.disabledText.color
          : styles.menuItemText.color

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={{ padding: 15, flexDirection: "row", gap: 5, alignItems: "center" }}
        >
            {leading && (
                <View style={styles.leading}>
                    <SymbolView name={leading} size={20} tintColor={iconColor} />
                </View>
            )}
            <Text style={[styles.menuItemText, destructive && styles.destructiveText, disabled && styles.disabledText]}>
                {text}
            </Text>
            {trailing && (
                <View style={styles.trailing}>
                    <SymbolView name={trailing} size={20} tintColor={iconColor} />
                </View>
            )}
        </Pressable>
    )
}

const MENU_WIDTH = 220
const SCREEN_PADDING = 16

const tintColor = Color(Colors.primary_light).alpha(0.75).string()

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView)

export default function ContextMenu({ children, items, anchor = "middle" }: ContextMenuProps) {
    const viewRef = useRef<View | null>(null)
    const [absolutePosition, setAbsolutePosition] = useState({ x: 0, y: 0, w: 0, h: 0 })
    const [isExpanded, setIsExpanded] = useState(false)

    const scale = useSharedValue(1)
    const progress = useSharedValue(0)

    const clonedChildren = useMemo(() => {
        const childElement = children as React.ReactElement

        //@ts-ignore
        const originalOnPress = childElement.props.onPress
        //@ts-ignore
        const originalOnLongPress = childElement.props.onLongPress

        return cloneElement(children as React.ReactElement, {
            //@ts-ignore
            onLongPress() {
                Feedback.trigger("impactLight")
                viewRef.current?.measureInWindow((x, y, w, h) => {
                    setAbsolutePosition({ x, y, w, h })
                    setIsExpanded(true)
                    scale.value = withSpring(1, { damping: 20, stiffness: 300 })
                    progress.value = withSpring(1, { damping: 18, stiffness: 200, mass: 0.9 })
                })

                originalOnLongPress?.()
            },

            //@ts-ignore
            onPress() {
                setIsExpanded(false)
                originalOnPress?.()
            },
        })
    }, [children, scale, progress])

    const innerContainer = useMemo(() => {
        return {
            position: "absolute",
            top: absolutePosition.y,
            left: absolutePosition.x,
            width: absolutePosition.w,
            height: absolutePosition.h,
            zIndex: 1000,
        } as StyleProp<ViewStyle>
    }, [absolutePosition])

    const finalMenuGeometry = useMemo(() => {
        const screenHeight = Dimensions.get("window").height
        const screenWidth = Dimensions.get("window").width
        const ITEM_HEIGHT = 50
        const SEPARATOR_HEIGHT = StyleSheet.hairlineWidth
        const MENU_VERTICAL_PADDING = 10

        const contentHeight =
            items.length * ITEM_HEIGHT + (items.length > 0 ? (items.length - 1) * SEPARATOR_HEIGHT : 0)
        const menuHeight = contentHeight + MENU_VERTICAL_PADDING

        const spaceBelow = screenHeight - (absolutePosition.y + absolutePosition.h)
        const showAbove = spaceBelow < menuHeight && absolutePosition.y > menuHeight

        let menuLeft: number

        switch (anchor) {
            case "left":
                menuLeft = absolutePosition.x
                break
            case "right":
                menuLeft = absolutePosition.x + absolutePosition.w - MENU_WIDTH
                break
            case "middle":
            default:
                menuLeft = absolutePosition.x + absolutePosition.w / 2 - MENU_WIDTH / 2
                break
        }

        if (menuLeft < SCREEN_PADDING) {
            menuLeft = SCREEN_PADDING
        }
        if (menuLeft + MENU_WIDTH > screenWidth - SCREEN_PADDING) {
            menuLeft = screenWidth - MENU_WIDTH - SCREEN_PADDING
        }

        const menuTop = showAbove ? absolutePosition.y - menuHeight - 12 : absolutePosition.y + absolutePosition.h + 8

        return {
            left: menuLeft,
            top: menuTop,
            width: MENU_WIDTH,
            height: menuHeight,
        }
    }, [absolutePosition, items.length, anchor])

    const handleClose = () => {
        scale.value = withTiming(1, { duration: 150 })
        progress.value = withTiming(0, { duration: 200, easing: Easing.in(Easing.cubic) })
        setTimeout(() => {
            setIsExpanded(false)
        }, 200)
    }

    const handleItemPress = (onPress: () => void) => {
        setIsExpanded(false)
        scale.value = 0.01
        progress.value = 0
        // handleClose()
        // setTimeout(() => onPress(), 150)
        onPress()
    }

    const showAbove = useMemo(() => {
        const screenHeight = Dimensions.get("window").height
        const spaceBelow = screenHeight - (absolutePosition.y + absolutePosition.h)
        return spaceBelow < finalMenuGeometry.height && absolutePosition.y > finalMenuGeometry.height
    }, [absolutePosition, finalMenuGeometry])

    const animatedMenuWrapperStyles = useAnimatedStyle(() => {
        const finalX = finalMenuGeometry.left
        const finalY = finalMenuGeometry.top
        const finalW = finalMenuGeometry.width
        const finalH = finalMenuGeometry.height

        let anchorX: number
        switch (anchor) {
            case "left":
                anchorX = absolutePosition.x
                break
            case "right":
                anchorX = absolutePosition.x + absolutePosition.w
                break
            case "middle":
            default:
                anchorX = absolutePosition.x + absolutePosition.w / 2
                break
        }

        const anchorY = showAbove ? absolutePosition.y : absolutePosition.y + absolutePosition.h

        const currentScale = interpolate(progress.value, [0, 1], [0, 1])

        let startX: number
        switch (anchor) {
            case "left":
                startX = anchorX
                break
            case "right":
                startX = anchorX - finalW
                break
            case "middle":
            default:
                startX = anchorX - finalW / 2
                break
        }

        const startY = showAbove ? anchorY - finalH : anchorY

        const positionProgress = interpolate(progress.value, [0, 0.8, 1], [0, 0.95, 1])
        const interpolatedX = interpolate(positionProgress, [0, 1], [startX, finalX])
        const interpolatedY = interpolate(positionProgress, [0, 1], [startY, finalY])

        let transformOriginX: number
        switch (anchor) {
            case "left":
                transformOriginX = 0
                break
            case "right":
                transformOriginX = 1
                break
            case "middle":
            default:
                transformOriginX = 0.5
                break
        }

        const transformOriginY = showAbove ? 1 : 0

        const opacity = interpolate(progress.value, [0, 0.1, 1], [0, 0.8, 1])

        return {
            position: "absolute",
            top: interpolatedY,
            left: interpolatedX,
            width: finalW,
            height: finalH,
            opacity,
            zIndex: 998,
            transform: [{ scale: currentScale }],
            transformOrigin: `${transformOriginX * 100}% ${transformOriginY * 100}%`,
        }
    })

    const animatedBlur = useAnimatedProps(() => ({
        intensity: interpolate(progress.value, [0, 1], [0, 20]),
    }))

    return (
        <View ref={viewRef}>
            {clonedChildren}

            {isExpanded && (
                <Modal visible={isExpanded} transparent statusBarTranslucent>
                    <AnimatedBlurView
                        animatedProps={animatedBlur}
                        style={[StyleSheet.absoluteFillObject]}
                        intensity={20}
                        tint="dark"
                    />

                    <Pressable style={{ flex: 1 }} onPress={handleClose}>
                        <Animated.View style={[innerContainer]}>{clonedChildren}</Animated.View>

                        {absolutePosition.w > 0 && (
                            <Animated.View
                                style={[
                                    animatedMenuWrapperStyles,
                                    { overflow: "hidden", borderRadius: 20, borderWidth: 1, borderColor: "#222222ff" },
                                ]}
                            >
                                <GlassView
                                    isInteractive
                                    glassEffectStyle="regular"
                                    style={[styles.menu]}
                                    tintColor={tintColor}
                                >
                                    {items.map((item, index) => (
                                        <View key={index}>
                                            {index > 0 && <View style={styles.separator} />}
                                            <ContextMenuItem {...item} onPress={() => handleItemPress(item.onPress)} />
                                        </View>
                                    ))}
                                </GlassView>
                            </Animated.View>
                        )}
                    </Pressable>
                </Modal>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    menu: {
        borderRadius: 20,
        overflow: "hidden",
        paddingVertical: 5,
        paddingHorizontal: 5,
        zIndex: 1000,
    },
    separator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: "rgba(255, 255, 255, 0.3)",
        marginHorizontal: 10,
    },
    menuItemText: {
        flex: 1,
        fontSize: 17,
        color: "#fff",
        fontWeight: "400",
    },
    destructiveText: {
        color: "#ff453a",
    },
    disabledText: {
        color: "#8e8e93",
    },
    leading: {
        marginRight: 12,
        width: 24, // Give a fixed width to align text
        alignItems: "center", // Center icon
    },
    trailing: {
        marginLeft: 12,
        width: 24, // Give a fixed width to align text
        alignItems: "center", // Center icon
    },
})
