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
  const result: Record<string, { category: string; value: number[] }> = {
    Monday: { category: "", value: [] },
    Tuesday: { category: "", value: [] },
    Wednesday: { category: "", value: [] },
    Thursday: { category: "", value: [] },
    Friday: { category: "", value: [] },
    Saturday: { category: "", value: [] },
    Sunday: { category: "", value: [] },
  };

  if (!input) {
    return result;
  }

  input.forEach((item) => {
    const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][moment(item.date).day()];

    if (result[dayOfWeek]) {
      result[dayOfWeek].value.push(item.amount);
    } else {
      result[dayOfWeek] = {
        category: item.category,
        value: [item.amount],
      };
    }
  });

  const total = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

  const avg = (arr: number[]) => total(arr) / arr.length;

  const median = (arr: number[]) => {
    arr.sort((a, b) => a - b);
    const mid = Math.floor(arr.length / 2);
    return arr.length % 2 !== 0 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
  };

  return Object.entries(result).map(([key, value], index) => ({
    label: key[0] + key[1].toLowerCase(),
    value: type === "total" ? total(value.value) : type === "avg" ? avg(value.value) : median(value.value),
    frontColor: secondary_candidates[index % 3],
    labelTextStyle: { color: "#fff" },
  })) as barDataItem[];
};

const blueText = Color(Colors.primary).lighten(10).string();

const SpendingsByDay = (props: { data: Expense[] }) => {
  const [type, setType] = useState<"total" | "avg" | "median">("total");

  const days = useMemo(() => getSpendingsByDay(props.data, type), [props.data, type]);

  return (
    <View style={{ width: Layout.screen.width - 30, marginTop: 25, marginBottom: 25 }}>
      <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold", marginBottom: 5 }}>{type.toUpperCase()} by day of week</Text>
      <Text style={{ color: "gray", fontSize: 16, marginBottom: 5 }}>This chart shows your spendings by day of week</Text>

      <View style={{ flexDirection: "row", gap: 5, marginTop: 15 }}>
        {["total", "avg", "median"].map((item) => (
          <Button
            variant="text"
            key={item.toString()}
            onPress={() => setType(item as any)}
            fontStyle={{
              fontSize: 14,
              color: type === item ? Colors.secondary : blueText,
            }}
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
            {item}
          </Button>
        ))}
      </View>
      <BarChart
        horizontal
        width={Layout.screen.width - 60}
        height={Layout.screen.height / 3.5}
        sideColor={"#fff"}
        barWidth={20}
        noOfSections={3}
        barBorderRadius={4}
        frontColor={Colors.secondary}
        yAxisTextStyle={{ color: "#fff" }}
        rulesColor={Color(Colors.primary).lighten(1.5).string()}
        data={days as any}
        yAxisThickness={0}
        xAxisThickness={0}
        isAnimated
      />
    </View>
  );
};

export default SpendingsByDay;
