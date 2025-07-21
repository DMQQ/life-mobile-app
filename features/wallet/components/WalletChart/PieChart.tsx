import { PieChart as GFTPieChart } from "react-native-gifted-charts";
import Colors, { secondary_candidates } from "@/constants/Colors";
import Layout from "@/constants/Layout";
import { View } from "react-native";
import Color from "color";
import Text from "@/components/ui/Text/Text";

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
      innerCircleColor={Colors.primary}
      showGradient
      donut
      radius={(Layout.screen.width - 30) / 2.6}
      data={
        props.data.length !== 0
          ? props.data.map((v) => ({ ...v, value: +v.value.toFixed(2) }))
          : [{ label: "No data", value: 1, color: secondary_candidates[0] }]
      }
      textSize={15}
      showValuesAsLabels
      showValuesAsTooltipText
      showTooltip
      textColor={Colors.foreground}
      innerRadius={90}
      centerLabelComponent={() => (
        <View>
          <Text
            variant="subheading"
            style={{
              color: Colors.foreground,
            }}
          >
            {props.totalSum.toFixed(2)}zł
          </Text>
          <Text
            variant="caption"
            style={{
              color: blueText,
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
