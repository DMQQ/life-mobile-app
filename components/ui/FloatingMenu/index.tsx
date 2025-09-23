import { ReactElement, cloneElement, forwardRef, useEffect, useRef, useState } from "react"
import { Dimensions, Modal, TouchableOpacity, View } from "react-native"
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated"

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
        const [isAnimating, setIsAnimating] = useState(false)
        const [anchorLayout, setAnchorLayout] = useState({ x: 0, y: 0, width: 0, height: 0 })
        const [menuPosition, setMenuPosition] = useState({ left: 0, top: 0 })
        const isMounted = useRef(true)
        const anchorRef = useRef<View>(null)

        const opacity = useSharedValue(0)
        const scale = useSharedValue(0.3)
        const translateX = useSharedValue(0)
        const translateY = useSharedValue(0)

        const showMenu = () => {
            setIsOpen(true)
            setIsAnimating(true)
            opacity.value = withTiming(1, { duration: 200 })
            scale.value = withSpring(1, { damping: 22, stiffness: 250, mass: 0.8 })
            translateX.value = withTiming(0)
            translateY.value = withTiming(0)

            // Use setTimeout instead of worklet callback
            setTimeout(() => {
                if (isMounted.current) {
                    setIsAnimating(false)
                }
            }, 400) // Wait for spring animation to settle

            onVisibilityChange?.(true)
        }

        const hideMenu = () => {
            if (isAnimating) return

            setIsAnimating(true)

            const anchorCenterX = anchorLayout.x + anchorLayout.width / 2
            const anchorCenterY = anchorLayout.y + anchorLayout.height / 2
            const menuCenterX = menuPosition.left + menuWidth / 2
            const menuCenterY = menuPosition.top + menuHeight / 2

            // Start animations
            opacity.value = withTiming(0, { duration: 180 })
            scale.value = withSpring(0.2, { damping: 20, stiffness: 200 })
            translateX.value = withTiming(anchorCenterX - menuCenterX)
            translateY.value = withTiming(anchorCenterY - menuCenterY)

            // Close after animation completes (no worklet callback)
            setTimeout(() => {
                if (isMounted.current) {
                    setIsOpen(false)
                    setIsAnimating(false)
                }
            }, 400) // Wait for spring to finish

            onVisibilityChange?.(false)
        }

        const handleBackgroundPress = () => {
            if (isAnimating) return
            hideMenu() // Use animated close
        }

        useEffect(() => {
            return () => {
                isMounted.current = false
                // Cancel any running animations on unmount
                opacity.value = 0
                scale.value = 0.3
                translateX.value = 0
                translateY.value = 0
            }
        }, [])

        const measureAnchor = () => {
            anchorRef.current?.measure((x, y, width, height, pageX, pageY) => {
                const newAnchorLayout = { x: pageX, y: pageY, width, height }
                setAnchorLayout(newAnchorLayout)

                const { width: screenWidth, height: screenHeight } = Dimensions.get("window")
                const padding = 16

                const spaceBelow = screenHeight - (newAnchorLayout.y + newAnchorLayout.height)
                const spaceAbove = newAnchorLayout.y
                const spaceRight = screenWidth - newAnchorLayout.x
                const spaceLeft = newAnchorLayout.x + newAnchorLayout.width

                let menuTop = newAnchorLayout.y + newAnchorLayout.height + 8
                if (spaceBelow < menuHeight + padding && spaceAbove > menuHeight + padding) {
                    menuTop = newAnchorLayout.y - menuHeight - 8
                } else if (spaceBelow < menuHeight + padding) {
                    menuTop = Math.max(padding, screenHeight - menuHeight - padding)
                }

                let menuLeft = newAnchorLayout.x
                if (spaceRight < menuWidth + padding && spaceLeft > menuWidth + padding) {
                    menuLeft = newAnchorLayout.x + newAnchorLayout.width - menuWidth
                } else if (spaceRight < menuWidth + padding) {
                    menuLeft = screenWidth - menuWidth - padding
                }

                menuLeft = Math.max(padding, Math.min(menuLeft, screenWidth - menuWidth - padding))
                menuTop = Math.max(padding, Math.min(menuTop, screenHeight - menuHeight - padding))

                setMenuPosition({ left: menuLeft, top: menuTop })

                const anchorCenterX = newAnchorLayout.x + newAnchorLayout.width / 2
                const anchorCenterY = newAnchorLayout.y + newAnchorLayout.height / 2
                const menuCenterX = menuLeft + menuWidth / 2
                const menuCenterY = menuTop + menuHeight / 2

                translateX.value = anchorCenterX - menuCenterX
                translateY.value = anchorCenterY - menuCenterY

                showMenu()
            })
        }

        const handleAnchorPress = () => {
            if (isAnimating) return

            if (isOpen) {
                hideMenu() // Use animated close
            } else {
                measureAnchor()
            }
        }

        const enhancedChildren = cloneElement(children, {
            onPress: handleAnchorPress,
            pointerEvents: isAnimating ? "none" : "auto",
        })

        const enhancedMenuContent = cloneElement(menuContent, {
            onPress: () => {
                if (isAnimating) return
                menuContent.props.onPress?.()
                hideMenu() // Use animated close
            },
        })

        const animatedStyle = useAnimatedStyle(() => ({
            opacity: opacity.value,
            transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale: scale.value }],
        }))

        return (
            <View>
                <View ref={anchorRef}>{enhancedChildren}</View>
                <Modal
                    visible={isOpen}
                    transparent
                    animationType="none"
                    onRequestClose={handleBackgroundPress}
                    statusBarTranslucent
                >
                    <TouchableOpacity
                        style={{ flex: 1 }}
                        activeOpacity={1}
                        onPress={handleBackgroundPress}
                        disabled={isAnimating}
                    >
                        <Animated.View
                            style={[
                                {
                                    position: "absolute",
                                    left: menuPosition.left,
                                    top: menuPosition.top,
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
                            pointerEvents={isAnimating ? "none" : "auto"}
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
