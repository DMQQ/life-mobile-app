import React, { useMemo } from "react";
import { View, Text, ScrollView } from "react-native";
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

    const projectionMonths = 9;
    let runningBalance = currentBalanceProps;
    const monthlyNet = income - averageMonthlyExpense;

    return Array.from({ length: projectionMonths }, (_, i) => {
      // For the first month, use current balance as starting point
      // For subsequent months, update balance based on net monthly flow
      if (i > 0) {
        runningBalance += monthlyNet;
      }

      return {
        value: Math.round(runningBalance),
        label: moment().add(i, "months").format("MMM"),
        expenses: Math.round(averageMonthlyExpense),
        labelTextStyle: { color: "#fff" },
      };
    }) as barDataItem[];
  }, [data, income, currentBalanceProps]);

  return (
    <View style={{ overflow: "hidden", marginVertical: 20 }}>
      <View style={{ width: "100%", marginBottom: 10 }}>
        <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>Balance projection</Text>
        <Text style={{ color: "gray", marginTop: 5 }}>Takes current spending average and calculates the balance</Text>
      </View>

      <ScrollView style={{ height: 300, overflow: "hidden" }}>
        <LineChart
          width={Layout.screen.width - 60}
          data={projectionData}
          height={230}
          spacing={50}
          initialSpacing={5}
          color="#2563eb"
          thickness={2}
          hideDataPoints={false}
          dataPointsColor="#2563eb"
          xAxisColor="#666"
          yAxisColor="#666"
          // Adding gradient
          areaChart
          startFillColor="rgba(37, 99, 235, 0.3)"
          endFillColor="rgba(37, 99, 235, 0.01)"
          startOpacity={0.9}
          endOpacity={0.2}
          // Enhanced data points
          dataPointsHeight={8}
          dataPointsWidth={8}
          dataPointsRadius={4}
          dataPointsShape="circle"
          // Text styles
          yAxisTextStyle={{ color: "#fff" }}
          xAxisLabelTextStyle={{ color: "#fff" }}
          hideRules
          yAxisTextNumberOfLines={1}
          yAxisLabelWidth={60}
          yAxisLabelSuffix="zł"
        />
      </ScrollView>

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
          <Text style={{ fontSize: 25, fontWeight: "600", color: Colors.secondary }}>{projectionData[0]?.expenses.toLocaleString()}zł</Text>
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
          <Text style={{ fontSize: 14, color: "#fff" }}>Projection for (9mo)</Text>
          <Text style={{ fontSize: 25, fontWeight: "600", color: Colors.secondary }}>
            {projectionData[projectionData.length - 1]?.value.toLocaleString()}zł
          </Text>
        </View>
      </View>
    </View>
  );
}
