import { Wallet } from "@/types";
import { useMemo } from "react";
import { View } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import Colors from "@/constants/Colors";
import Color from "color";
import Layout from "@/constants/Layout";

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
      sideColor={"#fff"}
      barWidth={20}
      noOfSections={3}
      barBorderRadius={4}
      frontColor={Colors.secondary}
      yAxisTextStyle={{ color: "#fff" }}
      rulesColor={Color(Colors.primary).lighten(1.5).string()}
      data={data.map((item) => ({
        ...item,
        frontColor: item.color,
        labelComponent: () => (
          <View
            style={{
              width: 10,
              height: 10,
              backgroundColor: item.color,
              borderRadius: 15,
              marginLeft: 15,
              marginTop: 5,
            }}
          />
        ),
      }))}
      yAxisThickness={0}
      xAxisThickness={0}
      isAnimated
    />
  );
}
