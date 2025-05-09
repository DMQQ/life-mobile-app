import { PieChart as GFTPieChart } from "react-native-gifted-charts";
import Colors, { secondary_candidates } from "@/constants/Colors";
import Layout from "@/constants/Layout";
import { Text, View } from "react-native";
import Color from "color";

interface PieChartProps {
  onPress: (dt: { label: string; value: number; color: string }) => void;
  data: { label: string; value: number; color: string }[];
  totalSum: number;
}

const blueText = Color(Colors.primary).lighten(10).string();

export default function PieChart(props: PieChartProps) {
  return (
    <GFTPieChart
      onPress={props.onPress}
      animationDuration={1000}
      innerCircleColor={Colors.primary}
      showGradient
      donut
      radius={(Layout.screen.width - 30) / 3}
      data={props.data.length !== 0 ? props.data : [{ label: "No data", value: 1, color: secondary_candidates[0] }]}
      showText
      isAnimated
      focusOnPress
      innerRadius={70}
      centerLabelComponent={() => (
        <View>
          <Text
            style={{
              color: "#fff",
              fontSize: 20,
              fontWeight: "bold",
            }}
          >
            {props.totalSum.toFixed(2)}zł
          </Text>
          <Text
            style={{
              color: blueText,
              fontSize: 14,
              fontWeight: "bold",
              textAlign: "center",
              marginTop: 5,
            }}
          >
            Total
          </Text>
        </View>
      )}
    />
  );
}
