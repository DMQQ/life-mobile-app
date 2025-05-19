import Header from "@/components/ui/Header/Header";
import Colors, { secondary_candidates } from "@/constants/Colors";
import Layout from "@/constants/Layout";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View, VirtualizedList } from "react-native";
import Charts from "../components/Wallet/Charts";
import WalletItem, { Icons, WalletElement } from "../components/Wallet/WalletItem";
import useGetWallet, { useGetBalance } from "../hooks/useGetWallet";
import PieChart from "../components/WalletChart/PieChart";
import wrapWithFunction from "@/utils/functions/wrapFn";
import DateRangePicker from "../components/WalletChart/DateRangePicker";
import Legend from "../components/WalletChart/Legend";
import useGetStatistics from "../hooks/useGetStatistics";
import StatisticsSummary from "../components/WalletChart/StatisticsSummary";
import SpendingsByDay from "../components/WalletChart/SpendingsByDayOfWeek";
import { Expense, ScreenProps } from "@/types";
import FutureProjection from "../components/WalletChart/FutureProjection";
import DailySpendingChart from "../components/WalletChart/DailySpendingChart";
import WalletContextProvider from "../components/WalletContext";
import Ripple from "react-native-material-ripple";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import Feedback from "react-native-haptic-feedback";
import MonthlyCategoryComparison from "../components/WalletChart/MonthlyComparison";
import CalendarHeatmap from "../components/WalletChart/MonthlySpendingHeatMap";
import moment from "moment";
import HourlySpendingsHeatMap from "../components/WalletChart/HourlyHeatMap";
import { CategoryUtils } from "../components/ExpenseIcon";

const styles = StyleSheet.create({
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
  viewAll: { color: Colors.secondary, textAlign: "center", marginTop: 10 },

  overlay: { backgroundColor: Colors.primary, zIndex: 1000, justifyContent: "center", alignItems: "center" },
});

export default function WalletChartComponent(props: any) {
  return (
    <WalletContextProvider>
      <WalletCharts {...props} />
    </WalletContextProvider>
  );
}

interface BarItemProps {
  label: string;
  value: number;
  color: string;
  selected: boolean;
  itemsCount: number;
}

export const getInvalidExpenses = (curr: Expense) =>
  !curr.category ||
  curr.description.startsWith("Balance") ||
  curr.type === "income" ||
  curr.type === "refunded" ||
  curr.category === "refunded" ||
  curr.amount == 0;

function WalletCharts({ navigation }: any) {
  const {
    data = { wallet: { expenses: [] } },
    dispatch,
    filters,
  } = useGetWallet({ fetchAll: true, excludeFields: ["subscription", "location", "files", "subexpenses"] });
  const { data: stats, loading } = useGetStatistics([filters.date.from, filters.date.to]);

  const [overlay, setOverlay] = useState(true);

  useEffect(() => {
    if (loading) {
      setOverlay(true);

      return;
    }

    let timeout = setTimeout(() => {
      setOverlay(false);
    }, 1500);

    return () => {
      clearTimeout(timeout);
    };
  }, [loading]);

  const filteredExpenses = useMemo(() => {
    return data?.wallet?.expenses?.filter((item) => !getInvalidExpenses(item)) || [];
  }, [data?.wallet?.expenses]);

  const [excluded, setExcluded] = useState<string[]>([]);

  const listRef = useRef<VirtualizedList<any> | null>(null);
  const [selected, setSelected] = useState("");

  const [chartType, setChartType] = useState<"pie" | "bar">("pie");

  const barData = useMemo(() => {
    if (!filteredExpenses.length) return [];

    const expensesGroupedByCategory = filteredExpenses.reduce(
      (acc, curr) => {
        const key = CategoryUtils.getCategoryParent(curr.category);

        if (!acc[key])
          return {
            ...acc,
            [key]: {
              amount: curr.amount,
              count: 1,
            },
          };

        return {
          ...acc,
          [key]: {
            amount: acc[key].amount + curr.amount,
            count: acc[key].count + 1,
          },
        };
      },
      {} as Record<
        string,
        {
          amount: number;
          count: number;
        }
      >
    );

    return Object.entries(expensesGroupedByCategory)
      .map(([key, { amount, count }], index) => ({
        value: amount,
        label: key,
        color: Icons[key as keyof typeof Icons]?.backgroundColor || secondary_candidates[index % secondary_candidates.length],
        selected: key === selected,
        itemsCount: count,
      }))
      .sort((a, b) => b.value - a.value) as BarItemProps[];
  }, [filteredExpenses, excluded]);

  const sumOfExpenses = useMemo(() => {
    if (!data?.wallet?.expenses) return 0;

    return barData.reduce((acc, curr) => {
      if (excluded.includes(curr.label)) return acc;
      return acc + curr.value;
    }, 0);
  }, [barData, excluded.length]);

  const onLegendItemPress = (item: { label: string }) => {
    if (!item.label) return;

    if (excluded.includes(item.label)) {
      setExcluded((prev) => prev.filter((cat) => cat !== item.label));
    }

    setSelected((prev) => (prev === item.label ? "" : item.label));
    setStep(5);

    setTimeout(() => {
      listRef.current?.scrollToIndex({ index: 0, animated: true });
    }, 100);
  };

  const selectedCategoryData =
    selected === ""
      ? data?.wallet?.expenses || []
      : data?.wallet?.expenses?.filter((item) => item.category === CategoryUtils.getCategoryParent(selected) && item.type !== "refunded") ||
        [];

  const onChartPress = (e: any) => {
    setSelected(e.label);
    e.label !== undefined && Alert.alert(`Category ${e.label} is`, e.value.toFixed(2));
  };

  const currentBalance = useGetBalance();

  const chartData = useMemo(() => {
    return barData.filter((item) => {
      if (excluded.length === 0) return true;
      return !excluded.includes(item.label);
    });
  }, [barData]);

  const onLongPress = useCallback(
    (item: { label: string } & Record<string, any>) => {
      Feedback.trigger("impactLight");
      setExcluded((prev) => {
        if (prev.includes(item.label)) return prev.filter((cat) => cat !== item.label);
        return [...prev, item.label];
      });
      if (item.label === selected) {
        setSelected("");
      }
    },
    [selected]
  );

  const ListHeaderComponent = useMemo(
    () => (
      <>
        <View style={styles.listHeader}>
          <View style={{ height: Layout.screen.height / 2.8, marginBottom: 15 }}>
            {chartType === "pie" ? (
              <PieChart data={chartData} totalSum={sumOfExpenses} onPress={onChartPress} />
            ) : (
              <Charts data={chartData} onPress={onChartPress} totalSum={sumOfExpenses} />
            )}
          </View>
          <DateRangePicker filters={filters} dispatch={wrapWithFunction(dispatch, () => setSelected(""))} />
          <Legend
            excluded={excluded}
            onLongPress={onLongPress}
            totalSum={sumOfExpenses}
            selected={selected}
            data={barData}
            onPress={onLegendItemPress}
          />

          {selectedCategoryData.length > 0 && (
            <View style={{ width: Layout.screen.width - 30, marginTop: 25 }}>
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>
                Selected category:{" "}
                <Text style={{ color: barData.find((c) => c.label === selected)?.color, fontSize: 18, textTransform: "capitalize" }}>
                  {" "}
                  {selected || "All"}
                </Text>
              </Text>
            </View>
          )}
        </View>
      </>
    ),
    [sumOfExpenses, barData, filters, dispatch, chartType, selected, filteredExpenses.length]
  );

  const headerButtons = useMemo(
    () => [
      {
        icon: <MaterialIcons name="bar-chart" size={25} color={chartType === "bar" ? Colors.secondary : "#fff"} />,
        onPress: () => setChartType("bar"),
      },
      {
        icon: <MaterialIcons name="pie-chart" size={20} color={chartType === "pie" ? Colors.secondary : "#fff"} />,
        onPress: () => setChartType("pie"),
      },
    ],
    [chartType]
  );

  const [step, setStep] = useState(5);

  const insets = useSafeAreaInsets();

  const monthDiff = moment(filters.date.from).diff(moment(filters.date.to));

  return (
    <View style={{ paddingTop: 15, paddingBottom: insets.bottom }}>
      {overlay && (
        <Animated.View exiting={FadeOut} style={[StyleSheet.absoluteFillObject, styles.overlay]}>
          <ActivityIndicator
            size="large"
            color={Colors.secondary}
            style={{
              position: "absolute",
            }}
          />
        </Animated.View>
      )}

      <Header buttons={headerButtons} goBack backIcon={<AntDesign name="close" size={24} color="white" />} />
      <VirtualizedList
        ref={listRef}
        ListHeaderComponent={ListHeaderComponent}
        data={selectedCategoryData.slice(0, step)}
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
              navigation.navigate("Expense", {
                expense: item as Expense,
              });
            }}
            {...item}
          />
        )}
        ListFooterComponent={
          <Suspense fallback={<ActivityIndicator size="large" color={Colors.secondary} style={{ position: "absolute", top: 100 }} />}>
            <>
              {selectedCategoryData.length > step && (
                <Ripple onPress={() => setStep(selectedCategoryData.length)}>
                  <Text style={styles.viewAll}>View all</Text>
                </Ripple>
              )}
              <StatisticsSummary dates={filters.date} data={stats?.statistics} />
              <SpendingsByDay data={filteredExpenses} />
              {monthDiff > 28 && monthDiff < 32 && (
                <FutureProjection data={filteredExpenses} income={5500} currentBalance={currentBalance} />
              )}
              <DailySpendingChart data={filteredExpenses} />

              <MonthlyCategoryComparison />

              <CalendarHeatmap />

              <HourlySpendingsHeatMap />
            </>
          </Suspense>
        }
      />
    </View>
  );
}
