import Color from "color"
import { LinearGradient } from "expo-linear-gradient"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"

interface ProgressBarProps {
    progress: number
    color: string
    height?: number
    gradient?: boolean
    style?: StyleProp<ViewStyle>
}

export default function ProgressBar({ progress, color, height = 6, gradient = false, style }: ProgressBarProps) {
    const clampedPct = Math.min(100, Math.max(0, progress))
    const fillStyle = { width: `${clampedPct}%` as any, height: "100%" as any, borderRadius: 100 }

    return (
        <View style={[styles.track, { height }, style]}>
            {gradient ? (
                <LinearGradient
                    colors={[color, Color(color).lighten(0.3).string()]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={fillStyle}
                />
            ) : (
                <View style={[fillStyle, { backgroundColor: color }]} />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    track: {
        borderRadius: 100,
        backgroundColor: "rgba(255,255,255,0.1)",
        overflow: "hidden",
    },
})
