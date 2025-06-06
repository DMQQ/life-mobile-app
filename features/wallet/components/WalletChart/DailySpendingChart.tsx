import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { BarChart, LineChart } from "react-native-gifted-charts";
import moment from "moment";
import Layout from "@/constants/Layout";
import Colors, { secondary_candidates } from "@/constants/Colors";
import { Icons } from "../ExpenseIcon";
import Color from "color";

interface Expense {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: string;
  balanceBeforeInteraction: number;
  category: string;
}

interface Props {
  data: Expense[];
}

export default function DailySpendingChart({ data }: Props) {
  const chartData = useMemo(() => {
    const dailySpending = data.reduce((acc, expense) => {
      const day = moment(expense.date).format("YYYY-MM-DD");
      acc[day] = (acc[day] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(dailySpending)
      .sort(([dateA], [dateB]) => moment(dateA).diff(moment(dateB)))
      .map(([date, total], index) => ({
        value: Math.round(total),
        label: moment(date).format("DD"),
        labelTextStyle: { color: "#fff" },
        dataPointText: total > 0 ? `${Math.round(total)}zł` : "",
        frontColor: secondary_candidates[index % secondary_candidates.length],
      }));
  }, [data]);

  const maxSpending = Math.max(...chartData.map((d) => d.value));
  const totalSpending = chartData.reduce((sum, d) => sum + d.value, 0);
  const averageSpending = totalSpending / chartData.length;

  return (
    <View style={{ marginVertical: 20, gap: 5 }}>
      <View style={{ width: "100%", marginBottom: 10 }}>
        <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>Daily spendings</Text>
        <Text style={{ color: "gray", marginTop: 5 }}>Sum of expenses for each day shown on a chart</Text>
      </View>

      <Text style={{ color: "#fff", marginBottom: 15 }}>
        From: {moment(data?.[data.length - 1]?.date).format("MMM D, YYYY")} to {moment(data?.[0]?.date).format("MMM D, YYYY")}
      </Text>

      <View style={{ height: 300 }}>
        <BarChart
          width={Layout.screen.width - 60}
          height={Layout.screen.height / 3.5}
          sideColor={"#fff"}
          barWidth={35}
          noOfSections={3}
          barBorderRadius={4}
          frontColor={Colors.secondary}
          yAxisTextStyle={{ color: "#fff" }}
          rulesColor={Color(Colors.primary).lighten(1.5).string()}
          yAxisThickness={0}
          xAxisThickness={0}
          isAnimated
          data={chartData}
        />
      </View>

      <View style={{ flexDirection: "row", gap: 16, padding: 0, marginTop: 40 }}>
        <View
          style={{
            flex: 1,
            padding: 16,
            backgroundColor: Colors.primary_lighter,
            borderRadius: 8,
            gap: 5,
          }}
        >
          <Text style={{ fontSize: 14, color: "#fff" }}>Daily Average</Text>
          <Text style={{ fontSize: 25, fontWeight: "600", color: Colors.secondary }}>{Math.round(averageSpending).toLocaleString()}zł</Text>
        </View>

        <View
          style={{
            flex: 1,
            padding: 16,
            backgroundColor: Colors.primary_lighter,
            borderRadius: 8,
            gap: 5,
          }}
        >
          <Text style={{ fontSize: 14, color: "#fff" }}>Peak Spending</Text>
          <Text style={{ fontSize: 25, fontWeight: "600", color: Colors.secondary }}>{maxSpending.toLocaleString()}zł</Text>
        </View>
      </View>
    </View>
  );
}
