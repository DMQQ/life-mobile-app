import Layout from "@/constants/Layout";
import { useMemo, useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import Colors, { secondary_candidates } from "@/constants/Colors";
import Color from "color";
import ChartTemplate, { Types } from "./ChartTemplate";
import { gql, useQuery } from "@apollo/client";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS, interpolate, Extrapolation } from "react-native-reanimated";

interface LegendProps {
  data: { label: string; value: number; frontColor?: string; color?: string; prevValue?: number }[];
  totalSum: number;
  prevTotalSum: number;
  type: "total" | "avg" | "median" | "count";
}

interface BarItem {
  label: string;
  value: number;
  prevValue?: number;
  frontColor: string;
  day: number;
}

interface AnimatedBarProps {
  item: BarItem;
  maxValue: number;
  type: Types;
  onPress: (item: BarItem) => void;
  barWidth: number;
  chartHeight: number;
  marginRight: number;
}

const labels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const AnimatedBar: React.FC<AnimatedBarProps> = ({ item, maxValue, type, onPress, barWidth, chartHeight, marginRight }) => {
  const animatedHeight = useSharedValue(0);
  const animatedPrevHeight = useSharedValue(0);
  const animatedOpacity = useSharedValue(0);
  const animatedScale = useSharedValue(0.8);

  const MIN_BAR_HEIGHT = 20;

  const getBarHeight = (value: number): number => {
    if (!value || !maxValue) return 0;
    const proportion = value / maxValue;
    return Math.max(proportion * chartHeight, value > 0 ? MIN_BAR_HEIGHT : 0);
  };

  const targetHeight = getBarHeight(item.value);
  const targetPrevHeight = getBarHeight(item.prevValue || 0);

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
    marginTop: chartHeight - animatedHeight.value,
    opacity: animatedOpacity.value,
    transform: [{ scale: animatedScale.value }],
  }));

  const animatedPrevBarStyle = useAnimatedStyle(() => ({
    height: animatedPrevHeight.value,
    marginTop: chartHeight - animatedPrevHeight.value,
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

  const hasPrevData = item.prevValue !== undefined;

  return (
    <TouchableOpacity style={[styles.barContainer, { width: barWidth, marginRight }]} onPress={() => onPress(item)} activeOpacity={0.7}>
      <View style={styles.barsWrapper}>
        {hasPrevData && (
          <Animated.View
            style={[
              styles.bar,
              {
                backgroundColor: Color(item.frontColor).alpha(0.25).string(),
                position: "absolute",
                width: "100%",
                borderWidth: 1,
                borderColor: Color(item.frontColor).alpha(0.4).string(),
              },
              animatedPrevBarStyle,
            ]}
          />
        )}

        <Animated.View
          style={[
            styles.bar,
            {
              backgroundColor: item.frontColor,
            },
            animatedBarStyle,
          ]}
        >
          {item.value > 0 && (
            <Animated.View style={[styles.barValueWrapper, animatedValueOpacity]}>
              <Text style={styles.barValueText}>{item.value.toFixed(type === "count" ? 0 : 1)}</Text>
            </Animated.View>
          )}
        </Animated.View>
      </View>

      <Animated.Text style={[styles.dayLabel, { color: item.frontColor }, animatedContainerStyle]}>{item.label}</Animated.Text>
    </TouchableOpacity>
  );
};

function ChartLegend({ data, totalSum, prevTotalSum, type }: LegendProps) {
  return (
    <View style={styles.legendContainer}>
      {data.map((item, index) => {
        const changePercent = item.prevValue && item.prevValue > 0 ? ((item.value - item.prevValue) / item.prevValue) * 100 : 0;

        return (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.colorIndicator, { backgroundColor: item.color || item.frontColor }]} />
            <View style={styles.legendTextContainer}>
              <Text style={styles.legendLabel}>{labels[index]}</Text>
              <View style={styles.valueRow}>
                <Text style={styles.legendValue}>
                  {item.value.toFixed(type === "count" ? 0 : 1)}
                  {type !== "count" && "zł"}
                </Text>
                {item.prevValue !== undefined && (
                  <Text style={[styles.changeText, { color: changePercent >= 0 ? "#4ade80" : "#f87171" }]}>
                    {changePercent >= 0 ? "+" : ""}
                    {changePercent.toFixed(0)}%
                  </Text>
                )}
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const CustomDayBarChart = ({ data, maxValue, type }: { data: BarItem[]; maxValue: number; type: Types }) => {
  const [selectedBar, setSelectedBar] = useState<BarItem | null>(null);
  const tooltipOpacity = useSharedValue(0);
  const tooltipScale = useSharedValue(0.8);

  const BAR_WIDTH = 45;
  const BAR_SPACING = 8;
  const CHART_HEIGHT = 320;

  const handleBarPress = (item: BarItem) => {
    setSelectedBar(item);
    tooltipOpacity.value = withTiming(1, { duration: 300 });
    tooltipScale.value = withTiming(1, { duration: 300 });

    setTimeout(() => {
      tooltipOpacity.value = withTiming(0, { duration: 300 });
      tooltipScale.value = withTiming(0.8, { duration: 300 }, () => {
        runOnJS(setSelectedBar)(null);
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
            {type === "count" ? Math.round((maxValue / 4) * i) : Math.round((maxValue / 4) * i)}
          </Text>
        ))}
      </View>

      <View style={styles.chartContent}>
        <View style={styles.gridLines}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={i} style={[styles.gridLine, { top: CHART_HEIGHT - (CHART_HEIGHT / 4) * i }]} />
          ))}
        </View>

        <View style={styles.barsContainer}>
          {data.map((item, index) => (
            <AnimatedBar
              key={index}
              item={item}
              maxValue={maxValue}
              type={type}
              onPress={handleBarPress}
              barWidth={BAR_WIDTH}
              chartHeight={CHART_HEIGHT}
              marginRight={index < data.length - 1 ? BAR_SPACING : 0}
            />
          ))}
        </View>

        {selectedBar && (
          <Animated.View style={[styles.tooltip, animatedTooltipStyle]}>
            <Text style={styles.tooltipTitle}>{labels[selectedBar.day - 1]}</Text>
            <Text style={styles.tooltipValue}>
              Current: {selectedBar.value.toFixed(type === "count" ? 0 : 2)}
              {type === "count" ? " tx" : "zł"}
            </Text>
            {selectedBar.prevValue !== undefined ? (
              <Text style={styles.tooltipValue}>
                Previous: {selectedBar.prevValue.toFixed(type === "count" ? 0 : 2)}
                {type === "count" ? " tx" : "zł"}
              </Text>
            ) : (
              <Text style={[styles.tooltipValue, { fontStyle: "italic", opacity: 0.7 }]}>Previous: No data</Text>
            )}
          </Animated.View>
        )}
      </View>
    </View>
  );
};

const SpendingsByDay = ({ type, ...props }: { dateRange: [string, string]; type: Types }) => {
  const previousDateRange = useMemo(() => {
    const startDate = new Date(props.dateRange[0]);
    const endDate = new Date(props.dateRange[1]);
    const diffTime = endDate.getTime() - startDate.getTime();

    const prevEndDate = new Date(startDate.getTime() - 1);
    const prevStartDate = new Date(prevEndDate.getTime() - diffTime);

    return [prevStartDate.toISOString().split("T")[0], prevEndDate.toISOString().split("T")[0]];
  }, [props.dateRange]);

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

  const prevQuery = useQuery<{
    statisticsDayOfWeek: { day: number; total: number; avg: number; median: number; count: number }[];
  }>(
    gql`
      query PreviousStatisticsDayOfWeek($startDate: String!, $endDate: String!) {
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
        startDate: previousDateRange[0],
        endDate: previousDateRange[1],
      },
      fetchPolicy: "cache-and-network",
    }
  );

  const data = query.data?.statisticsDayOfWeek || [];
  const prevData = prevQuery.data?.statisticsDayOfWeek || [];

  const { chartData, maxValue, total, prevTotal } = useMemo(() => {
    const prevDataMap = new Map(prevData.map((item) => [item.day, item]));

    const days = data.map((item, index) => {
      const prevItem = prevDataMap.get(item.day);
      return {
        label: labels[item.day - 1].slice(0, 3),
        value: item[type],
        prevValue: prevItem ? prevItem[type] : undefined,
        frontColor: secondary_candidates[index % secondary_candidates.length],
        day: item.day,
      };
    });

    const allValues = [...days.map((d) => d.value), ...days.filter((d) => d.prevValue !== undefined).map((d) => d.prevValue!)];

    const maxVal = allValues.length > 0 ? Math.max(...allValues) * 1.1 : 100;
    const currentTotal = data.reduce((acc, curr) => acc + curr[type], 0);
    const previousTotal = prevData.reduce((acc, curr) => acc + curr[type], 0);

    return {
      chartData: days,
      maxValue: maxVal,
      total: currentTotal,
      prevTotal: previousTotal,
    };
  }, [data, prevData, type]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (query.loading || prevQuery.loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View>
      <View style={{ minHeight: 500 }}>
        <CustomDayBarChart data={chartData} maxValue={maxValue} type={type} />

        <View style={styles.periodLegendContainer}>
          <View style={styles.periodLegend}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <View style={{ width: 12, height: 8, backgroundColor: secondary_candidates[0], borderRadius: 2 }} />
              <Text style={{ fontSize: 12, color: "#fff" }}>Current Period</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <View
                style={{ width: 12, height: 8, backgroundColor: Color(secondary_candidates[0]).alpha(0.25).string(), borderRadius: 2 }}
              />
              <Text style={{ fontSize: 12, color: "#fff" }}>Previous Period</Text>
            </View>
          </View>
          <Text style={styles.dateRangeText}>
            {formatDate(props.dateRange[0])} - {formatDate(props.dateRange[1])} vs {formatDate(previousDateRange[0])} -{" "}
            {formatDate(previousDateRange[1])}
          </Text>
        </View>

        <View style={styles.barLegendContainer}>
          <ChartLegend type={type} data={chartData} totalSum={total} prevTotalSum={prevTotal} />
        </View>
      </View>
    </View>
  );
};

const blueText = Color(Colors.primary).lighten(10).string();

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
    color: "#fff",
    fontSize: 10,
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
  barsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 320,
    paddingHorizontal: 5,
  },
  barContainer: {
    alignItems: "center",
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
  },
  barValueWrapper: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  barValueText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "700",
    transform: [{ rotate: "-90deg" }],
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 8,
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
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  tooltipValue: {
    color: "#fff",
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
    color: Color("#fff").alpha(0.7).string(),
    textAlign: "center",
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  barLegendContainer: {
    marginTop: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: Color(Colors.primary).lighten(0.2).string(),
    borderRadius: 6,
    width: "48%",
  },
  colorIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 10,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  legendValue: {
    color: blueText,
    fontSize: 12,
  },
  changeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default () => {
  return (
    <ChartTemplate
      types={["total", "count", "avg", "median"] as Types[]}
      title="Spendings by day of week"
      description="Spendings by day of week vs previous period"
    >
      {({ dateRange, type }) => <SpendingsByDay dateRange={dateRange} type={type} />}
    </ChartTemplate>
  );
};
