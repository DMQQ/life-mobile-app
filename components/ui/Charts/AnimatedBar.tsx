import { FONTS } from "@/constants/Fonts"
import { useEffect } from "react"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import Text from "@/components/ui/Text/Text"
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
} from "react-native-reanimated"
import Colors from "@/constants/Colors"

export interface AnimatedBarProps {
    value: number
    prevValue?: number
    maxValue: number
    chartHeight: number
    // color?: string
    barColor?: string
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
    noPrevValue?: boolean
}

const AnimatedBar: React.FC<AnimatedBarProps> = ({
    value,
    prevValue = 0,
    maxValue,
    chartHeight,
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
    noPrevValue = false,
    barColor = Colors.secondary,
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

    const animatedBarHeightOnly = useAnimatedStyle(() => ({
        height: animatedHeight.value,
    }))

    const animatedPrevBarStyle = useAnimatedStyle(() => ({
        height: animatedPrevHeight.value,
    }))

    const animatedContainerStyle = useAnimatedStyle(() => ({
        opacity: animatedOpacity.value,
        transform: [{ scale: animatedScale.value }],
    }))

    const animatedValueOpacity = useAnimatedStyle(() => ({
        opacity: interpolate(animatedHeight.value, [0, minBarHeight, minBarHeight * 2], [0, 0, 1], Extrapolation.CLAMP),
    }))

    const effectiveLabelColor = labelColor ?? barColor
    const containerStyle = {
        ...(barWidth !== undefined && { width: barWidth }),
        ...(flex !== undefined && { flex }),
        ...(marginRight !== undefined && { marginRight }),
    }

    const bars = (
        <View style={[styles.barsWrapper, { height: chartHeight }]}>
            {noPrevValue ? (
                <Animated.View style={[styles.singleBar, { backgroundColor: barColor }, animatedBarHeightOnly]}>
                    {valueLabel !== undefined && value > 0 && (
                        <Animated.View style={[styles.valueLabelWrapper, animatedValueOpacity]}>
                            <Text size={11} align="center" style={styles.valueLabelText}>{isOutlier ? "↑" + valueLabel : valueLabel}</Text>
                        </Animated.View>
                    )}
                </Animated.View>
            ) : (
                <View style={styles.sideBySideRow}>
                    <Animated.View
                        style={[
                            styles.sideBySideBar,
                            { backgroundColor: Colors.secondary_dark_2 },
                            animatedPrevBarStyle,
                        ]}
                    />
                    <Animated.View style={[styles.sideBySideBar, { backgroundColor: barColor }, animatedBarHeightOnly]}>
                        {valueLabel !== undefined && value > 0 && (
                            <Animated.View style={[styles.valueLabelWrapper, animatedValueOpacity]}>
                                <Text size={11} align="center" style={styles.valueLabelText}>{isOutlier ? "↑" + valueLabel : valueLabel}</Text>
                            </Animated.View>
                        )}
                    </Animated.View>
                </View>
            )}
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
            <Text size={11} weight="600" opacity={0.8} style={{ marginTop: 5 }}>{label}</Text>
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
    singleBar: {
        position: "absolute",
        bottom: 0,
        left: 4,
        right: 4,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        overflow: "visible",
    },
    sideBySideRow: {
        position: "absolute",
        bottom: 0,
        left: 4,
        right: 4,
        top: 0,
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 5,
    },
    sideBySideBar: {
        flex: 1,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        overflow: "visible",
    },
    label: {
        fontSize: 11,
        fontFamily: FONTS.semibold,
        opacity: 0.8,
        marginTop: 5,
    },
    valueLabelWrapper: {
        position: "absolute",
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    valueLabelText: {
        transform: [{ rotate: "-90deg" }],
        width: 80,
    },
})

export default AnimatedBar
