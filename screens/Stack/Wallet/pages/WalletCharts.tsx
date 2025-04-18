import Header from "@/components/ui/Header/Header";
import Colors, { secondary_candidates } from "@/constants/Colors";
import Layout from "@/constants/Layout";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View, VirtualizedList } from "react-native";
import Charts from "../components/Wallet/Charts";
import WalletItem, { Icons } from "../components/Wallet/WalletItem";
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

const categoryColors = {
  housing: "#05ad21",
  transportation: "#ab0505",
  food: "#5733FF",
  drinks: "#5733FF",
  shopping: "#ff5733",
  addictions: "#ff5733",
  work: "#5733FF",
  clothes: "#ff5733",
  health: "#07bab4",
  entertainment: "#990583",
  utilities: "#5733FF",
  debt: "#ff5733",
  education: "#cc9a1b",
  savings: "#cf0a80",
  travel: "#33FF57",
  edit: "gray",
  income: Colors.secondary_light_1, // You might want to replace this with an actual hex value
  animals: "#ff5733",
  refunded: Colors.secondary_light_1, // You might want to replace this with an actual hex value
  gifts: "#33FF57",
  subscriptions: "#8033ff",
  investments: "#33ff89",
  maintenance: "#ff8c33",
  insurance: "#3357ff",
  taxes: "#ff3333",
  children: "#ff33d1",
  donations: "#33ffd4",
  beauty: "#ff33a1",
  none: Colors.primary, // You might want to replace this with an actual hex value
};

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
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [loading]);

  const [excluded, setExcluded] = useState<string[]>([]);

  const listRef = useRef<VirtualizedList<any> | null>(null);
  const [selected, setSelected] = useState("");

  const [chartType, setChartType] = useState<"pie" | "bar">("pie");

  const barData = useMemo(() => {
    if (!data?.wallet?.expenses) return [];

    const mapped = data.wallet.expenses.reduce((acc, curr) => {
      if (
        !curr.category ||
        curr.description.startsWith("Balance") ||
        curr.type === "income" ||
        curr.type === "refunded" ||
        curr.category === "refunded" ||
        curr.amount == 0
      )
        return acc;
      const key = curr.category;

      if (!acc[key]) acc[key] = 0;

      acc[key] += curr.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(mapped)
      .map(([key, value], index) => ({
        value,
        label: key,
        color: categoryColors[key as keyof typeof Icons],
        selected: key === selected,
      }))
      .sort((a, b) => b.value - a.value) as {
      label: string;
      value: number;
      color: string;
    }[];
  }, [data?.wallet?.expenses, excluded]);

  const sumOfExpenses = useMemo(() => {
    if (!data?.wallet?.expenses) return 0;

    return data.wallet.expenses.reduce((acc, curr) => {
      if (curr.type === "income" || curr.type === "refunded" || excluded.includes(curr.category)) return acc;

      return acc + curr.amount;
    }, 0);
  }, [data?.wallet?.expenses, excluded.length]);

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
      : data?.wallet?.expenses.filter((item) => item.category === selected && item.type !== "refunded") || [];

  const onChartPress = (e: any) => {
    setSelected(e.label);
    e.label !== undefined && Alert.alert(`Category ${e.label} is`, e.value.toFixed(2));
  };

  const currentBalance = useGetBalance();

  const filteredExpenses = useMemo(() => {
    return data?.wallet?.expenses.filter((item) => item.type === "expense" || item.type === "refunded" || item.amount === 0) || [];
  }, [data?.wallet?.expenses]);

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
          <View style={{ height: Layout.screen.height / 3 }}>
            {chartType === "pie" ? (
              <PieChart data={chartData} totalSum={sumOfExpenses} onPress={onChartPress} />
            ) : (
              <Charts data={chartData} onPress={onChartPress} />
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
                  {selected || "income"}
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
              <FutureProjection data={filteredExpenses} income={5500} currentBalance={currentBalance} />
              <DailySpendingChart data={filteredExpenses} />
            </>
          </Suspense>
        }
      />
    </View>
  );
}
