import React, { useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, { useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

const SLIDER_WIDTH = Dimensions.get("window").width - 40; // 20px padding each side
const KNOB_SIZE = 24;

interface SliderProps {
  value: number;
  minValue: number;
  maxValue: number;
  onValueChange: (value: number) => void;
  color?: string;
}

const CustomSlider = ({ value, minValue, maxValue, onValueChange, color = "#2196F3" }: SliderProps) => {
  const position = useSharedValue(((value - minValue) / (maxValue - minValue)) * SLIDER_WIDTH);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startX = position.value;
    },
    onActive: (event, ctx) => {
      const newPosition = ctx.startX + event.translationX;
      position.value = Math.min(Math.max(0, newPosition), SLIDER_WIDTH);
    },
    onEnd: () => {
      const value = Math.round((position.value / SLIDER_WIDTH) * (maxValue - minValue) + minValue);
      onValueChange(value);
    },
  });

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: position.value + KNOB_SIZE / 2,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <Animated.View style={[styles.progress, progressStyle, { backgroundColor: color }]} />
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={[styles.knob, knobStyle, { backgroundColor: color }]} />
        </PanGestureHandler>
      </View>
    </View>
  );
};

const RangeSliders = () => {
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(100);
  const [target, setTarget] = useState(50);

  return (
    <View style={styles.rangeContainer}>
      <Text>Min: {min}</Text>
      <CustomSlider value={min} minValue={0} maxValue={max} onValueChange={setMin} color="#2196F3" />

      <Text>Target: {target}</Text>
      <CustomSlider value={target} minValue={min} maxValue={max} onValueChange={setTarget} color="#4CAF50" />

      <Text>Max: {max}</Text>
      <CustomSlider value={max} minValue={min} maxValue={1000} onValueChange={setMax} color="#F44336" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: "center",
  },
  rangeContainer: {
    padding: 20,
    gap: 20,
  },
  track: {
    width: SLIDER_WIDTH,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
  },
  progress: {
    height: 4,
    borderRadius: 2,
    position: "absolute",
  },
  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    position: "absolute",
    top: -10,
    left: -KNOB_SIZE / 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default RangeSliders;
