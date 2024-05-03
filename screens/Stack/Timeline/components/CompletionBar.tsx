import Colors from "@/constants/Colors";
import Layout from "@/constants/Layout";
import { Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

export default function CompletionBar({
  percentage = 0,
}: {
  percentage: number;
}) {
  const widthStyle = useAnimatedStyle(
    () => ({
      width: withTiming(((Layout.screen.width - 30) * percentage) / 100),
    }),

    [percentage]
  );

  return (
    <View
      style={{
        padding: 5,
        borderRadius: 10,
        backgroundColor: Colors.primary_dark,
      }}
    >
      <Animated.View
        style={[
          {
            borderRadius: 100,
            height: 5,
            backgroundColor: Colors.secondary,
          },
          widthStyle,
        ]}
      />
      {percentage !== 100 && (
        <Text
          style={{
            color: Colors.secondary,
            fontSize: 10,
            position: "absolute",
            right: 5,
          }}
        >
          {percentage || 0}%
        </Text>
      )}
    </View>
  );
}
