import { useMemo } from "react";
import { View, Text } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import Layout from "@/constants/Layout";
import Colors, { secondary_candidates } from "@/constants/Colors";
import Color from "color";
import ChartTemplate from "./ChartTemplate";
import { gql, useQuery } from "@apollo/client";

function DailySpendingChart({ dateRange }: { dateRange: [string, string] }) {
  const previousDateRange = useMemo(() => {
    const startDate = new Date(dateRange[0]);
    const endDate = new Date(dateRange[1]);
    const diffTime = endDate.getTime() - startDate.getTime();

    const prevEndDate = new Date(startDate.getTime() - 1);
    const prevStartDate = new Date(prevEndDate.getTime() - diffTime);

    return [prevStartDate.toISOString().split("T")[0], prevEndDate.toISOString().split("T")[0]];
  }, [dateRange]);

  const currentQuery = useQuery(
    gql`
      query CurrentSpendingsByDay($startDate: String!, $endDate: String!) {
        statisticsDailySpendings(startDate: $startDate, endDate: $endDate) {
          total
          date
          day
        }
      }
    `,
    { variables: { startDate: dateRange[0], endDate: dateRange[1] } }
  );

  const previousQuery = useQuery(
    gql`
      query PreviousSpendingsByDay($startDate: String!, $endDate: String!) {
        statisticsDailySpendings(startDate: $startDate, endDate: $endDate) {
          total
          date
          day
        }
      }
    `,
    { variables: { startDate: previousDateRange[0], endDate: previousDateRange[1] } }
  );

  const currentData = currentQuery?.data?.statisticsDailySpendings || [];
  const previousData = previousQuery?.data?.statisticsDailySpendings || [];

  const { groupedCurrentData, groupedPreviousData } = useMemo(() => {
    const groupByDay = (data: any[]) => {
      const grouped: { [key: number]: number } = {};
      data.forEach((item) => {
        const dayOfMonth = parseInt(item.day);
        if (!grouped[dayOfMonth]) grouped[dayOfMonth] = 0;
        grouped[dayOfMonth] += item.total;
      });
      return grouped;
    };

    const currentGrouped = groupByDay(currentData);
    const previousGrouped = groupByDay(previousData);

    const allDays = new Set([...Object.keys(currentGrouped).map(Number), ...Object.keys(previousGrouped).map(Number)]);

    const sortedDays = Array.from(allDays).sort((a, b) => a - b);

    const alignedCurrent = sortedDays.map((day) => ({
      value: Math.round(currentGrouped[day] || 0),
      label: day.toString(),
      labelTextStyle: { color: "#fff" },
      dataPointText: currentGrouped[day] > 0 ? `${Math.round(currentGrouped[day])}zł` : "",
      dataPointColor: secondary_candidates[0],
      day: day,
    }));

    const alignedPrevious = sortedDays.map((day) => ({
      value: Math.round(previousGrouped[day] || 0),
      dataPointColor: secondary_candidates[5],
      day: day,
    }));

    return {
      groupedCurrentData: alignedCurrent,
      groupedPreviousData: alignedPrevious,
    };
  }, [currentData, previousData]);

  const maxSpending = groupedCurrentData.length
    ? Math.max(...groupedCurrentData.map((d: any) => d.value), ...groupedPreviousData.map((d: any) => d.value))
    : 0;

  const currentTotal = groupedCurrentData.reduce((sum: number, d: any) => sum + d.value, 0);
  const currentAverage = currentTotal / (groupedCurrentData.length || 1);

  const previousTotal = groupedPreviousData.reduce((sum: number, d: any) => sum + d.value, 0);
  const previousAverage = previousTotal / (groupedPreviousData.length || 1);
  const changePercent = previousAverage > 0 ? ((currentAverage - previousAverage) / previousAverage) * 100 : 0;

  const periodLabel = useMemo(() => {
    const start = new Date(dateRange[0]);
    const end = new Date(dateRange[1]);
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 7) return `${diffDays} days`;
    if (diffDays <= 31) return `${Math.ceil(diffDays / 7)} weeks`;
    if (diffDays <= 365) return `${Math.ceil(diffDays / 30)} months`;
    return `${Math.ceil(diffDays / 365)} years`;
  }, [dateRange]);

  if (currentQuery.loading || previousQuery.loading) {
    return (
      <View style={{ height: Layout.screen.height / 3.5, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#fff" }}>Loading...</Text>
      </View>
    );
  }

  if (!groupedCurrentData.length) {
    return (
      <View style={{ height: Layout.screen.height / 3.5, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#fff" }}>No data available</Text>
      </View>
    );
  }

  return (
    <View style={{ marginVertical: 20, gap: 5 }}>
      <LineChart
        width={Layout.screen.width - 60}
        height={Layout.screen.height / 3.5}
        color={secondary_candidates[0]}
        thickness={4}
        color2={secondary_candidates[5]}
        thickness2={3}
        noOfSections={3}
        maxValue={Math.max(maxSpending * 1.1, 100)}
        yAxisTextStyle={{ color: "#fff" }}
        rulesColor={Color(Colors.primary).lighten(1.5).string()}
        yAxisThickness={0}
        xAxisThickness={0}
        isAnimated
        curved
        showDataPointOnFocus
        showStripOnFocus
        showTextOnFocus
        stripColor={secondary_candidates[3]}
        dataPointsRadius={3}
        focusedDataPointRadius={6}
        focusedDataPointColor={secondary_candidates[2]}
        data={groupedCurrentData}
        data2={groupedPreviousData}
        startFillColor={secondary_candidates[0]}
        endFillColor={Color(secondary_candidates[0]).alpha(0.1).string()}
        startFillColor2={secondary_candidates[5]}
        endFillColor2={Color(secondary_candidates[5]).alpha(0.1).string()}
        startOpacity={0.7}
        endOpacity={0.1}
        startOpacity2={0.5}
        endOpacity2={0.05}
        areaChart
      />

      <View style={{ flexDirection: "row", gap: 8, marginTop: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <View style={{ width: 12, height: 3, backgroundColor: secondary_candidates[0], borderRadius: 2 }} />
          <Text style={{ fontSize: 12, color: "#fff" }}>Current Period ({periodLabel})</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <View style={{ width: 12, height: 3, backgroundColor: secondary_candidates[5], borderRadius: 2 }} />
          <Text style={{ fontSize: 12, color: "#fff" }}>Previous Period ({periodLabel})</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 16, padding: 0, marginTop: 20 }}>
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
          <Text style={{ fontSize: 25, fontWeight: "600", color: Colors.secondary }}>{Math.round(currentAverage).toLocaleString()}zł</Text>
          <Text style={{ fontSize: 12, color: changePercent >= 0 ? "#4ade80" : "#f87171" }}>
            {changePercent >= 0 ? "+" : ""}
            {changePercent.toFixed(1)}% vs prev
          </Text>
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
          <Text style={{ fontSize: 14, color: "#fff" }}>Peak Day</Text>
          <Text style={{ fontSize: 25, fontWeight: "600", color: Colors.secondary }}>{maxSpending.toLocaleString()}zł</Text>
        </View>
      </View>
    </View>
  );
}

export default () => {
  return (
    <ChartTemplate title="Daily spendings by day" description="Spending patterns: current vs previous period grouped by day" types={[]}>
      {({ dateRange }) => <DailySpendingChart dateRange={dateRange} />}
    </ChartTemplate>
  );
};
