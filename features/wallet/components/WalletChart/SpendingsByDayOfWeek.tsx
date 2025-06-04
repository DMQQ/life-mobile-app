import Layout from "@/constants/Layout";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Colors, { secondary_candidates } from "@/constants/Colors";
import { BarChart } from "react-native-gifted-charts";
import Color from "color";
import ChartTemplate, { Types } from "./ChartTemplate";
import { gql, useQuery } from "@apollo/client";

interface LegendProps {
  data: { label: string; value: number; frontColor?: string; color?: string }[];
  totalSum: number;

  type: "total" | "avg" | "median" | "count";
}

const labels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function ChartLegend({ data, totalSum, type }: LegendProps) {
  return (
    <View style={styles.legendContainer}>
      {data.map((item, index) => (
        <View key={index} style={styles.legendItem}>
          <View style={[styles.colorIndicator, { backgroundColor: item.color || item.frontColor }]} />
          <View style={styles.legendTextContainer}>
            <Text style={styles.legendLabel}>{labels[index]}</Text>
            <Text style={styles.legendValue}>
              {item.value.toFixed(type === "count" ? 0 : 2)}
              {type !== "count" && "zł"}
            </Text>
          </View>
          <Text style={styles.legendPercentage}>{((item.value / totalSum) * 100).toFixed(2)}%</Text>
        </View>
      ))}
    </View>
  );
}

const blueText = Color(Colors.primary).lighten(10).string();

const SpendingsByDay = ({ type, ...props }: { dateRange: [string, string]; type: Types }) => {
  const query = useQuery<{
    statisticsDayOfWeek: { day: number; total: number; avg: number; median: number; count: number }[];
  }>(
    gql`
      query StatisticsDayOfWeek($startDate: String!, $endDate: String!) {
        statisticsDayOfWeek(startDate: $startDate, endDate: $endDate) {
          day
          total
          avg
          median
          count
        }
      }
    `,
    {
      variables: {
        startDate: props.dateRange[0],
        endDate: props.dateRange[1],
      },
      fetchPolicy: "cache-and-network",
    }
  );

  const data = query.data?.statisticsDayOfWeek || [];

  const days = useMemo(() => {
    return data.map((item, index) => ({
      label: labels[item.day - 1].slice(0, 3),
      value: item[type],
      frontColor: secondary_candidates[index % secondary_candidates.length],
      labelTextStyle: { color: "#fff" },
    }));
  }, [data, type]);

  const total = useMemo(() => {
    const totalValue = data.reduce((acc, curr) => acc + curr[type], 0);
    return totalValue;
  }, [days]);

  return (
    <View>
      <View style={{ minHeight: 400 }}>
        <BarChart
          key={type}
          width={Layout.screen.width - 60}
          height={Layout.screen.height / 4}
          sideColor={"#fff"}
          barWidth={30}
          noOfSections={5}
          barBorderRadius={5}
          frontColor={Colors.secondary}
          yAxisTextStyle={{ color: "#fff" }}
          rulesColor={Color(Colors.primary).lighten(1.5).string()}
          data={days}
          yAxisThickness={0}
          xAxisThickness={0}
          yAxisLabelSuffix="zł"
          yAxisLabelWidth={50}
        />
        <View style={styles.barLegendContainer}>
          <ChartLegend type={type} data={days} totalSum={total} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 5,
  },
  barLegendContainer: {
    marginTop: 15,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: Color(Colors.primary).lighten(0.3).string(),
    borderRadius: 8,
    width: "48%", // For 2-column grid layout
  },
  colorIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 8,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  legendValue: {
    color: blueText,
    fontSize: 12,
    marginTop: 2,
  },
  legendPercentage: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
  },
});

export default () => {
  return (
    <ChartTemplate
      types={["total", "count", "avg", "median"] as Types[]}
      title="Spendings by day of week"
      description="Spendings by day of week in total/avg/media/count"
    >
      {({ dateRange, type }) => <SpendingsByDay dateRange={dateRange} type={type} />}
    </ChartTemplate>
  );
};
