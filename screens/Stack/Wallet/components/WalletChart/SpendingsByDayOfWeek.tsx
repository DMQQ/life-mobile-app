import Layout from "@/constants/Layout";
import { Expense } from "@/types";
import moment from "moment";
import { useMemo, useState } from "react";
import { Alert, Text, View } from "react-native";
import Colors, { secondary_candidates } from "@/constants/Colors";
import { BarChart, barDataItem } from "react-native-gifted-charts";
import Color from "color";
import Button from "@/components/ui/Button/Button";
import lowOpacity from "@/utils/functions/lowOpacity";

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
      frontColor: secondary_candidates[index % 3],
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
    frontColor: secondary_candidates[index],
    labelTextStyle: { color: "#fff" },
  }));
};

const blueText = Color(Colors.primary).lighten(10).string();

const SpendingsByDay = (props: { data: Expense[] }) => {
  const [type, setType] = useState<"total" | "avg" | "median">("total");

  const days = useMemo(() => getSpendingsByDay(props.data, type), [props.data, type]);

  return (
    <View style={{ width: Layout.screen.width - 30, marginTop: 25, marginBottom: 25 }}>
      <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold", marginBottom: 5 }}>{type.toUpperCase()} by day of week</Text>
      <Text style={{ color: "gray", fontSize: 16, marginBottom: 5 }}>This chart shows your spendings by day of week</Text>

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
      {type && (
        <BarChart
          key={type}
          width={Layout.screen.width - 60}
          height={Layout.screen.height / 3.5}
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
      )}
    </View>
  );
};

export default SpendingsByDay;
