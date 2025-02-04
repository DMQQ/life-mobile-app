import React, { useState, useRef, useEffect } from "react";
import { Animated, View } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";

interface RangSliderProps {
  range: number[];
  defaultValues?: number[];
  barHeight?: number;
  barStyle?: any;
  fillStyle?: any;
  handleSize?: number;
  handleStyle?: any;
  onChange?(range: number[]): any;
  vibrate?: boolean;
}

function RangeSlider({
  range = [0, 100],
  defaultValues = [0, 0],
  barHeight = 30,
  barStyle = {},
  fillStyle = {},
  handleSize = 30,
  handleStyle = {},
  onChange = () => {},
  vibrate = false,
}: RangSliderProps) {
  const [barWidth, setBarWidth] = useState(300);
  const minValueRef = useRef(defaultValues[0]);
  const maxValueRef = useRef(defaultValues[1]);
  const minPosX = useRef(0);
  const maxPosX = useRef(0);
  const minTouchX = useRef(new Animated.Value(0)).current;
  const maxTouchX = useRef(new Animated.Value(0)).current;
  const fillWidth = useRef(new Animated.Value(0)).current;
  const unusedTouchX = useRef(new Animated.Value(0)).current;
  // const ReactNativeHapticFeedback = vibrate ? require("react-native-haptic-feedback").default : undefined;
  const ReactNativeHapticFeedback = undefined;

  const onBarLayout = ({ nativeEvent }: any) => {
    setBarWidth(nativeEvent.layout.width);
  };

  const triggerVibration = () => {
    if (ReactNativeHapticFeedback) {
      ReactNativeHapticFeedback.trigger("impactLight", {
        enableVibrateFallback: false,
        ignoreAndroidSystemSettings: false,
      });
    }
  };

  const pixelRatio = () => {
    return (range[1] - range[0]) / (barWidth - handleSize);
  };

  const onMinValueChange = ({ nativeEvent }: any) => {
    const { absoluteX } = nativeEvent;
    const value = Math.round(absoluteX * pixelRatio()) + range[0];
    if (value >= range[0] && value <= maxValueRef.current && value != minValueRef.current) {
      minPosX.current = absoluteX;
      minValueRef.current = value;
      minTouchX.setValue(absoluteX);
      fillWidth.setValue(maxPosX.current - minPosX.current);
      if (vibrate) triggerVibration();
      onChange([minValueRef.current, maxValueRef.current]);
    }
  };

  const onMaxValueChange = ({ nativeEvent }: any) => {
    const { absoluteX } = nativeEvent;
    const value = Math.round(absoluteX * pixelRatio()) + range[0];
    if (value <= range[1] && value >= minValueRef.current && value != maxValueRef.current) {
      maxPosX.current = absoluteX;
      maxValueRef.current = value;
      maxTouchX.setValue(absoluteX);
      fillWidth.setValue(maxPosX.current - minPosX.current);
      if (vibrate) triggerVibration();
      onChange([minValueRef.current, maxValueRef.current]);
    }
  };

  const onMinPanGestureEvent = Animated.event([{ nativeEvent: { translationX: unusedTouchX } }], {
    useNativeDriver: true,
    listener: onMinValueChange,
  });

  const onMaxPanGestureEvent = Animated.event([{ nativeEvent: { translationX: unusedTouchX } }], {
    useNativeDriver: true,
    listener: onMaxValueChange,
  });

  useEffect(() => {
    const min = (minValueRef.current - range[0]) / pixelRatio();
    const max = (maxValueRef.current - range[0]) / pixelRatio();
    minPosX.current = min;
    maxPosX.current = max;
    minTouchX.setValue(min);
    maxTouchX.setValue(max);
    fillWidth.setValue(max - min);
  }, [barWidth]);

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
    );
  };

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
          elevation: 1,
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 4,
          ...handleStyle,
        }}
      />
    );
  };

  const minTranslateX = minTouchX.interpolate({
    inputRange: [0, barWidth],
    outputRange: [0, barWidth],
    extrapolate: "clamp",
  });

  const maxTranslateX = maxTouchX.interpolate({
    inputRange: [0, barWidth],
    outputRange: [0, barWidth],
    extrapolate: "clamp",
  });

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
        <PanGestureHandler onGestureEvent={onMinPanGestureEvent}>{renderHandle(minTranslateX)}</PanGestureHandler>
        <PanGestureHandler onGestureEvent={onMaxPanGestureEvent}>{renderHandle(maxTranslateX)}</PanGestureHandler>
      </Animated.View>
    </View>
  );
}

export default RangeSlider;
