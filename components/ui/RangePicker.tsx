import { memo, useEffect, useRef, useState } from "react"
import { Animated, View } from "react-native"
import { PanGestureHandler } from "react-native-gesture-handler"

interface RangeSliderProps {
    range: number[]
    defaultValues?: number[]
    barHeight?: number
    barStyle?: any
    fillStyle?: any
    handleSize?: number
    handleStyle?: any
    onChange?(range: number[]): any
    vibrate?: boolean
}

function RangeSlider({
    range = [0, 100],
    defaultValues = [20, 80], // Changed to provide distinct default values
    barHeight = 30,
    barStyle = {},
    fillStyle = {},
    handleSize = 30,
    handleStyle = {},
    onChange = () => {},
    vibrate = false,
}: RangeSliderProps) {
    const [barWidth, setBarWidth] = useState(300)
    const minValueRef = useRef(defaultValues[0])
    const maxValueRef = useRef(defaultValues[1])
    const minPosX = useRef(0)
    const maxPosX = useRef(0)
    const minTouchX = useRef(new Animated.Value(0)).current
    const maxTouchX = useRef(new Animated.Value(0)).current
    const fillWidth = useRef(new Animated.Value(0)).current

    // Import haptic feedback conditionally
    let ReactNativeHapticFeedback
    if (vibrate) {
        try {
            // Use dynamic import or require within try/catch
            ReactNativeHapticFeedback = require("react-native-haptic-feedback").default
        } catch (e) {
            console.warn("react-native-haptic-feedback is not available")
        }
    }

    const onBarLayout = ({ nativeEvent }: any) => {
        const newBarWidth = nativeEvent.layout.width
        setBarWidth(newBarWidth)
    }

    const triggerVibration = () => {
        if (ReactNativeHapticFeedback) {
            ReactNativeHapticFeedback.trigger("impactLight", {
                enableVibrateFallback: false,
                ignoreAndroidSystemSettings: false,
            })
        }
    }

    // No longer using this function with the new approach
    // const pixelRatio = () => {
    //   return (range[1] - range[0]) / (barWidth - handleSize);
    // };

    const onMinValueChange = ({ nativeEvent }: any) => {
        // Adjust for handle offset - subtract half the handle width
        const adjustedX = Math.max(0, Math.min(nativeEvent.absoluteX - handleSize / 2, barWidth - handleSize))

        const value = Math.round((adjustedX / (barWidth - handleSize)) * (range[1] - range[0])) + range[0]
        if (value >= range[0] && value <= maxValueRef.current && value !== minValueRef.current) {
            minPosX.current = adjustedX
            minValueRef.current = value
            minTouchX.setValue(adjustedX)
            fillWidth.setValue(maxPosX.current - minPosX.current)
            if (vibrate) triggerVibration()
            onChange([minValueRef.current, maxValueRef.current])
        }
    }

    const onMaxValueChange = ({ nativeEvent }: any) => {
        // Adjust for handle offset - subtract half the handle width
        const adjustedX = Math.max(0, Math.min(nativeEvent.absoluteX - handleSize / 2, barWidth - handleSize))

        const value = Math.round((adjustedX / (barWidth - handleSize)) * (range[1] - range[0])) + range[0]
        if (value <= range[1] && value >= minValueRef.current && value !== maxValueRef.current) {
            maxPosX.current = adjustedX
            maxValueRef.current = value
            maxTouchX.setValue(adjustedX)
            fillWidth.setValue(maxPosX.current - minPosX.current)
            if (vibrate) triggerVibration()
            onChange([minValueRef.current, maxValueRef.current])
        }
    }

    // Handle initial setup and changes to range or defaultValues
    useEffect(() => {
        const min = ((minValueRef.current - range[0]) / (range[1] - range[0])) * (barWidth - handleSize)
        const max = ((maxValueRef.current - range[0]) / (range[1] - range[0])) * (barWidth - handleSize)

        minPosX.current = min
        maxPosX.current = max
        minTouchX.setValue(min)
        maxTouchX.setValue(max)
        fillWidth.setValue(max - min)
    }, [barWidth, range, minValueRef.current, maxValueRef.current])

    const renderFill = (minTranslateX: any) => {
        return (
            <Animated.View
                style={{
                    backgroundColor: "#333333",
                    height: barHeight,
                    left: handleSize / 2,
                    position: "absolute",
                    transform: [{ translateX: minTranslateX }],
                    top: 0,
                    width: fillWidth,
                    ...fillStyle,
                }}
            />
        )
    }

    const renderHandle = (translateX: any) => {
        return (
            <Animated.View
                style={{
                    aspectRatio: 1,
                    backgroundColor: "white",
                    borderRadius: handleSize / 2,
                    height: undefined,
                    marginTop: -((handleSize - barHeight) / 2),
                    position: "absolute",
                    transform: [{ translateX: translateX }],
                    width: handleSize,

                    ...handleStyle,
                }}
            />
        )
    }

    // Constraining the translation to stay within the visible area
    const minTranslateX = minTouchX.interpolate({
        inputRange: [0, barWidth - handleSize],
        outputRange: [0, barWidth - handleSize],
        extrapolate: "clamp",
    })

    const maxTranslateX = maxTouchX.interpolate({
        inputRange: [0, barWidth - handleSize],
        outputRange: [0, barWidth - handleSize],
        extrapolate: "clamp",
    })

    return (
        <View>
            <Animated.View
                onLayout={onBarLayout}
                style={{
                    backgroundColor: "#f2f2f2",
                    borderRadius: barHeight / 2,
                    height: barHeight,
                    position: "relative",
                    width: "100%",
                    ...barStyle,
                }}
            >
                {renderFill(minTranslateX)}
                <PanGestureHandler
                    onGestureEvent={Animated.event([{ nativeEvent: { absoluteX: minTouchX } }], {
                        useNativeDriver: false,
                        listener: onMinValueChange,
                    })}
                    activateAfterLongPress={0}
                >
                    {renderHandle(minTranslateX)}
                </PanGestureHandler>

                <PanGestureHandler
                    onGestureEvent={Animated.event([{ nativeEvent: { absoluteX: maxTouchX } }], {
                        useNativeDriver: false,
                        listener: onMaxValueChange,
                    })}
                    activateAfterLongPress={0}
                >
                    {renderHandle(maxTranslateX)}
                </PanGestureHandler>
            </Animated.View>
        </View>
    )
}

export default memo(RangeSlider, () => false)
