import Layout from "@/constants/Layout";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import Colors, { secondary_candidates } from "@/constants/Colors";
import Color from "color";
import Button from "@/components/ui/Button/Button";
import lowOpacity from "@/utils/functions/lowOpacity";
import DateTimePicker from "react-native-modal-datetime-picker";
import { gql, useQuery } from "@apollo/client";
import moment from "moment";
import ChartTemplate, { Types } from "./ChartTemplate";

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
}

interface CustomBarChartProps {
  data: BarItem[];
  maxValue: number;
  viewType: "avg_amount" | "count" | "max_amount" | "min_amount";
}

const CustomBarChart: React.FC<CustomBarChartProps> = ({ data, maxValue, viewType }) => {
  const [selectedBarInfo, setSelectedBarInfo] = useState<BarItem | null>(null);

  const BAR_WIDTH = 35;
  const BAR_SPACING = 6;
  const CHART_HEIGHT = 250;
  const MIN_BAR_HEIGHT = 20;

  const getBarHeight = (value: number): number => {
    if (!value || !maxValue) return 0;
    const proportion = value / maxValue;
    return Math.max(proportion * CHART_HEIGHT, value > 0 ? MIN_BAR_HEIGHT : 0);
  };

  const handleBarPress = (item: BarItem) => {
    setSelectedBarInfo(item);
    setTimeout(() => {
      setSelectedBarInfo(null);
    }, 3000);
  };

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

        <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={{ height: CHART_HEIGHT + 80 }}>
          <View style={{ flexDirection: "row", paddingTop: 10, height: CHART_HEIGHT + 80, marginLeft: 15 }}>
            {data.map((item, index) => {
              const barHeight = getBarHeight(item.displayValue);

              return (
                <TouchableOpacity
                  key={`bar-${index}`}
                  style={[
                    styles.barContainer,
                    {
                      marginRight: BAR_SPACING,
                      width: BAR_WIDTH,
                    },
                  ]}
                  onPress={() => handleBarPress(item)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: item.color,
                        marginTop: CHART_HEIGHT - barHeight,
                      },
                    ]}
                  >
                    {item.value > 0 && (
                      <View style={styles.barValueLabelWrapper}>
                        <Text style={styles.barValueLabelInside}>
                          {item.isOutlier ? "↑" + item.value.toFixed(0) : item.value.toFixed(1)}
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text style={[styles.hourLabel, { color: item.color }]}>{item.hour}:00</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {selectedBarInfo && (
          <View style={styles.tooltip}>
            <Text style={styles.tooltipTitle}>Hour {selectedBarInfo.hour}:00</Text>
            <Text style={styles.tooltipValue}>
              {viewType === "avg_amount"
                ? "Avg: " + selectedBarInfo.value.toFixed(2) + "zł"
                : viewType === "count"
                ? "Count: " + selectedBarInfo.value + " tx"
                : viewType === "max_amount"
                ? "Max: " + selectedBarInfo.value.toFixed(2) + "zł"
                : "Min: " + selectedBarInfo.value.toFixed(2) + "zł"}
            </Text>
            {selectedBarInfo.count !== undefined && viewType !== "count" && (
              <Text style={styles.tooltipValue}>Count: {selectedBarInfo.count} transactions</Text>
            )}
            {selectedBarInfo.min !== undefined && viewType !== "min_amount" && (
              <Text style={styles.tooltipValue}>Min: {selectedBarInfo.min.toFixed(2)}zł</Text>
            )}
            {selectedBarInfo.max !== undefined && viewType !== "max_amount" && (
              <Text style={styles.tooltipValue}>Max: {selectedBarInfo.max.toFixed(2)}zł</Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const HourlySpendingsBarChart = ({ type, dateRange }: { type: string; dateRange?: [string, string] }) => {
  const viewType = type as "avg_amount" | "count" | "max_amount" | "min_amount";

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const { loading, error, data } = useQuery(GET_HOURLY_SPENDINGS, {
    variables: { months: dateRange },
  });

  const { chartData, maxValue } = useMemo(() => {
    if (!data?.hourlySpendingsHeatMap || !Array.isArray(data.hourlySpendingsHeatMap)) {
      return { chartData: [], maxValue: 100 };
    }

    const hourlyData = [...data.hourlySpendingsHeatMap].sort((a, b) => a.hour - b.hour);

    const allValues: number[] = [];
    const chartDataArray: BarItem[] = [];

    hourlyData.forEach((hourData: HourlyData, index: number) => {
      const value = hourData[viewType] || 0;

      if (value > 0) {
        allValues.push(value);
      }

      chartDataArray.push({
        hour: hourData.hour,
        value,
        displayValue: value,
        color: secondary_candidates[index % secondary_candidates.length],
        count: hourData.count,
        min: hourData.min_amount,
        max: hourData.max_amount,
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
        if (item.value > upperFence) {
          return {
            ...item,
            isOutlier: true,
            displayValue: maxValueCalculated * 0.95,
          };
        } else {
          return {
            ...item,
            isOutlier: false,
            displayValue: item.value,
          };
        }
      });

      return {
        chartData: updatedChartData,
        maxValue: maxValueCalculated,
      };
    }

    return {
      chartData: chartDataArray,
      maxValue: maxValueCalculated,
    };
  }, [data, viewType]);

  if (loading)
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
        <>
          <CustomBarChart data={chartData} maxValue={maxValue} viewType={viewType} />
        </>
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No data available for the selected time period</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 20,
  },
  subtitle: {
    color: "gray",
    fontSize: 16,
    marginBottom: 10,
  },
  dateRangeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  dateButton: {
    backgroundColor: lowOpacity(Colors.primary, 0.3),
    borderWidth: 1,
    borderColor: lowOpacity(Colors.primary, 0.5),
    borderRadius: 7.5,
    padding: 10,
    width: "48%",
    alignItems: "center",
  },
  dateButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  typeSelectorContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  chartWrapper: {
    flexDirection: "row",
    marginTop: 10,
  },
  yAxisLabels: {
    width: 40,
    height: 250,
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingRight: 5,
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
    height: 250,
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
    height: 250,
    position: "relative",
  },
  bar: {
    width: "100%",
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
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
    fontSize: 10,
    textAlign: "center",
    transform: [{ rotate: "-90deg" }],
    width: 80,
  },
  hourLabel: {
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 5,
  },
  tooltip: {
    position: "absolute",
    top: 50,
    left: 50,
    backgroundColor: Color(Colors.primary).lighten(0.5).string(),
    padding: 10,
    borderRadius: 5,
    width: 150,
    zIndex: 10,
  },
  tooltipTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  tooltipValue: {
    color: "#fff",
    fontSize: 14,
    marginVertical: 2,
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
    color: "#fff",
    fontSize: 16,
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
  chartDescription: {
    alignItems: "center",
    marginTop: 15,
    padding: 10,
    backgroundColor: Color(Colors.primary).lighten(0.3).string(),
    borderRadius: 8,
  },
  chartDescriptionText: {
    color: "#fff",
    fontSize: 14,
  },
});

export default () => {
  return (
    <ChartTemplate
      title="Hourly spending"
      description="See your spending patterns by hours"
      types={["avg_amount", "count", "max_amount", "min_amount"] as any}
    >
      {({ dateRange, type }) => <HourlySpendingsBarChart type={type} dateRange={dateRange} />}
    </ChartTemplate>
  );
};
