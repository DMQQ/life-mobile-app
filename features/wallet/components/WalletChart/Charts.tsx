import { Text, View } from "react-native";
import { BarChart, barDataItem } from "react-native-gifted-charts";
import Colors from "@/constants/Colors";
import Color from "color";
import Layout from "@/constants/Layout";
import { Icons } from "../Expense/ExpenseIcon";
import lowOpacity from "@/utils/functions/lowOpacity";

interface ChartsProps {
  data: any[];
  onPress: (dt: { label: string; value: number; color: string }) => void;
}

export default function Charts({ data, onPress }: ChartsProps) {
  return (
    <BarChart
      onPress={onPress}
      width={Layout.screen.width - 60}
      height={Layout.screen.height / 3.5}
      sideColor={Colors.foreground}
      barWidth={35}
      noOfSections={3}
      barBorderRadius={4}
      frontColor={Colors.secondary}
      yAxisTextStyle={{ color: Colors.foreground }}
      rulesColor={Color(Colors.primary).lighten(1.5).string()}
      data={
        data.map((item) => ({
          ...item,
          frontColor: item.color,

          labelComponent: () => (
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <View
                style={{
                  marginTop: 10,
                  backgroundColor: lowOpacity(item.color, 0.2),
                  padding: 5,
                  borderRadius: 100,
                  height: 35,
                  width: 35,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {Icons?.[item?.label as keyof typeof Icons]?.icon}
              </View>
            </View>
          ),
          topLabelComponent: () => <Text style={{ color: item.color }}>{Math.trunc(item.value)}</Text>,
        })) as barDataItem[]
      }
      yAxisThickness={0}
      xAxisThickness={0}
      isAnimated
    />
  );
}
