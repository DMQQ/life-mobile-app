import React, { useEffect, useRef } from "react";
import { Text, TextStyle } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing, AnimateStyle } from "react-native-reanimated";

interface AnimatedNumberProps {
  value: number;
  style?: TextStyle | TextStyle[] | AnimateStyle<TextStyle>;
  formatValue?: (value: number) => string;
  delay?: number;
}

const AnimatedDigit: React.FC<{
  digit: string;
  style?: TextStyle | TextStyle[] | AnimateStyle<TextStyle>;
  delay: number;
}> = ({ digit, style, delay }) => {
  const translateY = useSharedValue(30);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(delay, withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }));

    opacity.value = withDelay(delay, withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) }));
  }, [digit, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Text style={style}>{digit}</Text>
    </Animated.View>
  );
};

const AnimatedRollingDigit: React.FC<{
  digit: string;
  prevDigit: string;
  style?: TextStyle | TextStyle[] | AnimateStyle<TextStyle>;
  delay: number;
}> = ({ digit, prevDigit, style, delay }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (digit !== prevDigit) {
      translateY.value = withDelay(
        delay,
        withTiming(-30, {
          duration: 200,
          easing: Easing.in(Easing.quad),
        })
      );

      opacity.value = withDelay(delay, withTiming(0, { duration: 150, easing: Easing.in(Easing.quad) }));

      setTimeout(() => {
        translateY.value = 30;
        translateY.value = withTiming(0, {
          duration: 300,
          easing: Easing.out(Easing.cubic),
        });

        opacity.value = withTiming(1, {
          duration: 250,
          easing: Easing.out(Easing.quad),
        });
      }, delay + 100);
    }
  }, [digit, prevDigit, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Text style={style}>{digit}</Text>
    </Animated.View>
  );
};

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value, style, formatValue = (val) => val.toFixed(2), delay = 0 }) => {
  const prevValueRef = useRef<string>("");
  const formattedValue = formatValue(value);
  const digits = formattedValue.split("");
  const prevDigits = prevValueRef.current.split("");

  useEffect(() => {
    prevValueRef.current = formattedValue;
  }, [formattedValue]);

  const isInitialRender = prevValueRef.current === "";

  return (
    <Animated.View style={{ flexDirection: "row" }}>
      {digits.map((digit, index) => {
        const digitDelay = delay + index * 30;
        const prevDigit = prevDigits[index] || "";

        if (isInitialRender) {
          return <AnimatedDigit key={`initial-${index}`} digit={digit} style={style} delay={digitDelay} />;
        }

        return <AnimatedRollingDigit key={index} digit={digit} prevDigit={prevDigit} style={style} delay={digitDelay} />;
      })}
    </Animated.View>
  );
};

export default AnimatedNumber;
