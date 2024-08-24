import Header from "@/components/ui/Header/Header";
import Colors, { secondary_candidates } from "@/constants/Colors";
import Layout from "@/constants/Layout";
import { MaterialIcons } from "@expo/vector-icons";
import { useMemo, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  VirtualizedList,
} from "react-native";
import { PieChart } from "react-native-gifted-charts";
import Ripple from "react-native-material-ripple";
import { SafeAreaView } from "react-native-safe-area-context";
import Charts from "../components/Wallet/Charts";
import WalletItem from "../components/Wallet/WalletItem";
import useGetWallet, { Action, Filters } from "../hooks/useGetWallet";
import lowOpacity from "@/utils/functions/lowOpacity";
import Color from "color";
import Button from "@/components/ui/Button/Button";
import moment, { Moment } from "moment";
import { WalletSheet } from "../components/Sheets/WalletSheet";
import { Expense } from "@/types";
import BottomSheet from "@gorhom/bottom-sheet";

const blueText = Color(Colors.primary).lighten(10).string();

const styles = StyleSheet.create({
  chartInnerText: {
    color: blueText,
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 5,
  },
  tilesContainer: {
    marginTop: 15,
    width: Layout.window.width - 30,
    gap: 10,
    flexDirection: "row",
    flexWrap: "wrap",
  },

  tile: {
    flexDirection: "column",
    padding: 20,
    backgroundColor: Colors.primary_light,
    borderRadius: 15,
    gap: 5,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 10,
    marginRight: 10,
  },
  tileText: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  expenseTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
  },
  totalText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  listHeader: {
    flex: 1,
    paddingHorizontal: 15,
    alignItems: "center",
    marginBottom: 30,
  },
  chartTotal: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  button: {
    padding: 10,
    paddingHorizontal: 15,
    borderRadius: 7.5,
    backgroundColor: Colors.primary_light,
  },
});

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export default function WalletCharts() {
  const { data, dispatch, filters } = useGetWallet();
  const listRef = useRef<VirtualizedList<any> | null>(null);
  const [selected, setSelected] = useState("");

  const [chartType, setChartType] = useState<"pie" | "bar">("pie");

  const barData = useMemo(() => {
    const mapped = data.wallet.expenses.reduce((acc, curr) => {
      if (
        !curr.category ||
        curr.description.startsWith("Balance") ||
        curr.type === "income"
      )
        return acc;
      const key = curr.category;

      if (!key || curr.description.startsWith("Balance")) return acc;

      if (!acc[key]) {
        acc[key] = 0;
      }
      acc[key] += curr.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(mapped)
      .map(([key, value], index) => ({
        value,
        label: key,
        color: secondary_candidates[index],
        selected: key === selected,
      }))
      .sort((a, b) => b.value - a.value) as {
      label: string;
      value: number;
      color: string;
    }[];
  }, [data.wallet.expenses]);

  const sumOfExpenses = useMemo(() => {
    return data.wallet.expenses.reduce((acc, curr) => {
      return curr.type === "income" ? acc : acc + curr.amount;
    }, 0);
  }, [data.wallet.expenses]);

  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const expenseSheetRef = useRef<BottomSheet>(null);

  const Legend = () => (
    <View style={styles.tilesContainer}>
      {barData.map((item, index) => (
        <Ripple
          onPress={() => {
            setSelected((prev) => (prev === item.label ? "" : item.label));
            if (selected !== item.label) {
              setTimeout(() => {
                listRef.current?.scrollToIndex({ index: 0 });
              }, 100);
            }
          }}
          key={index}
          style={[
            styles.tile,

            {
              width:
                barData.length - 1 === index && barData.length % 2 === 1
                  ? "100%"
                  : (Layout.screen.width - 30) / 2 - 5,
              backgroundColor:
                selected === item.label
                  ? Color(Colors.primary_light).lighten(0.4).string()
                  : Colors.primary_light,
            },
          ]}
        >
          <Text style={styles.totalText}>
            {Math.trunc(item.value)}zł
            <Text style={{ color: "gray" }}>
              <Text style={{ fontSize: 12 }}>
                {"  "} / {"  "}
              </Text>
              <Text style={{ fontSize: 12 }}>
                {((item.value / sumOfExpenses) * 100).toFixed(2)}%
              </Text>
            </Text>
          </Text>

          <View style={styles.tileText}>
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <Text style={{ color: blueText }}>{capitalize(item.label)}</Text>
          </View>
        </Ripple>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header
        buttons={[
          {
            icon: (
              <MaterialIcons
                name="bar-chart"
                size={25}
                color={chartType === "bar" ? Colors.secondary : "#fff"}
              />
            ),
            onPress: () => setChartType("bar"),
          },
          {
            icon: (
              <MaterialIcons
                name="pie-chart"
                size={20}
                color={chartType === "pie" ? Colors.secondary : "#fff"}
              />
            ),
            onPress: () => setChartType("pie"),
          },
        ]}
        goBack
      />
      <VirtualizedList
        ref={listRef}
        ListHeaderComponent={
          <>
            <View style={styles.listHeader}>
              <View style={{ height: Layout.screen.height / 3 }}>
                {chartType === "pie" ? (
                  <PieChart
                    onPress={(item: {
                      label: string;
                      value: number;
                      color: string;
                    }) => {
                      setSelected(item.label);
                    }}
                    animationDuration={1000}
                    innerCircleColor={Colors.primary}
                    showGradient
                    donut
                    radius={(Layout.screen.width - 30) / 3}
                    data={barData}
                    showText
                    isAnimated
                    focusOnPress
                    innerRadius={70}
                    centerLabelComponent={() => (
                      <View>
                        <Text style={styles.chartTotal}>
                          {sumOfExpenses.toFixed(2)}zł
                        </Text>
                        <Text style={styles.chartInnerText}>Total</Text>
                      </View>
                    )}
                  />
                ) : (
                  <Charts data={barData} />
                )}
              </View>

              <DateRangePicker filters={filters} dispatch={dispatch} />

              <Legend />
            </View>

            {selected && (
              <Text style={styles.expenseTitle}>
                {capitalize(selected) || "Income"}
              </Text>
            )}
          </>
        }
        data={data.wallet.expenses.filter((item) => item.category === selected)}
        getItem={(data, index) => data[index]}
        getItemCount={(data) => data.length}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 15 }}
        bounces
        removeClippedSubviews
        initialNumToRender={5}
        renderItem={({ item }) => (
          <WalletItem
            handlePress={() => {
              setSelectedExpense(item);
              expenseSheetRef.current?.expand();
            }}
            {...item}
          />
        )}
      />

      <WalletSheet selected={selectedExpense} ref={expenseSheetRef} />
    </SafeAreaView>
  );
}

const DateRangePicker = (props: {
  filters: Filters;
  dispatch: React.Dispatch<Action>;
}) => {
  const DateRanges = [
    ["Today", [moment(), moment().add(1, "day")]],
    ["Yesterday", [moment().subtract(1, "day"), moment()]],
    ["Last 7 days", [moment().subtract(7, "days"), moment().add(1, "day")]],
    ["Last 30 days", [moment().subtract(30, "days"), moment()]],
    ["This month", [moment().startOf("month"), moment().endOf("month")]],
    [
      "Last month",
      [
        moment().subtract(1, "month").startOf("month"),
        moment().subtract(1, "month").endOf("month"),
      ],
    ],
    ["This year", [moment().startOf("year"), moment().endOf("year")]],
  ].reverse() as [string, [Moment, Moment]][];

  const [selected, setSelected] = useState("This year");

  const onDateChange = (label: string, from: Moment, to: Moment) => {
    if (label === selected) {
      props.dispatch({ type: "SET_DATE_MAX", payload: "" });
      props.dispatch({ type: "SET_DATE_MIN", payload: "" });
      setSelected("");
      return;
    }
    props.dispatch({
      type: "SET_DATE_MIN",
      payload: from.format("YYYY-MM-DD"),
    });
    props.dispatch({ type: "SET_DATE_MAX", payload: to.format("YYYY-MM-DD") });
    setSelected(label);
  };

  return (
    <ScrollView
      showsHorizontalScrollIndicator={false}
      horizontal
      style={{
        width: Layout.screen.width - 30,
      }}
    >
      {DateRanges.map(([label, [from, to]]) => (
        <Button
          variant="text"
          key={label.toString()}
          onPress={() => onDateChange(label, from, to)}
          fontStyle={{
            fontSize: 14,
            color: selected === label ? Colors.secondary : blueText,
          }}
          style={[
            styles.button,
            {
              borderWidth: 0.5,
              borderColor: Colors.primary,
              marginRight: 10,
              ...(selected === label && {
                backgroundColor: lowOpacity(Colors.secondary, 0.15),
                borderWidth: 0.5,
                borderColor: lowOpacity(Colors.secondary, 0.5),
              }),
            },
          ]}
        >
          {label}
        </Button>
      ))}
    </ScrollView>
  );
};
