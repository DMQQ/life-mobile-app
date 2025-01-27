import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { barDataItem, LineChart } from "react-native-gifted-charts";
import moment from "moment";
import Colors from "@/constants/Colors";
import Layout from "@/constants/Layout";

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
  income: number;

  currentBalance: number;
}

export default function FutureProjection({ data, income, currentBalance: currentBalanceProps }: Props) {
  const projectionData = useMemo(() => {
    // Group expenses by month
    const monthlyExpenses = data.reduce((acc, expense) => {
      const month = moment(expense.date).format("YYYY-MM");
      if (!acc[month]) acc[month] = [];
      acc[month].push(expense);
      return acc;
    }, {} as Record<string, Expense[]>);

    // Calculate monthly totals and sort them
    const monthlyTotals = Object.entries(monthlyExpenses)
      .map(([month, expenses]) => ({
        month,
        total: expenses.reduce((sum, expense) => sum + expense.amount, 0),
      }))
      .sort((a, b) => moment(b.month).diff(moment(a.month)));

    // Calculate weighted average, giving more weight to recent months
    let totalWeight = 0;
    let weightedSum = 0;

    monthlyTotals.forEach((monthly, index) => {
      // Exclude extreme outliers (more than 2x the median)
      const median = monthlyTotals[Math.floor(monthlyTotals.length / 2)].total;
      if (monthly.total > median * 2) return;

      // Weight calculation: more recent months have higher weight
      const weight = Math.max(1, monthlyTotals.length - index) / monthlyTotals.length;
      weightedSum += monthly.total * weight;
      totalWeight += weight;
    });

    const averageMonthlyExpense = totalWeight ? weightedSum / totalWeight : 0;

    const projectionMonths = 12;
    let currentBalance = currentBalanceProps;

    return Array.from({ length: projectionMonths }, (_, i) => {
      currentBalance = currentBalance + income - averageMonthlyExpense;
      return {
        value: Math.round(currentBalance),
        label: moment().add(i, "months").format("MMM"),
        expenses: Math.round(averageMonthlyExpense),
        labelTextStyle: { color: "#fff" },
      };
    }) as barDataItem[];
  }, [data, income, currentBalanceProps]);
  return (
    <View style={{ padding: 20, gap: 16 }}>
      <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold", marginBottom: 5 }}>Balance projection</Text>
      <Text style={{ color: "gray", fontSize: 16, marginBottom: 5 }}>Takes current spending avarage and calculates the balance</Text>

      <View style={{ height: 300 }}>
        <LineChart
          width={Layout.screen.width - 60}
          data={projectionData}
          height={230}
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
        />
      </View>

      <View style={{ flexDirection: "row", gap: 16 }}>
        <View
          style={{
            flex: 1,
            padding: 16,
            backgroundColor: Colors.primary_lighter,
            borderRadius: 8,
            gap: 8,
          }}
        >
          <Text style={{ fontSize: 14, color: "#fff" }}>Average Expenses</Text>
          <Text style={{ fontSize: 20, fontWeight: "600", color: Colors.secondary }}>{projectionData[0]?.expenses.toLocaleString()}zł</Text>
        </View>

        <View
          style={{
            flex: 1,
            padding: 16,
            backgroundColor: Colors.primary_lighter,
            borderRadius: 8,
            gap: 8,
          }}
        >
          <Text style={{ fontSize: 14, color: "#fff" }}>Projected Balance (12mo)</Text>
          <Text style={{ fontSize: 20, fontWeight: "600", color: Colors.secondary }}>
            {projectionData[projectionData.length - 1]?.value.toLocaleString()}zł
          </Text>
        </View>
      </View>
    </View>
  );
}
