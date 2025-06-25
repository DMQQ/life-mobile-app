import React, { useEffect, memo } from "react";
import { Text, TextStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  AnimateStyle,
} from "react-native-reanimated";

interface AnimatedNumberProps {
  value: number;
  style?: TextStyle | TextStyle[] | AnimateStyle<TextStyle>;
  formatValue?: (value: number) => string;
  delay?: number;
}

const AnimatedDigit = memo<{
  digit: string;
  style?: TextStyle | TextStyle[] | AnimateStyle<TextStyle>;
  delay: number;
}>(({ digit, style, delay }) => {
  const translateY = useSharedValue(30);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = 30;
    opacity.value = 0;

    translateY.value = withDelay(
      delay,
      withSequence(
        withTiming(-10, { duration: 200, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) })
      )
    );

    opacity.value = withDelay(delay, withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) }));
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
});

const AnimatedNumber = memo<AnimatedNumberProps>(
  ({ value, style, formatValue = (val) => val.toFixed(2), delay = 0 }) => {
    const formattedValue = formatValue(value);
    const digits = formattedValue.split("");

    return (
      <Animated.View style={{ flexDirection: "row" }}>
        {digits.map((digit, index) => (
          <AnimatedDigit key={`${index}-${digit}-${formattedValue}`} digit={digit} style={style} delay={delay + index * 50} />
        ))}
      </Animated.View>
    );
  },
  (prevProps, nextProps) => prevProps.value === nextProps.value
);

export default AnimatedNumber;
