import { useMemo } from "react";
import { View, Text } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import Layout from "@/constants/Layout";
import Colors, { secondary_candidates } from "@/constants/Colors";
import Color from "color";
import ChartTemplate from "./ChartTemplate";
import { gql, useQuery } from "@apollo/client";

function DailySpendingChart({ dateRange }: { dateRange: [string, string] }) {
  const query = useQuery(
    gql`
      query SpendingsByDay($startDate: String!, $endDate: String!) {
        statisticsDailySpendings(startDate: $startDate, endDate: $endDate) {
          total
          date
          day
        }
      }
    `,
    { variables: { startDate: dateRange[0], endDate: dateRange[1] } }
  );

  const data = query?.data?.statisticsDailySpendings || [];

  const chartData = useMemo(() => {
    return data.map((expense: any, index: number) => ({
      value: Math.round(expense.total),
      label: expense.day,
      labelTextStyle: { color: "#fff" },
      dataPointText: expense.total > 0 ? `${Math.round(expense.total)}zł` : "",
      frontColor: secondary_candidates[index % secondary_candidates.length],
      date: expense.date,
      day: expense.day,
    }));
  }, [data]);

  const maxSpending = Math.max(...chartData.map((d: any) => d.value));
  const totalSpending = chartData.reduce((sum: number, d: any) => sum + d.value, 0);
  const averageSpending = totalSpending / chartData.length;

  return (
    <View style={{ marginVertical: 20, gap: 5 }}>
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

export default () => {
  return (
    <ChartTemplate title="Daily spendings" description="Sum of expenses for every day" types={[]}>
      {({ dateRange }) => <DailySpendingChart dateRange={dateRange} />}
    </ChartTemplate>
  );
};
