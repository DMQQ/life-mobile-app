import { Wallet } from "@/types";
import { useMemo } from "react";
import { View } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import Colors from "@/constants/Colors";

interface ChartsProps {
  data: { wallet: Wallet };
}

export default function Charts({ data }: ChartsProps) {
  const barData = useMemo(() => {
    const mapped = data.wallet.expenses.reduce((acc, curr) => {
      const key = curr.category;

      if (!key || curr.description.startsWith("Balance")) return acc;

      if (!acc[key]) {
        acc[key] = 0;
      }
      acc[key] += curr.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(mapped).map(([key, value]) => ({
      value,
      label: key,
    })) as { value: number; label: string }[];
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <BarChart
        barWidth={20}
        noOfSections={3}
        barBorderRadius={4}
        frontColor={Colors.secondary}
        data={barData}
        yAxisThickness={0}
        xAxisThickness={0}
        isAnimated
      />
    </View>
  );
}
