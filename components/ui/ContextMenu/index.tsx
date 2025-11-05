import { BlurView } from "expo-blur"
import React, { cloneElement, useMemo, useRef, useState } from "react"
import { Dimensions, Modal, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native"
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    interpolate,
} from "react-native-reanimated"
import GlassView from "../GlassView"
import { SFSymbol, SymbolView } from "expo-symbols"

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

export default function ContextMenu({ children, items, anchor = "middle" }: ContextMenuProps) {
    const viewRef = useRef<View | null>(null)
    const [absolutePosition, setAbsolutePosition] = useState({ x: 0, y: 0, w: 0, h: 0 })
    const [isExpanded, setIsExpanded] = useState(false)

    const scale = useSharedValue(1)
    const progress = useSharedValue(0)

    const animatedChildStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        }
    })

    const clonedChildren = useMemo(() => {
        const childElement = children as React.ReactElement

        //@ts-ignore
        const originalOnPress = childElement.props.onPress
        //@ts-ignore
        const originalOnLongPress = childElement.props.onLongPress

        return cloneElement(children as React.ReactElement, {
            //@ts-ignore
            onLongPress() {
                console.log("ContextMenu: onLongPress")
                viewRef.current?.measureInWindow((x, y, w, h) => {
                    setAbsolutePosition({ x, y, w, h })
                    setIsExpanded(true)
                    scale.value = withSpring(1, { damping: 20, stiffness: 300 })
                    progress.value = withSpring(1, { damping: 12, stiffness: 200, mass: 0.7 })
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
            zIndex: 1001,
        } as StyleProp<ViewStyle>
    }, [absolutePosition])

    const finalMenuGeometry = useMemo(() => {
        const screenHeight = Dimensions.get("window").height - 80
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
        progress.value = withTiming(0, { duration: 200 })
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

    const animatedMenuWrapperStyles = useAnimatedStyle(() => {
        const startX = absolutePosition.x + absolutePosition.w / 2
        const startY = absolutePosition.y + absolutePosition.h / 2

        const finalX = finalMenuGeometry.left
        const finalY = finalMenuGeometry.top
        const finalW = finalMenuGeometry.width
        const finalH = finalMenuGeometry.height

        const initialScale = 0.01
        const currentScale = interpolate(progress.value, [0, 1], [initialScale, 1])

        const interpolatedX = interpolate(progress.value, [0, 1], [startX - (finalW * initialScale) / 2, finalX])
        const interpolatedY = interpolate(progress.value, [0, 1], [startY - (finalH * initialScale) / 2, finalY])

        const opacity = interpolate(progress.value, [0, 0.3, 1], [0, 0.8, 1])

        return {
            position: "absolute",
            top: interpolatedY,
            left: interpolatedX,
            width: finalW,
            height: finalH,
            opacity,
            zIndex: 1002,
            transform: [{ scale: currentScale }],
        }
    })

    return (
        <View ref={viewRef}>
            {clonedChildren}

            {isExpanded && (
                <Modal visible transparent statusBarTranslucent>
                    <BlurView style={[StyleSheet.absoluteFillObject]} intensity={25} tint="dark" />

                    <Pressable style={{ flex: 1 }} onPress={handleClose}>
                        <Animated.View style={[innerContainer, animatedChildStyle]}>{clonedChildren}</Animated.View>

                        {absolutePosition.w > 0 && (
                            <Animated.View
                                style={[animatedMenuWrapperStyles, { overflow: "hidden", borderRadius: 20 }]}
                            >
                                <GlassView style={[styles.menu]}>
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
