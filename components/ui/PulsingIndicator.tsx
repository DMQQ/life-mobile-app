import Colors from "@/constants/Colors"
import React, { useEffect } from "react"
import { View } from "react-native"
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated"

interface PulsingIndicatorProps {
    size?: number
    color?: string
    duration?: number
    style?: any
}

const PulsingIndicator: React.FC<PulsingIndicatorProps> = ({
    size = 8,
    color = Colors.secondary,
    duration = 1000,
    style,
}) => {
    const scale = useSharedValue(1)
    const opacity = useSharedValue(0.8)

    useEffect(() => {
        scale.value = withRepeat(
            withTiming(2.5, {
                duration,
                easing: Easing.out(Easing.quad),
            }),
            -1,
            true,
        )

        opacity.value = withRepeat(
            withTiming(0.25, {
                duration,
                easing: Easing.out(Easing.quad),
            }),
            -1,
            true,
        )
    }, [duration, scale, opacity])

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }))

    return (
        <View
            style={[
                {
                    position: "absolute",
                    bottom: -7,
                    left: -7,
                    width: size * 6,
                    height: size * 6,
                },
                style,
            ]}
        >
            <View
                style={{
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: color,
                    position: "absolute",
                    top: 15,
                    right: 20,
                }}
            />
            <Animated.View
                style={[
                    {
                        position: "absolute",
                        top: 15,
                        right: 20,
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        backgroundColor: color,
                    },
                    animatedStyle,
                ]}
            />
        </View>
    )
}

export default PulsingIndicator
