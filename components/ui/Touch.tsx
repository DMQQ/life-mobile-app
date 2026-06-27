import { ComponentProps, useCallback } from "react"
import { Pressable, StyleProp, ViewStyle } from "react-native"
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated"

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const SPRING_CONFIG = { mass: 0.5, stiffness: 500, damping: 20 }

interface TouchProps extends ComponentProps<typeof Pressable> {
    scaleTo?: number
    springConfig?: typeof SPRING_CONFIG
    animatedStyle?: StyleProp<ViewStyle>
}

export default function Touch({
    onPressIn,
    onPressOut,
    onPress,
    scaleTo = 0.97,
    springConfig = SPRING_CONFIG,
    animatedStyle,
    style,
    children,
    disabled,
    ...rest
}: TouchProps) {
    const scale = useSharedValue(1)

    const handlePressIn = useCallback(
        (e: Parameters<NonNullable<typeof onPressIn>>[0]) => {
            scale.value = withSpring(scaleTo, springConfig)
            onPressIn?.(e)
        },
        [scaleTo, springConfig, onPressIn],
    )

    const handlePressOut = useCallback(
        (e: Parameters<NonNullable<typeof onPressOut>>[0]) => {
            scale.value = withSpring(1, springConfig)
            onPressOut?.(e)
        },
        [springConfig, onPressOut],
    )

    const handlePress = useCallback(
        (e: Parameters<NonNullable<typeof onPress>>[0]) => {
            scale.value = withSpring(1, springConfig)
            onPress?.(e)
        },
        [springConfig, onPress],
    )

    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }))

    return (
        <AnimatedPressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            disabled={disabled}
            style={[animStyle, animatedStyle, style as StyleProp<ViewStyle>]}
            {...rest}
        >
            {children}
        </AnimatedPressable>
    )
}
