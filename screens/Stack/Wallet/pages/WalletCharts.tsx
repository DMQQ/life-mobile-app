import Header from "@/components/ui/Header/Header";
import Colors, { secondary_candidates } from "@/constants/Colors";
import Layout from "@/constants/Layout";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { useMemo, useRef, useState } from "react";
import { Alert, StyleSheet, Text, View, VirtualizedList } from "react-native";
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
import Color from "color";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { LinearTransition } from "react-native-reanimated";

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
});

// use this context to fix the data ovveride issue in Wallet
export default (props: any) => (
  <WalletContextProvider>
    <WalletCharts {...props} />
  </WalletContextProvider>
);

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
  const { data = { wallet: { expenses: [] } }, dispatch, filters } = useGetWallet({ fetchAll: true });
  const { data: stats } = useGetStatistics([filters.date.from, filters.date.to]);

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
  }, [data?.wallet?.expenses]);

  const sumOfExpenses = useMemo(() => {
    if (!data?.wallet?.expenses) return 0;

    return data.wallet.expenses.reduce((acc, curr) => {
      if (curr.type === "income" || curr.type === "refunded") return acc;

      return acc + curr.amount;
    }, 0);
  }, [data?.wallet?.expenses]);

  const onLegendItemPress = (item: { label: string }) => {
    setSelected((prev) => (prev === item.label ? "" : item.label));
    setStep(5);
    if (selected !== item.label)
      setTimeout(() => {
        listRef.current?.scrollToIndex({ index: 0 });
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
    return data?.wallet?.expenses.filter((item) => item.type === "expense") || [];
  }, [data?.wallet?.expenses]);

  const ListHeaderComponent = useMemo(
    () => (
      <>
        <View style={styles.listHeader}>
          <View style={{ height: Layout.screen.height / 3 }}>
            {chartType === "pie" ? (
              <PieChart data={barData} totalSum={sumOfExpenses} onPress={onChartPress} />
            ) : (
              <Charts data={barData} onPress={onChartPress} />
            )}
          </View>
          <DateRangePicker filters={filters} dispatch={wrapWithFunction(dispatch, () => setSelected(""))} />
          <Legend totalSum={sumOfExpenses} selected={selected} data={barData} onPress={onLegendItemPress} />

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
    <View style={{ paddingTop: 15, paddingBottom: insets.bottom + 15 }}>
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
          <>
            {selectedCategoryData.length > step && (
              <Ripple onPress={() => setStep(selectedCategoryData.length)}>
                <Text style={{ color: Colors.secondary, textAlign: "center", marginTop: 10 }}>View all</Text>
              </Ripple>
            )}
            <StatisticsSummary dates={filters.date} data={stats?.statistics} />
            <SpendingsByDay data={filteredExpenses} />
            <FutureProjection data={filteredExpenses} income={5500} currentBalance={currentBalance} />
            <DailySpendingChart data={filteredExpenses} />
          </>
        }
      />
    </View>
  );
}
