import Layout from "@/constants/Layout";
import { useMemo, useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import Colors, { secondary_candidates } from "@/constants/Colors";
import Color from "color";
import lowOpacity from "@/utils/functions/lowOpacity";
import { gql, useQuery } from "@apollo/client";
import ChartTemplate, { Types } from "./ChartTemplate";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS, interpolate, Extrapolation } from "react-native-reanimated";

const GET_HOURLY_SPENDINGS = gql`
  query HourlySpendings($months: [String!]!) {
    hourlySpendingsHeatMap(months: $months) {
      hour
      count
      avg_amount
      min_amount
      max_amount
      std_deviation
      variance
    }
  }
`;

interface HourlyData {
  hour: number;
  count: number;
  avg_amount: number;
  min_amount: number;
  max_amount: number;
  std_deviation: number;
  variance: number;
}

interface BarItem {
  hour: number;
  value: number;
  displayValue: number;
  color: string;
  count?: number;
  min?: number;
  max?: number;
  isOutlier?: boolean;
  prevValue?: number;
  prevDisplayValue?: number;
  prevCount?: number;
  prevMin?: number;
  prevMax?: number;
}

interface CustomBarChartProps {
  data: BarItem[];
  maxValue: number;
  viewType: "avg_amount" | "count" | "max_amount" | "min_amount";
}

interface AnimatedBarProps {
  item: BarItem;
  maxValue: number;
  viewType: "avg_amount" | "count" | "max_amount" | "min_amount";
  onPress: (item: BarItem) => void;
}

const AnimatedBar: React.FC<AnimatedBarProps> = ({ item, maxValue, viewType, onPress }) => {
  const animatedHeight = useSharedValue(0);
  const animatedPrevHeight = useSharedValue(0);
  const animatedOpacity = useSharedValue(0);
  const animatedScale = useSharedValue(0.8);

  const BAR_WIDTH = 40;
  const BAR_SPACING = 8;
  const CHART_HEIGHT = 320;
  const MIN_BAR_HEIGHT = 20;

  const getBarHeight = (value: number): number => {
    if (!value || !maxValue) return 0;
    const proportion = value / maxValue;
    return Math.max(proportion * CHART_HEIGHT, value > 0 ? MIN_BAR_HEIGHT : 0);
  };

  const targetHeight = getBarHeight(item.displayValue);
  const targetPrevHeight = getBarHeight(item.prevDisplayValue || 0);

  useEffect(() => {
    animatedOpacity.value = withTiming(1, { duration: 400 });
    animatedScale.value = withTiming(1, { duration: 400 });
    animatedHeight.value = withTiming(targetHeight, { duration: 500 });

    if (targetPrevHeight > 0) {
      animatedPrevHeight.value = withTiming(targetPrevHeight, { duration: 500 });
    }
  }, [targetHeight, targetPrevHeight]);

  const animatedBarStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
    marginTop: CHART_HEIGHT - animatedHeight.value,
    opacity: animatedOpacity.value,
    transform: [{ scale: animatedScale.value }],
  }));

  const animatedPrevBarStyle = useAnimatedStyle(() => ({
    height: animatedPrevHeight.value,
    marginTop: CHART_HEIGHT - animatedPrevHeight.value,
    opacity: animatedOpacity.value * 0.7,
    transform: [{ scale: animatedScale.value }],
  }));

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: animatedOpacity.value,
    transform: [{ scale: animatedScale.value }],
  }));

  const animatedValueOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(animatedHeight.value, [0, MIN_BAR_HEIGHT, MIN_BAR_HEIGHT * 2], [0, 0, 1], Extrapolation.CLAMP),
  }));

  const hasPrevData = (item.prevValue || 0) > 0;

  return (
    <TouchableOpacity
      style={[
        styles.barContainer,
        {
          marginRight: BAR_SPACING,
          width: BAR_WIDTH,
        },
      ]}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.barsWrapper}>
        {hasPrevData && (
          <Animated.View
            style={[
              styles.bar,
              {
                backgroundColor: Color(item.color).alpha(0.25).string(),
                position: "absolute",
                width: "100%",
                borderWidth: 1,
                borderColor: Color(item.color).alpha(0.4).string(),
              },
              animatedPrevBarStyle,
            ]}
          />
        )}

        <Animated.View
          style={[
            styles.bar,
            {
              backgroundColor: item.color,
            },
            animatedBarStyle,
          ]}
        >
          {item.value > 0 && (
            <Animated.View style={[styles.barValueLabelWrapper, animatedValueOpacity]}>
              <Text style={styles.barValueLabelInside}>{item.isOutlier ? "↑" + item.value.toFixed(0) : item.value.toFixed(1)}</Text>
            </Animated.View>
          )}
        </Animated.View>
      </View>

      <Animated.Text style={[styles.hourLabel, { color: item.color }, animatedContainerStyle]}>{item.hour}:00</Animated.Text>
    </TouchableOpacity>
  );
};

const CustomBarChart: React.FC<CustomBarChartProps> = ({ data, maxValue, viewType }) => {
  const [selectedBarInfo, setSelectedBarInfo] = useState<BarItem | null>(null);
  const tooltipOpacity = useSharedValue(0);
  const tooltipScale = useSharedValue(0.8);

  const CHART_HEIGHT = 320;
  const LABEL_HEIGHT = 40;

  const handleBarPress = (item: BarItem) => {
    setSelectedBarInfo(item);
    tooltipOpacity.value = withTiming(1, { duration: 300 });
    tooltipScale.value = withTiming(1, { duration: 300 });

    setTimeout(() => {
      tooltipOpacity.value = withTiming(0, { duration: 300 });
      tooltipScale.value = withTiming(0.8, { duration: 300 }, () => {
        runOnJS(setSelectedBarInfo)(null);
      });
    }, 3000);
  };

  const animatedTooltipStyle = useAnimatedStyle(() => ({
    opacity: tooltipOpacity.value,
    transform: [{ scale: tooltipScale.value }],
  }));

  useEffect(() => {
    tooltipOpacity.value = 0;
    tooltipScale.value = 0.8;
  }, [data]);

  return (
    <View style={styles.chartWrapper}>
      <View style={styles.yAxisLabels}>
        {[4, 3, 2, 1, 0].map((i) => (
          <Text key={i} style={styles.yAxisLabel}>
            {viewType === "count" ? Math.round((maxValue / 4) * i) : Math.round((maxValue / 4) * i) + "zł"}
          </Text>
        ))}
      </View>

      <View style={styles.chartContent}>
        <View style={styles.gridLines}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={i} style={[styles.gridLine, { top: CHART_HEIGHT - (CHART_HEIGHT / 4) * i }]} />
          ))}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ height: CHART_HEIGHT + LABEL_HEIGHT, paddingBottom: 0 }}
          style={{ height: CHART_HEIGHT + LABEL_HEIGHT }}
        >
          <View style={{ flexDirection: "row", paddingTop: 10, height: CHART_HEIGHT + LABEL_HEIGHT, marginLeft: 10 }}>
            {data.map((item, index) => (
              <AnimatedBar key={`bar-${index}`} item={item} maxValue={maxValue} viewType={viewType} onPress={handleBarPress} />
            ))}
          </View>
        </ScrollView>

        {selectedBarInfo && (
          <Animated.View style={[styles.tooltip, animatedTooltipStyle]}>
            <Text style={styles.tooltipTitle}>Hour {selectedBarInfo.hour}:00</Text>
            <Text style={styles.tooltipValue}>
              Current: {selectedBarInfo.value.toFixed(viewType === "count" ? 0 : 2)}
              {viewType === "count" ? " tx" : "zł"}
            </Text>
            {(selectedBarInfo.prevValue || 0) > 0 ? (
              <Text style={styles.tooltipValue}>
                Previous: {selectedBarInfo.prevValue!.toFixed(viewType === "count" ? 0 : 2)}
                {viewType === "count" ? " tx" : "zł"}
              </Text>
            ) : (
              <Text style={[styles.tooltipValue, { fontStyle: "italic", opacity: 0.7 }]}>Previous: No data</Text>
            )}
            {selectedBarInfo.count !== undefined && viewType !== "count" && (
              <Text style={styles.tooltipValue}>Transactions: {selectedBarInfo.count}</Text>
            )}
          </Animated.View>
        )}
      </View>
    </View>
  );
};

const HourlySpendingsBarChart = ({ type, dateRange }: { type: string; dateRange?: [string, string] }) => {
  const viewType = type as "avg_amount" | "count" | "max_amount" | "min_amount";

  const previousDateRange = useMemo(() => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) return undefined;

    const startDate = new Date(dateRange[0]);
    const endDate = new Date(dateRange[1]);
    const diffTime = endDate.getTime() - startDate.getTime();

    const prevEndDate = new Date(startDate.getTime() - 1);
    const prevStartDate = new Date(prevEndDate.getTime() - diffTime);

    return [prevStartDate.toISOString().split("T")[0], prevEndDate.toISOString().split("T")[0]];
  }, [dateRange]);

  const { loading, error, data } = useQuery(GET_HOURLY_SPENDINGS, {
    variables: { months: dateRange },
  });

  const prevQuery = useQuery(GET_HOURLY_SPENDINGS, {
    variables: { months: previousDateRange },
    skip: !previousDateRange,
  });

  const { chartData, maxValue } = useMemo(() => {
    if (!data?.hourlySpendingsHeatMap || !Array.isArray(data.hourlySpendingsHeatMap)) {
      return { chartData: [], maxValue: 100 };
    }

    const hourlyData = [...data.hourlySpendingsHeatMap].sort((a, b) => a.hour - b.hour);
    const prevHourlyData = prevQuery.data?.hourlySpendingsHeatMap || [];
    const prevDataMap = new Map(prevHourlyData.map((item: HourlyData) => [item.hour, item]));

    const allValues: number[] = [];
    const chartDataArray: BarItem[] = [];

    hourlyData.forEach((hourData: HourlyData, index: number) => {
      const value = hourData[viewType] || 0;
      const prevHourData = prevDataMap.get(hourData.hour) as HourlyData | undefined;
      const prevValue = prevHourData ? prevHourData[viewType] || 0 : 0;

      if (value > 0) allValues.push(value);
      if (prevValue > 0) allValues.push(prevValue);

      chartDataArray.push({
        hour: hourData.hour,
        value,
        displayValue: value,
        color: secondary_candidates[index % secondary_candidates.length],
        count: hourData.count,
        min: hourData.min_amount,
        max: hourData.max_amount,
        prevValue: prevValue,
        prevDisplayValue: prevValue,
        prevCount: prevHourData?.count,
        prevMin: prevHourData?.min_amount,
        prevMax: prevHourData?.max_amount,
      });
    });

    let maxValueCalculated = 100;

    if (allValues.length > 0) {
      const sortedValues = [...allValues].sort((a, b) => a - b);
      const q1Index = Math.floor(sortedValues.length * 0.25);
      const q3Index = Math.floor(sortedValues.length * 0.75);
      const q1 = sortedValues[q1Index] || 0;
      const q3 = sortedValues[q3Index] || 100;
      const iqr = q3 - q1;
      const upperFence = q3 + 2.5 * iqr;
      const regularValues = sortedValues.filter((v) => v <= upperFence);
      const filteredMax = regularValues.length > 0 ? Math.max(...regularValues) : Math.max(...sortedValues);
      maxValueCalculated = filteredMax * 1.2;

      const updatedChartData = chartDataArray.map((item) => {
        const isCurrentOutlier = item.value > upperFence;
        const isPrevOutlier = (item.prevValue || 0) > upperFence;

        return {
          ...item,
          isOutlier: isCurrentOutlier,
          displayValue: isCurrentOutlier ? maxValueCalculated * 0.95 : item.value,
          prevDisplayValue: isPrevOutlier ? maxValueCalculated * 0.95 : item.prevValue,
        };
      });

      return { chartData: updatedChartData, maxValue: maxValueCalculated };
    }

    return { chartData: chartDataArray, maxValue: maxValueCalculated };
  }, [data, prevQuery.data, viewType]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (loading || prevQuery.loading)
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  if (error)
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </View>
    );

  return (
    <View>
      {chartData.length > 0 ? (
        <View style={{ minHeight: 400 }}>
          <CustomBarChart data={chartData} maxValue={maxValue} viewType={viewType} />

          <View style={styles.periodLegendContainer}>
            <View style={styles.periodLegend}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <View style={{ width: 12, height: 8, backgroundColor: secondary_candidates[0], borderRadius: 2 }} />
                <Text style={{ fontSize: 12, color: Colors.foreground }}>Current Period</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <View
                  style={{ width: 12, height: 8, backgroundColor: Color(secondary_candidates[0]).alpha(0.25).string(), borderRadius: 2 }}
                />
                <Text style={{ fontSize: 12, color: Colors.foreground }}>Previous Period</Text>
              </View>
            </View>
            {dateRange && previousDateRange && (
              <Text style={styles.dateRangeText}>
                {formatDate(dateRange[0])} - {formatDate(dateRange[1])} vs {formatDate(previousDateRange[0])} -{" "}
                {formatDate(previousDateRange[1])}
              </Text>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No data available for the selected time period</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  chartWrapper: {
    flexDirection: "row",
    marginTop: 10,
  },
  yAxisLabels: {
    width: 35,
    height: 320,
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingLeft: 2,
  },
  yAxisLabel: {
    color: Colors.foreground,
    fontSize: 11,
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
    height: 320,
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Color(Colors.primary).lighten(0.8).string(),
  },
  barContainer: {
    alignItems: "center",
    height: 345,
    position: "relative",
  },
  barsWrapper: {
    width: "100%",
    height: 320,
    position: "relative",
  },
  bar: {
    width: "100%",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    overflow: "visible",
  },
  barValueLabelWrapper: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  barValueLabelInside: {
    color: "#000",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    transform: [{ rotate: "-90deg" }],
    width: 80,
  },
  hourLabel: {
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 5,
    position: "absolute",
    bottom: 0,
  },
  tooltip: {
    position: "absolute",
    top: 20,
    left: 20,
    backgroundColor: Color(Colors.primary).lighten(0.5).string(),
    padding: 10,
    borderRadius: 5,
    minWidth: 120,
    zIndex: 10,
  },
  tooltipTitle: {
    color: Colors.foreground,
    fontWeight: "bold",
    fontSize: 14,
  },
  tooltipValue: {
    color: Colors.foreground,
    fontSize: 12,
    marginVertical: 1,
  },
  periodLegendContainer: {
    marginTop: 15,
    alignItems: "center",
    gap: 8,
  },
  periodLegend: {
    flexDirection: "row",
    gap: 15,
    justifyContent: "center",
  },
  dateRangeText: {
    fontSize: 10,
    color: Color(Colors.foreground).alpha(0.7).string(),
    textAlign: "center",
  },
  noDataContainer: {
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Color(Colors.primary).lighten(0.3).string(),
    borderRadius: 10,
    height: 200,
    width: Layout.screen.width - 60,
  },
  noDataText: {
    color: Colors.foreground,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
  },
  loadingText: {
    color: Colors.foreground,
    fontSize: 16,
  },
  errorContainer: {
    padding: 20,
    backgroundColor: lowOpacity("#ff0000", 0.1),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: lowOpacity("#ff0000", 0.3),
    marginVertical: 20,
  },
  errorText: {
    color: "#ff7777",
    fontSize: 16,
  },
});

export default () => {
  return (
    <ChartTemplate
      title="Hourly spending"
      description="See your spending patterns by hours vs previous period"
      types={["avg_amount", "count", "max_amount", "min_amount"] as any}
    >
      {({ dateRange, type }) => <HourlySpendingsBarChart type={type} dateRange={dateRange} />}
    </ChartTemplate>
  );
};
