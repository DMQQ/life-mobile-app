import { useEffect } from "react";
import { StyleSheet, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";

type FancySpinnerProps = {
  hideAnimation?: boolean;
  size?: number;
  colors?: [string, string, string];
  borderWidth?: number;
  style?: ViewStyle;
};

export const FancySpinner = ({
  hideAnimation = false,
  size = 100,
  colors = ["#7845ac", "#ca469c", "#fd5f80"],
  borderWidth = 4,
  style,
}: FancySpinnerProps) => {
  const rotation1 = useSharedValue(0);
  const rotation2 = useSharedValue(0);
  const rotation3 = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    rotation1.value = withRepeat(withTiming(360, { duration: 1200 }), -1);
    rotation2.value = withRepeat(withDelay(400, withTiming(360, { duration: 1200 })), -1);
    rotation3.value = withRepeat(withDelay(800, withTiming(360, { duration: 1200 })), -1);
  }, []);

  useEffect(() => {
    if (hideAnimation) {
      scale.value = withSequence(withSpring(1.2), withSpring(0));
    }
  }, [hideAnimation]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedStyle1 = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation1.value}deg` }],
  }));

  const animatedStyle2 = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation2.value}deg` }],
  }));

  const animatedStyle3 = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation3.value}deg` }],
  }));

  const dynamicStyles = StyleSheet.create({
    container: {
      width: size,
      height: size,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      ...style,
    },
    circle: {
      position: "absolute",
      borderRadius: size / 2,
      borderWidth,
      width: "100%",
      height: "100%",
    },
    circle1: {
      borderColor: colors[0],
      borderTopColor: "transparent",
      borderLeftColor: "transparent",
    },
    circle2: {
      borderColor: colors[1],
      borderTopColor: "transparent",
      borderRightColor: "transparent",
      width: "75%",
      height: "75%",
    },
    circle3: {
      borderColor: colors[2],
      borderBottomColor: "transparent",
      borderRightColor: "transparent",
      width: "50%",
      height: "50%",
    },
  });

  return (
    <Animated.View style={[dynamicStyles.container, containerStyle]}>
      <Animated.View style={[dynamicStyles.circle, dynamicStyles.circle1, animatedStyle1]} />
      <Animated.View style={[dynamicStyles.circle, dynamicStyles.circle2, animatedStyle2]} />
      <Animated.View style={[dynamicStyles.circle, dynamicStyles.circle3, animatedStyle3]} />
    </Animated.View>
  );
};
