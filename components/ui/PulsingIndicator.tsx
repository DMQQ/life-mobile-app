import lowOpacity from "@/utils/functions/lowOpacity"
import React, { useEffect } from "react"
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated"
import { Colors } from "react-native/Libraries/NewAppScreen"

interface PulsingIndicatorProps {
    size?: number
    color?: string
    backgroundColor?: string
    duration?: number
    scaleRange?: number
    style?: any
}

const PulsingIndicator: React.FC<PulsingIndicatorProps> = ({
    size = 12.5,
    color = Colors.secondary,
    backgroundColor = lowOpacity(Colors.secondary, 0.5),
    duration = 1000,
    scaleRange = 1.5,
    style,
}) => {
    const scale = useSharedValue(1)
    const opacity = useSharedValue(1)

    useEffect(() => {
        scale.value = withRepeat(
            withTiming(scaleRange, {
                duration,
                easing: Easing.bezier(0.4, 0, 0.6, 1),
            }),
            -1,
            true,
        )

        opacity.value = withRepeat(
            withTiming(0.3, {
                duration,
                easing: Easing.bezier(0.4, 0, 0.6, 1),
            }),
            -1,
            true,
        )
    }, [duration, scaleRange])

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }))

    return (
        <Animated.View
            style={[
                {
                    position: "absolute",
                    top: -5,
                    right: 0,
                    width: size,
                    height: size,
                    backgroundColor,
                    borderRadius: size / 2,
                    justifyContent: "center",
                    alignItems: "center",
                },
                style,
            ]}
        >
            <Animated.View
                style={[
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        backgroundColor: color,
                    },
                    animatedStyle,
                ]}
            />
        </Animated.View>
    )
}

export default PulsingIndicator
