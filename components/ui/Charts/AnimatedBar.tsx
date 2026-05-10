import { useEffect } from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
} from "react-native-reanimated"
import Color from "color"

export interface AnimatedBarProps {
    value: number
    prevValue?: number
    maxValue: number
    chartHeight: number
    color: string
    label: string
    labelColor?: string
    index?: number
    barWidth?: number
    flex?: number
    marginRight?: number
    minBarHeight?: number
    onPress?: () => void
    valueLabel?: string
    isOutlier?: boolean
}

const AnimatedBar: React.FC<AnimatedBarProps> = ({
    value,
    prevValue = 0,
    maxValue,
    chartHeight,
    color,
    label,
    labelColor,
    index,
    barWidth,
    flex,
    marginRight,
    minBarHeight = 12,
    onPress,
    valueLabel,
    isOutlier,
}) => {
    const animatedHeight = useSharedValue(0)
    const animatedPrevHeight = useSharedValue(0)
    const animatedOpacity = useSharedValue(0)
    const animatedScale = useSharedValue(0.8)

    const getBarHeight = (val: number): number => {
        if (!val || !maxValue) return 0
        return Math.max((val / maxValue) * chartHeight, val > 0 ? minBarHeight : 0)
    }

    const targetHeight = getBarHeight(value)
    const targetPrevHeight = getBarHeight(prevValue)
    const delay = index !== undefined ? index * 100 : 0

    useEffect(() => {
        animatedOpacity.value = withDelay(delay, withTiming(1, { duration: 400 }))
        animatedScale.value = withDelay(delay, withTiming(1, { duration: 400 }))
        animatedHeight.value = withDelay(delay, withTiming(targetHeight, { duration: 600 }))
        if (targetPrevHeight > 0) {
            animatedPrevHeight.value = withDelay(delay, withTiming(targetPrevHeight, { duration: 600 }))
        }
    }, [targetHeight, targetPrevHeight, delay])

    const animatedBarStyle = useAnimatedStyle(() => ({
        height: animatedHeight.value,
        marginTop: chartHeight - animatedHeight.value,
        opacity: animatedOpacity.value,
        transform: [{ scale: animatedScale.value }],
    }))

    const animatedPrevBarStyle = useAnimatedStyle(() => ({
        height: animatedPrevHeight.value,
        marginTop: chartHeight - animatedPrevHeight.value,
        opacity: animatedOpacity.value * 0.7,
        transform: [{ scale: animatedScale.value }],
    }))

    const animatedContainerStyle = useAnimatedStyle(() => ({
        opacity: animatedOpacity.value,
        transform: [{ scale: animatedScale.value }],
    }))

    const animatedValueOpacity = useAnimatedStyle(() => ({
        opacity: interpolate(
            animatedHeight.value,
            [0, minBarHeight, minBarHeight * 2],
            [0, 0, 1],
            Extrapolation.CLAMP,
        ),
    }))

    const effectiveLabelColor = labelColor ?? color
    const hasPrevData = prevValue > 0

    const containerStyle = {
        ...(barWidth !== undefined && { width: barWidth }),
        ...(flex !== undefined && { flex }),
        ...(marginRight !== undefined && { marginRight }),
    }

    const bars = (
        <View style={[styles.barsWrapper, { height: chartHeight }]}>
            {hasPrevData && (
                <Animated.View
                    style={[
                        styles.bar,
                        {
                            backgroundColor: Color(color).alpha(0.25).string(),
                            position: "absolute",
                            width: "100%",
                            borderWidth: 1,
                            borderColor: Color(color).alpha(0.4).string(),
                        },
                        animatedPrevBarStyle,
                    ]}
                />
            )}
            <Animated.View style={[styles.bar, { backgroundColor: color }, animatedBarStyle]}>
                {valueLabel !== undefined && value > 0 && (
                    <Animated.View style={[styles.valueLabelWrapper, animatedValueOpacity]}>
                        <Text style={styles.valueLabelText}>{isOutlier ? "↑" + valueLabel : valueLabel}</Text>
                    </Animated.View>
                )}
            </Animated.View>
        </View>
    )

    if (onPress) {
        return (
            <TouchableOpacity style={[styles.barContainer, containerStyle]} onPress={onPress} activeOpacity={0.7}>
                {bars}
                <Animated.Text style={[styles.label, { color: effectiveLabelColor }, animatedContainerStyle]}>
                    {label}
                </Animated.Text>
            </TouchableOpacity>
        )
    }

    return (
        <Animated.View style={[styles.barContainer, containerStyle, animatedContainerStyle]}>
            {bars}
            <Text style={[styles.label, { color: effectiveLabelColor }]}>{label}</Text>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    barContainer: {
        alignItems: "center",
    },
    barsWrapper: {
        width: "100%",
        position: "relative",
    },
    bar: {
        width: "100%",
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        justifyContent: "center",
        alignItems: "center",
        overflow: "visible",
    },
    valueLabelWrapper: {
        position: "absolute",
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    valueLabelText: {
        color: "#000",
        fontSize: 12,
        fontWeight: "700",
        textAlign: "center",
        transform: [{ rotate: "-90deg" }],
        width: 80,
    },
    label: {
        fontSize: 11,
        fontWeight: "600",
        marginTop: 5,
        opacity: 0.8,
    },
})

export default AnimatedBar
