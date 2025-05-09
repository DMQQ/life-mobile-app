import Layout from "@/constants/Layout";
import { Expense } from "@/types";
import moment from "moment";
import { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import Colors, { secondary_candidates } from "@/constants/Colors";
import { BarChart, barDataItem } from "react-native-gifted-charts";
import Color from "color";
import Button from "@/components/ui/Button/Button";
import lowOpacity from "@/utils/functions/lowOpacity";
import Ripple from "react-native-material-ripple";
import { PieChart as GFTPieChart } from "react-native-gifted-charts";

const button = {
  padding: 10,
  paddingHorizontal: 15,
  borderRadius: 7.5,
  backgroundColor: Colors.primary_light,
};

const getSpendingsByDay = (input: Expense[], type: "total" | "avg" | "median") => {
  // Move these helper functions outside the if block
  const total = (arr: number[]) => arr.reduce((a, b) => a + b, 0) || 0; // Added || 0 for empty arrays
  const avg = (arr: number[]) => (arr.length ? total(arr) / arr.length : 0);
  const median = (arr: number[]) => {
    if (!arr.length) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  const result: Record<string, { category: string; value: number[] }> = {
    Monday: { category: "", value: [] },
    Tuesday: { category: "", value: [] },
    Wednesday: { category: "", value: [] },
    Thursday: { category: "", value: [] },
    Friday: { category: "", value: [] },
    Saturday: { category: "", value: [] },
    Sunday: { category: "", value: [] },
  };

  if (!input?.length) {
    return Object.entries(result).map(([key, value], index) => ({
      label: key[0] + key[1].toLowerCase(),
      value: type === "total" ? total(value.value) : type === "avg" ? avg(value.value) : median(value.value),
      frontColor: secondary_candidates[index % secondary_candidates.length],
      labelTextStyle: { color: "#fff" },
    }));
  }

  input.forEach((item) => {
    const dayOfWeek = moment(item.date).format("dddd");
    if (result[dayOfWeek]) {
      result[dayOfWeek].value.push(item.amount);
    }
  });

  return Object.entries(result).map(([key, value], index) => ({
    label: key[0] + key[1].toLowerCase(),
    value: type === "total" ? total(value.value) : type === "avg" ? avg(value.value) : median(value.value),
    frontColor: secondary_candidates[index % secondary_candidates.length],
    labelTextStyle: { color: "#fff" },
  }));
};

// Common Legend component for both chart types
interface LegendProps {
  data: { label: string; value: number; frontColor?: string; color?: string }[];
  totalSum: number;
}

const expandedLabel = {
  Mo: "Monday",
  Tu: "Tuesday",
  We: "Wednesday",
  Th: "Thursday",
  Fr: "Friday",
  Sa: "Saturday",
  Su: "Sunday",
};

function ChartLegend({ data, totalSum }: LegendProps) {
  return (
    <View style={styles.legendContainer}>
      {data.map((item, index) => (
        <View key={index} style={styles.legendItem}>
          <View style={[styles.colorIndicator, { backgroundColor: item.color || item.frontColor }]} />
          <View style={styles.legendTextContainer}>
            <Text style={styles.legendLabel}>{expandedLabel[item.label as keyof typeof expandedLabel]}</Text>
            <Text style={styles.legendValue}>{item.value.toFixed(2)}zł</Text>
          </View>
          <Text style={styles.legendPercentage}>{((item.value / totalSum) * 100).toFixed(1)}%</Text>
        </View>
      ))}
    </View>
  );
}

interface PieChartProps {
  onPress: (dt: { label: string; value: number; color: string }) => void;
  data: { label: string; value: number; frontColor?: string; color?: string }[];
  totalSum: number;
}

function PieChart(props: PieChartProps) {
  const processedData = props.data.map((item) => ({
    label: item.label,
    value: item.value,
    color: item.color || item.frontColor || secondary_candidates[0],
  }));

  const chartData = processedData.length !== 0 ? processedData : [{ label: "No data", value: 1, color: secondary_candidates[0] }];

  return (
    <View style={styles.chartMainContainer}>
      <View style={styles.pieContainer}>
        <GFTPieChart
          onPress={props.onPress}
          animationDuration={1000}
          innerCircleColor={Colors.primary}
          showGradient
          donut
          radius={(Layout.screen.width - 60) / 3}
          data={chartData}
          showText
          isAnimated
          focusOnPress
          innerRadius={70}
          centerLabelComponent={() => (
            <View>
              <Text style={styles.totalAmount}>{props.totalSum.toFixed(2)}zł</Text>
              <Text style={styles.totalLabel}>Total</Text>
            </View>
          )}
        />
      </View>

      <View style={styles.legendWrapper}>
        <ChartLegend data={chartData} totalSum={props.totalSum} />
      </View>
    </View>
  );
}

const blueText = Color(Colors.primary).lighten(10).string();

const SpendingsByDay = (props: { data: Expense[] }) => {
  const [type, setType] = useState<"total" | "avg" | "median">("total");

  const days = useMemo(() => getSpendingsByDay(props.data, type), [props.data, type]);

  const [view, setView] = useState<"pie" | "bar">("bar");

  const total = useMemo(() => {
    const totalValue = days.reduce((acc, curr) => acc + curr.value, 0);
    return totalValue;
  }, [days]);

  return (
    <View style={{ width: Layout.screen.width - 30, marginTop: 25, marginBottom: 25, minHeight: 500 }}>
      <View style={{ flexDirection: "row", gap: 15 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold", marginBottom: 5 }}>{type.toUpperCase()} by day of week</Text>
          <Text style={{ color: "gray", fontSize: 16, marginBottom: 5 }}>This chart shows your spendings by day of week</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Ripple
            onPress={() => setView((p) => (p === "pie" ? "bar" : "pie"))}
            style={{
              backgroundColor: lowOpacity(Colors.secondary, 0.15),
              borderWidth: 0.5,
              borderColor: lowOpacity(Colors.secondary, 0.5),
              padding: 7.5,
              paddingHorizontal: 15,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: Colors.secondary }}>{view === "pie" ? "Bar chart" : "Pie chart"}</Text>
          </Ripple>
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 5, marginTop: 15, marginBottom: 15 }}>
        {["total", "avg", "median"].map((item) => (
          <Button
            variant="text"
            key={item}
            onPress={() => setType(item as "total" | "avg" | "median")}
            style={[
              button,
              {
                borderWidth: 0.5,
                borderColor: Colors.primary,
                marginRight: 10,
                ...(item === type && {
                  backgroundColor: lowOpacity(Colors.secondary, 0.15),
                  borderWidth: 0.5,
                  borderColor: lowOpacity(Colors.secondary, 0.5),
                }),
              },
            ]}
          >
            <Text
              style={{
                fontSize: 14,
                color: type === item ? Colors.secondary : blueText,
              }}
            >
              {item}
            </Text>
          </Button>
        ))}
      </View>
      <View style={{ minHeight: 400 }}>
        {type &&
          (view === "bar" ? (
            <View>
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
                <ChartLegend data={days} totalSum={total} />
              </View>
            </View>
          ) : (
            <PieChart
              data={days}
              totalSum={total}
              onPress={(e) => {
                Alert.alert(`${e.label}`, `${e.value.toFixed(2)}zł (${((e.value / total) * 100).toFixed(1)}%)`);
              }}
            />
          ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chartMainContainer: {
    flex: 1,
    alignItems: "center",
  },
  pieContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  totalAmount: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  totalLabel: {
    color: blueText,
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 5,
  },
  legendWrapper: {
    width: "100%",
  },
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

export default SpendingsByDay;
