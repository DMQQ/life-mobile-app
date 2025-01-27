import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import moment from "moment";
import Layout from "@/constants/Layout";
import Colors from "@/constants/Colors";

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
      .map(([date, total]) => ({
        value: Math.round(total),
        label: moment(date).format("DD"),
        labelTextStyle: { color: "#333" },
        dataPointText: total > 0 ? `$${Math.round(total)}` : "",
      }));
  }, [data]);

  const maxSpending = Math.max(...chartData.map((d) => d.value));
  const totalSpending = chartData.reduce((sum, d) => sum + d.value, 0);
  const averageSpending = totalSpending / chartData.length;

  return (
    <View style={{ padding: 16, gap: 5 }}>
      <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>Daily spendings</Text>
      <Text style={{ color: "gray", fontSize: 16, marginBottom: 15 }}>Sum of expenses for each day shown on a chart</Text>

      <View style={{ height: 300 }}>
        <LineChart
          width={Layout.screen.width - 30}
          data={chartData}
          height={280}
          spacing={40}
          initialSpacing={20}
          color="#2563eb"
          thickness={2}
          hideDataPoints={false}
          dataPointsColor="#2563eb"
          xAxisColor="#666"
          yAxisColor="#666"
          yAxisTextStyle={{ color: "#333" }}
          xAxisLabelTextStyle={{ color: "#333" }}
          hideRules
          yAxisTextNumberOfLines={1}
          yAxisLabelWidth={60}
          showDataPointOnPress
          focusEnabled
          curved
        />
      </View>

      <View style={{ flexDirection: "row", gap: 16, padding: 15 }}>
        <View
          style={{
            flex: 1,
            padding: 16,
            backgroundColor: Colors.primary_lighter,
            borderRadius: 8,
          }}
        >
          <Text style={{ fontSize: 14, color: "#fff" }}>Daily Average</Text>
          <Text style={{ fontSize: 20, fontWeight: "600", color: Colors.secondary }}>{Math.round(averageSpending).toLocaleString()}zł</Text>
        </View>

        <View
          style={{
            flex: 1,
            padding: 16,
            backgroundColor: Colors.primary_lighter,
            borderRadius: 8,
          }}
        >
          <Text style={{ fontSize: 14, color: "#fff" }}>Peak Spending</Text>
          <Text style={{ fontSize: 20, fontWeight: "600", color: Colors.secondary }}>{maxSpending.toLocaleString()}zł</Text>
        </View>
      </View>
    </View>
  );
}
