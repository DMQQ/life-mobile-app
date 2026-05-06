import { ActivityIndicator, Pressable, StyleProp, StyleSheet, ViewStyle } from "react-native"
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import { Feather } from "@expo/vector-icons"
import GlassView from "./GlassView"
import Colors from "@/constants/Colors"

type FeatherName = React.ComponentProps<typeof Feather>["name"]

interface GlassIconButtonProps {
    name: FeatherName
    onPress?: () => void
    size?: number
    color?: string
    disabled?: boolean
    loading?: boolean
    tintColor?: string
    style?: StyleProp<ViewStyle>
    hitSlop?: number
    positioned?: "top-left" | "top-right"
    padding?: number
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export default function GlassIconButton({
    name,
    onPress,
    size = 20,
    color = Colors.foreground,
    disabled = false,
    loading = false,
    tintColor,
    style,
    hitSlop = 8,
    positioned,
    padding = 15,
}: GlassIconButtonProps) {
    const scale = useSharedValue(1)

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }))

    const handlePressIn = () => {
        scale.value = withTiming(0.88, { duration: 100 })
    }

    const handlePressOut = () => {
        scale.value = withTiming(1, { duration: 150 })
    }

    const positionStyle: ViewStyle | undefined =
        positioned === "top-left"
            ? styles.topLeft
            : positioned === "top-right"
              ? styles.topRight
              : undefined

    return (
        <AnimatedPressable
            disabled={disabled || loading}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            hitSlop={hitSlop}
            style={[positionStyle, animatedStyle, style]}
        >
            <GlassView
                tintColor={tintColor}
                style={[styles.container, { padding }, disabled && styles.disabled]}
            >
                {loading ? (
                    <ActivityIndicator size={size} color={color} />
                ) : (
                    <Feather name={name} size={size} color={disabled ? Colors.foreground_disabled : color} />
                )}
            </GlassView>
        </AnimatedPressable>
    )
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 100,
        justifyContent: "center",
        alignItems: "center",
    },
    disabled: {
        opacity: 0.5,
    },
    topLeft: {
        position: "absolute",
        top: 15,
        left: 15,
        zIndex: 100,
    },
    topRight: {
        position: "absolute",
        top: 15,
        right: 15,
        zIndex: 100,
    },
})
