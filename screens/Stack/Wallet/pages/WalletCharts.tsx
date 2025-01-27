import Header from "@/components/ui/Header/Header";
import Colors, { secondary_candidates } from "@/constants/Colors";
import Layout from "@/constants/Layout";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { useMemo, useRef, useState } from "react";
import { Alert, StyleSheet, Text, View, VirtualizedList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Charts from "../components/Wallet/Charts";
import WalletItem, { WalletElement } from "../components/Wallet/WalletItem";
import useGetWallet, { useGetBalance } from "../hooks/useGetWallet";
import { WalletSheet } from "../components/Sheets/WalletSheet";
import BottomSheet from "@gorhom/bottom-sheet";
import PieChart from "../components/WalletChart/PieChart";
import wrapWithFunction from "@/utils/functions/wrapFn";
import DateRangePicker from "../components/WalletChart/DateRangePicker";
import Legend from "../components/WalletChart/Legend";
import useGetStatistics from "../hooks/useGetStatistics";
import StatisticsSummary from "../components/WalletChart/StatisticsSummary";
import SpendingsByDay from "../components/WalletChart/SpendingsByDayOfWeek";
import { Expense } from "@/types";
import FutureProjection from "../components/WalletChart/FutureProjection";
import DailySpendingChart from "../components/WalletChart/DailySpendingChart";

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

export default function WalletCharts() {
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
        curr.category === "refunded"
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
        color: secondary_candidates[index],
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

  const [selectedExpense, setSelectedExpense] = useState<WalletElement | undefined>(undefined);

  const expenseSheetRef = useRef<BottomSheet>(null);

  const onLegendItemPress = (item: { label: string }) => {
    setSelected((prev) => (prev === item.label ? "" : item.label));
    if (selected !== item.label)
      setTimeout(() => {
        listRef.current?.scrollToIndex({ index: 0 });
      }, 100);
  };

  const selectedCategoryData = data?.wallet?.expenses.filter((item) => item.category === selected && item.type !== "refunded") || [];

  const onChartPress = (e: any) => {
    setSelected(e.label);
    e.label !== undefined && Alert.alert(`Category ${e.label} is`, e.value.toFixed(2));
  };

  const currentBalance = useGetBalance();

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
          <StatisticsSummary dates={filters.date} data={stats?.statistics} />
          <SpendingsByDay data={data?.wallet?.expenses || ([] as Expense[])} />
          <FutureProjection data={data?.wallet?.expenses || ([] as Expense[])} income={5500} currentBalance={currentBalance} />
          <DailySpendingChart data={data?.wallet?.expenses || ([] as Expense[])} />
          {selectedCategoryData.length > 0 && (
            <View style={{ width: Layout.screen.width - 30, marginTop: 25 }}>
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>
                Selected category:{" "}
                <Text style={{ color: barData.find((c) => c.label === selected)?.color, fontSize: 18, textTransform: "capitalize" }}>
                  {" "}
                  {selected || "income"}
                </Text>
              </Text>
              <Text style={{ color: "gray", marginTop: 5 }}>List of transactions</Text>
            </View>
          )}
        </View>
      </>
    ),
    [sumOfExpenses, barData, filters, dispatch, chartType, selected]
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

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: 15 }}>
      <Header buttons={headerButtons} goBack backIcon={<AntDesign name="close" size={24} color="white" />} />
      <VirtualizedList
        ref={listRef}
        ListHeaderComponent={ListHeaderComponent}
        data={selectedCategoryData}
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
