import { useMemo, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Colors, { secondary_candidates } from "@/constants/Colors";
import Color from "color";
import { gql, useQuery } from "@apollo/client";
import { AntDesign } from "@expo/vector-icons";
import moment from "moment";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay } from "react-native-reanimated";
import { useRefresh } from "@/utils/context/RefreshContext";

const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface AnimatedBarProps {
  value: number;
  prevValue: number;
  maxValue: number;
  color: string;
  label: string;
  index: number;
}

const AnimatedBar = ({ value, prevValue, maxValue, color, label, index }: AnimatedBarProps) => {
  const animatedHeight = useSharedValue(0);
  const animatedPrevHeight = useSharedValue(0);
  const animatedOpacity = useSharedValue(0);

  const CHART_HEIGHT = 150;
  const MIN_BAR_HEIGHT = 12;

  const getBarHeight = (val: number): number => {
    if (!val || !maxValue) return 0;
    const proportion = val / maxValue;
    return Math.max(proportion * CHART_HEIGHT, val > 0 ? MIN_BAR_HEIGHT : 0);
  };

  const targetHeight = getBarHeight(value);
  const targetPrevHeight = getBarHeight(prevValue);

  useEffect(() => {
    animatedOpacity.value = withDelay(index * 100, withTiming(1, { duration: 400 }));
    animatedHeight.value = withDelay(index * 100, withTiming(targetHeight, { duration: 600 }));

    if (targetPrevHeight > 0) {
      animatedPrevHeight.value = withDelay(index * 100, withTiming(targetPrevHeight, { duration: 600 }));
    }
  }, [targetHeight, targetPrevHeight, index]);

  const animatedBarStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
    opacity: animatedOpacity.value,
  }));

  const animatedPrevBarStyle = useAnimatedStyle(() => ({
    height: animatedPrevHeight.value,
    opacity: animatedOpacity.value * 0.6,
  }));

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: animatedOpacity.value,
  }));

  return (
    <Animated.View style={[styles.barContainer, animatedContainerStyle]}>
      <View style={styles.barWrapper}>
        {prevValue > 0 && (
          <Animated.View
            style={[
              styles.prevBar,
              {
                backgroundColor: Color(color).alpha(0.3).string(),
                borderColor: Color(color).alpha(0.5).string(),
              },
              animatedPrevBarStyle,
            ]}
          />
        )}
        {value > 0 && (
          <Animated.View
            style={[
              styles.currentBar,
              {
                backgroundColor: color,
              },
              animatedBarStyle,
            ]}
          />
        )}
      </View>
      <Text style={[styles.dayLabel, { color }]}>{label}</Text>
    </Animated.View>
  );
};

const STATISTICS_DAY_OF_WEEK = gql`
  query StatisticsDayOfWeek($startDate: String!, $endDate: String!) {
    statisticsDayOfWeek(startDate: $startDate, endDate: $endDate) {
      day
      total
    }
  }
`;

interface CompactSpendingChartProps {}

const CompactSpendingChart = ({}: CompactSpendingChartProps) => {
  const dateRange = useMemo(() => [moment().startOf("isoWeek").format("YYYY-MM-DD"), moment().endOf("isoWeek").format("YYYY-MM-DD")], []);

  const previousDateRange = useMemo(
    () => [
      moment().subtract(1, "weeks").startOf("isoWeek").format("YYYY-MM-DD"),
      moment().subtract(1, "weeks").endOf("isoWeek").format("YYYY-MM-DD"),
    ],
    []
  );

  const query = useQuery(STATISTICS_DAY_OF_WEEK, { variables: { startDate: dateRange[0], endDate: dateRange[1] } });

  const prevQuery = useQuery(STATISTICS_DAY_OF_WEEK, { variables: { startDate: previousDateRange[0], endDate: previousDateRange[1] } });

  useRefresh([query.refetch, prevQuery.refetch], [dateRange, previousDateRange]);

  const { chartData, maxValue, total, prevTotal, percentageChange } = useMemo(() => {
    const data = (query.data?.statisticsDayOfWeek || []) as any;
    const prevData = (prevQuery.data?.statisticsDayOfWeek || []) as any;

    const prevDataMap = new Map(prevData.map((item) => [item.day, item.total]));

    const days = Array.from({ length: 7 }, (_, i) => {
      const dayData = data.find((d) => d.day === i + 1);
      const prevValue = prevDataMap.get(i + 1) || 0;

      return {
        label: labels[i],
        value: dayData?.total || 0,
        prevValue,
        day: i + 1,
      };
    });

    const allValues = [...days.map((d) => d.value), ...days.map((d) => d.prevValue)].filter((v) => v > 0);
    const maxVal = allValues.length > 0 ? Math.max(...allValues) * 1.2 : 100;

    const currentTotal = data.reduce((acc, curr) => acc + curr.total, 0);
    const previousTotal = prevData.reduce((acc, curr) => acc + curr.total, 0);
    const change = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

    return {
      chartData: days,
      maxValue: maxVal,
      total: currentTotal,
      prevTotal: previousTotal,
      percentageChange: change,
    };
  }, [query.data, prevQuery.data]);

  if (query.loading || prevQuery.loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.changeIndicator}>
          <AntDesign
            name={percentageChange >= 0 ? "caretup" : "caretdown"}
            size={12}
            color={percentageChange >= 0 ? "#FF8A80" : "#4ECDC4"}
          />
          <Text
            style={[
              styles.changeText,
              {
                color: percentageChange >= 0 ? "#FF8A80" : "#4ECDC4",
              },
            ]}
          >
            {Math.abs(Math.round(percentageChange))}% {percentageChange >= 0 ? "increase" : "decrease"} in this week
          </Text>
        </View>
      </View>

      <View style={styles.chartWrapper}>
        <View style={styles.yAxisLabels}>
          {[4, 3, 2, 1, 0].map((i) => {
            const value = Math.round((maxValue / 4) * i);
            return (
              <Text key={i} style={styles.yAxisLabel}>
                {value > 1000 ? `${(value / 1000).toFixed(1)}k` : value}
              </Text>
            );
          })}
        </View>

        <View style={styles.chartContent}>
          <View style={styles.gridLines}>
            {[0, 1, 2, 3, 4].map((i) => (
              <View key={i} style={[styles.gridLine, { bottom: (132 / 4) * i }]} />
            ))}
          </View>

          <View style={styles.chartContainer}>
            {chartData.map((item, index) => (
              <AnimatedBar
                key={index}
                value={item.value}
                prevValue={item.prevValue}
                maxValue={maxValue}
                color={secondary_candidates[index % secondary_candidates.length]}
                label={item.label}
                index={index}
              />
            ))}
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.prevAmount}>{Math.round(prevTotal)}zł</Text>
          <Text style={styles.totalLabel}>{previousDateRange.map((d) => d.split("-").slice(1).join("-")).join(" to ")}</Text>
          <Text style={[styles.totalLabel, { fontSize: 15 }]}>Last week</Text>
        </View>

        <View style={styles.tinyLegendContainer}>
          <View style={styles.tinyLegendItem}>
            <View style={[styles.tinyLegendDot, { backgroundColor: Color(secondary_candidates[0]).alpha(0.4).string() }]} />
            <Text style={styles.tinyLegendText}>Previous</Text>
          </View>
          <View style={styles.tinyLegendItem}>
            <View style={[styles.tinyLegendDot, { backgroundColor: secondary_candidates[0] }]} />
            <Text style={styles.tinyLegendText}>Current</Text>
          </View>
        </View>

        <View style={styles.totalContainer}>
          <Text style={styles.totalAmount}>{Math.round(total)}zł</Text>
          <Text style={styles.totalLabel}>{dateRange.map((d) => d.split("-").slice(1).join("-")).join(" to ")}</Text>
          <Text style={[styles.totalLabel, { fontSize: 15 }]}>This week</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text_light,
  },
  changeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    position: "absolute",
    right: 0,
    top: 0,
  },
  changeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  chartWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  yAxisLabels: {
    width: 35,
    height: 160,
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingRight: 8,
  },
  yAxisLabel: {
    color: Colors.text_light,
    fontSize: 10,
    opacity: 0.7,
  },
  chartContent: {
    flex: 1,
    position: "relative",
  },
  gridLines: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 160,
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 0.5,
    backgroundColor: Color(Colors.secondary).lighten(0.8).alpha(0.2).string(),
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 170,
    marginBottom: 4,
    paddingHorizontal: 8,
  },
  barContainer: {
    alignItems: "center",
    flex: 1,
  },
  barWrapper: {
    width: 36,
    height: 170,
    justifyContent: "flex-end",
    alignItems: "center",
    position: "relative",
  },
  currentBar: {
    width: "90%",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    position: "absolute",
    bottom: 0,
  },
  prevBar: {
    width: "90%",
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    position: "absolute",
    bottom: 0,
    borderWidth: 1,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 3,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },
  totalContainer: {
    alignItems: "center",
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text_light,
    marginBottom: 2,
  },
  prevAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: Color(Colors.text_light).alpha(0.7).string(),
    marginBottom: 2,
  },
  totalLabel: {
    fontSize: 9,
    color: Colors.text_light,
    opacity: 0.6,
  },
  tinyLegendContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  tinyLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  tinyLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 10,
  },
  tinyLegendText: {
    fontSize: 12,
    color: Colors.text_light,
    opacity: 0.6,
    fontWeight: "500",
  },
  loadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: Colors.text_light,
    fontSize: 14,
    opacity: 0.7,
  },
});

export default CompactSpendingChart;
