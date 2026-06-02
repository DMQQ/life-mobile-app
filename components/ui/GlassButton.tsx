import { ActivityIndicator, Pressable, StyleProp, StyleSheet, ViewStyle } from "react-native"
import { FONTS } from "@/constants/Fonts"
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import { Feather } from "@expo/vector-icons"
import GlassView from "./GlassView"
import Text from "./Text/Text"
import Colors from "@/constants/Colors"
import Color from "color"

type FeatherName = React.ComponentProps<typeof Feather>["name"]

type GlassButtonVariant = "default" | "destructive" | "accent"

interface GlassButtonProps {
    label: string
    onPress?: () => void
    icon?: FeatherName
    iconRight?: FeatherName
    disabled?: boolean
    loading?: boolean
    variant?: GlassButtonVariant
    style?: StyleProp<ViewStyle>
    fullWidth?: boolean
}

const variantColor: Record<GlassButtonVariant, string> = {
    default: Colors.foreground,
    destructive: Colors.danger,
    accent: Colors.secondary,
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export default function GlassButton({
    label,
    onPress,
    icon,
    iconRight,
    disabled = false,
    loading = false,
    variant = "default",
    style,
    fullWidth = false,
}: GlassButtonProps) {
    const scale = useSharedValue(1)

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }))

    const handlePressIn = () => {
        scale.value = withTiming(0.96, { duration: 100 })
    }

    const handlePressOut = () => {
        scale.value = withTiming(1, { duration: 150 })
    }

    const iconColor = disabled ? Colors.foreground_disabled : variantColor[variant]

    return (
        <AnimatedPressable
            disabled={disabled || loading}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[fullWidth && styles.fullWidth, animatedStyle, style]}
        >
            <GlassView
                tintColor={
                    variant !== "default"
                        ? Color(variantColor[variant]).alpha(0.15).string()
                        : undefined
                }
                style={[styles.container, disabled && styles.disabled]}
            >
                {loading ? (
                    <ActivityIndicator size="small" color={iconColor} />
                ) : (
                    <>
                        {icon && <Feather name={icon} size={16} color={iconColor} />}
                        <Text
                            variant="caption"
                            style={[styles.label, { color: iconColor }, disabled && styles.labelDisabled]}
                        >
                            {label}
                        </Text>
                        {iconRight && <Feather name={iconRight} size={16} color={iconColor} />}
                    </>
                )}
            </GlassView>
        </AnimatedPressable>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 100,
        gap: 7,
    },
    label: {
        fontFamily: FONTS.semibold,
        fontSize: 14,
    },
    disabled: {
        opacity: 0.5,
    },
    labelDisabled: {
        color: Colors.foreground_disabled,
    },
    fullWidth: {
        width: "100%",
    },
})
