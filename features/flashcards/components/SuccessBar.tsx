import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, { interpolateColor, useAnimatedStyle, useDerivedValue, withSpring } from "react-native-reanimated";
import Text from "@/components/ui/Text/Text";
import Colors from "@/constants/Colors";

interface SuccessBarProps {
  correctAnswers: number;
  incorrectAnswers: number;
}

const SuccessBar: React.FC<SuccessBarProps> = ({ correctAnswers, incorrectAnswers }) => {
  const total = correctAnswers + incorrectAnswers || 1;
  const percentage = useDerivedValue(() => {
    return withSpring(correctAnswers / total);
  });

  const barStyle = useAnimatedStyle(() => ({
    width: `${percentage.value * 100}%`,
    backgroundColor: interpolateColor(percentage.value, [0, 0.5, 1], ["#FF4B4B", "#FFA500", "#4CAF50"]),
  }));

  return (
    <View style={styles.container}>
      <View style={styles.barBackground}>
        <Animated.View style={[styles.barForeground, barStyle]} />
      </View>
      <Text variant="caption" style={styles.text}>
        {correctAnswers}/{total}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 5,
  },
  barBackground: {
    flex: 1,
    height: 8,
    backgroundColor: "#444",
    borderRadius: 4,
    overflow: "hidden",
  },
  barForeground: {
    height: "100%",
  },
  text: {
    color: Colors.foreground,
  },
});

export default SuccessBar;
