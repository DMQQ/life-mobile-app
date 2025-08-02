import { ReactElement, cloneElement, forwardRef, useImperativeHandle, useRef, useState } from "react"
import { Dimensions, Modal, TouchableOpacity, View } from "react-native"
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated"

interface FloatingMenuProps {
    children: ReactElement
    menuContent: ReactElement
    onVisibilityChange?: (visible: boolean) => void
    menuWidth?: number
    menuHeight?: number
}

interface FloatingMenuRef {
    close: () => void
}

const FloatingMenu = forwardRef<FloatingMenuRef, FloatingMenuProps>(
    ({ children, menuContent, onVisibilityChange, menuWidth = 300, menuHeight = 400 }, ref) => {
        const [isOpen, setIsOpen] = useState(false)
        const [anchorLayout, setAnchorLayout] = useState({ x: 0, y: 0, width: 0, height: 0 })
        const anchorRef = useRef<View>(null)

        const opacity = useSharedValue(0)
        const scale = useSharedValue(0.3)
        const translateX = useSharedValue(0)
        const translateY = useSharedValue(0)

        const showMenu = () => {
            setIsOpen(true)
            opacity.value = withTiming(1, { duration: 200 })
            scale.value = withSpring(1, {
                damping: 22,
                stiffness: 250,
                mass: 0.8,
            })
            translateX.value = withSpring(0, {
                damping: 25,
                stiffness: 280,
            })
            translateY.value = withSpring(0, {
                damping: 25,
                stiffness: 280,
            })
            onVisibilityChange?.(true)
        }

        const hideMenu = () => {
            const anchorCenterX = anchorLayout.x + anchorLayout.width / 2
            const anchorCenterY = anchorLayout.y + anchorLayout.height / 2

            // Get current menu position
            const { width: screenWidth, height: screenHeight } = Dimensions.get("window")
            const padding = 16
            const spaceBelow = screenHeight - (anchorLayout.y + anchorLayout.height)
            const spaceAbove = anchorLayout.y
            const spaceRight = screenWidth - anchorLayout.x
            const spaceLeft = anchorLayout.x + anchorLayout.width

            let menuTop = anchorLayout.y + anchorLayout.height + 8
            if (spaceBelow < menuHeight + padding && spaceAbove > menuHeight + padding) {
                menuTop = anchorLayout.y - menuHeight - 8
            } else if (spaceBelow < menuHeight + padding) {
                menuTop = Math.max(padding, screenHeight - menuHeight - padding)
            }

            let menuLeft = anchorLayout.x
            if (spaceRight < menuWidth + padding && spaceLeft > menuWidth + padding) {
                menuLeft = anchorLayout.x + anchorLayout.width - menuWidth
            } else if (spaceRight < menuWidth + padding) {
                menuLeft = screenWidth - menuWidth - padding
            }

            menuLeft = Math.max(padding, Math.min(menuLeft, screenWidth - menuWidth - padding))
            menuTop = Math.max(padding, Math.min(menuTop, screenHeight - menuHeight - padding))

            const menuCenterX = menuLeft + menuWidth / 2
            const menuCenterY = menuTop + menuHeight / 2

            opacity.value = withTiming(0, { duration: 180 })
            scale.value = withSpring(0.2, {
                damping: 20,
                stiffness: 200,
            })
            translateX.value = withSpring(anchorCenterX - menuCenterX, {
                damping: 20,
                stiffness: 200,
            })
            translateY.value = withSpring(
                anchorCenterY - menuCenterY,
                {
                    damping: 20,
                    stiffness: 200,
                },
                () => {
                    runOnJS(setIsOpen)(false)
                },
            )
            onVisibilityChange?.(false)
        }

        useImperativeHandle(ref, () => ({
            close: hideMenu,
        }))

        const measureAnchor = () => {
            anchorRef.current?.measure((x, y, width, height, pageX, pageY) => {
                setAnchorLayout({ x: pageX, y: pageY, width, height })
            })
        }

        const handleAnchorPress = () => {
            if (isOpen) {
                hideMenu()
            } else {
                measureAnchor()
                setTimeout(() => {
                    const { width: screenWidth, height: screenHeight } = Dimensions.get("window")
                    const padding = 16

                    const spaceBelow = screenHeight - (anchorLayout.y + anchorLayout.height)
                    const spaceAbove = anchorLayout.y
                    const spaceRight = screenWidth - anchorLayout.x
                    const spaceLeft = anchorLayout.x + anchorLayout.width

                    let menuTop = anchorLayout.y + anchorLayout.height + 8
                    if (spaceBelow < menuHeight + padding && spaceAbove > menuHeight + padding) {
                        menuTop = anchorLayout.y - menuHeight - 8
                    } else if (spaceBelow < menuHeight + padding) {
                        menuTop = Math.max(padding, screenHeight - menuHeight - padding)
                    }

                    let menuLeft = anchorLayout.x
                    if (spaceRight < menuWidth + padding && spaceLeft > menuWidth + padding) {
                        menuLeft = anchorLayout.x + anchorLayout.width - menuWidth
                    } else if (spaceRight < menuWidth + padding) {
                        menuLeft = screenWidth - menuWidth - padding
                    }

                    menuLeft = Math.max(padding, Math.min(menuLeft, screenWidth - menuWidth - padding))
                    menuTop = Math.max(padding, Math.min(menuTop, screenHeight - menuHeight - padding))

                    const anchorCenterX = anchorLayout.x + anchorLayout.width / 2
                    const anchorCenterY = anchorLayout.y + anchorLayout.height / 2
                    const menuCenterX = menuLeft + menuWidth / 2
                    const menuCenterY = menuTop + menuHeight / 2

                    translateX.value = anchorCenterX - menuCenterX
                    translateY.value = anchorCenterY - menuCenterY

                    showMenu()
                }, 50)
            }
        }

        const enhancedChildren = cloneElement(children, {
            onPress: handleAnchorPress,
        })

        const enhancedMenuContent = cloneElement(menuContent, {
            onPress: () => {
                menuContent.props.onPress?.()
                hideMenu()
            },
        })

        const { width: screenWidth, height: screenHeight } = Dimensions.get("window")
        const padding = 16

        // Calculate optimal position
        const spaceBelow = screenHeight - (anchorLayout.y + anchorLayout.height)
        const spaceAbove = anchorLayout.y
        const spaceRight = screenWidth - anchorLayout.x
        const spaceLeft = anchorLayout.x + anchorLayout.width

        // Vertical positioning
        let menuTop = anchorLayout.y + anchorLayout.height + 8
        if (spaceBelow < menuHeight + padding && spaceAbove > menuHeight + padding) {
            menuTop = anchorLayout.y - menuHeight - 8
        } else if (spaceBelow < menuHeight + padding) {
            menuTop = Math.max(padding, screenHeight - menuHeight - padding)
        }

        // Horizontal positioning
        let menuLeft = anchorLayout.x
        if (spaceRight < menuWidth + padding && spaceLeft > menuWidth + padding) {
            menuLeft = anchorLayout.x + anchorLayout.width - menuWidth
        } else if (spaceRight < menuWidth + padding) {
            menuLeft = screenWidth - menuWidth - padding
        }

        // Ensure menu stays within screen bounds
        menuLeft = Math.max(padding, Math.min(menuLeft, screenWidth - menuWidth - padding))
        menuTop = Math.max(padding, Math.min(menuTop, screenHeight - menuHeight - padding))

        const animatedStyle = useAnimatedStyle(() => ({
            opacity: opacity.value,
            transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale: scale.value }],
        }))

        return (
            <View>
                <View ref={anchorRef}>{enhancedChildren}</View>
                <Modal visible={isOpen} transparent animationType="none" onRequestClose={hideMenu} statusBarTranslucent>
                    <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={hideMenu}>
                        <Animated.View
                            style={[
                                {
                                    position: "absolute",
                                    left: menuLeft,
                                    top: menuTop,
                                    width: menuWidth,
                                    height: menuHeight,
                                    borderRadius: 12,
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 8 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 16,
                                    elevation: 16,
                                },
                                animatedStyle,
                            ]}
                        >
                            {enhancedMenuContent}
                        </Animated.View>
                    </TouchableOpacity>
                </Modal>
            </View>
        )
    },
)

export default FloatingMenu
export type { FloatingMenuRef }
