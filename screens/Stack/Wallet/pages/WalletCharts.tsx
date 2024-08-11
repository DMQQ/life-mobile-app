import Header from "@/components/ui/Header/Header";
import Colors, { secondary_candidates } from "@/constants/Colors";
import Layout from "@/constants/Layout";
import { MaterialIcons } from "@expo/vector-icons";
import { useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View, VirtualizedList } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import Ripple from "react-native-material-ripple";
import { SafeAreaView } from "react-native-safe-area-context";
import Charts from "../components/Wallet/Charts";
import WalletItem from "../components/Wallet/WalletItem";
import useGetWallet from "../hooks/useGetWallet";

const styles = StyleSheet.create({
  chartInnerText: {
    color: "#fff",
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
});

export default function WalletCharts() {
  const { data } = useGetWallet();
  const listRef = useRef<VirtualizedList<any> | null>(null);
  const [selected, setSelected] = useState("");

  const [chartType, setChartType] = useState<"pie" | "bar">("pie");

  const barData = useMemo(() => {
    const mapped = data.wallet.expenses.reduce((acc, curr) => {
      const key = curr.category;

      if (!key || curr.description.startsWith("Balance")) return acc;

      if (!acc[key]) {
        acc[key] = 0;
      }
      acc[key] += curr.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(mapped).map(([key, value], index) => ({
      value,
      label: key,
      color: secondary_candidates[index],
      selected: key === selected,
    })) as any[];
  }, []);

  const sumOfExpenses = useMemo(() => {
    return data.wallet.expenses.reduce((acc, curr) => {
      return curr.type === "income" ? acc : acc + curr.amount;
    }, 0);
  }, []);

  const Legend = () => (
    <View style={styles.tilesContainer}>
      {barData.map((item, index) => (
        <Ripple
          onPress={() => {
            setSelected(item.label);
            setTimeout(() => {
              listRef.current?.scrollToIndex({ index: 0 });
            }, 100);
          }}
          key={index}
          style={[
            {
              width:
                barData.length - 1 === index && barData.length % 2 === 1
                  ? "100%"
                  : (Layout.screen.width - 30) / 2 - 5,
            },
            styles.tile,
          ]}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 22.5,
              fontWeight: "bold",
            }}
          >
            {Math.trunc(item.value)}zł
            <Text style={{ color: "gray" }}>
              <Text style={{ fontSize: 14 }}>
                {"  "} / {"  "}
              </Text>
              <Text style={{ fontSize: 14 }}>
                {((item.value / sumOfExpenses) * 100).toFixed(2)}%
              </Text>
            </Text>
          </Text>

          <View style={styles.tileText}>
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <Text style={{ color: "#fff" }}>{item.label}</Text>
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
            <View
              style={{
                flex: 1,
                paddingHorizontal: 15,
                alignItems: "center",
                marginBottom: 30,
              }}
            >
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
                        <Text
                          style={{
                            color: "#fff",
                            fontSize: 24,
                            fontWeight: "bold",
                          }}
                        >
                          {sumOfExpenses}zł
                        </Text>
                        <Text style={styles.chartInnerText}>Total</Text>
                      </View>
                    )}
                  />
                ) : (
                  <Charts data={barData} />
                )}
              </View>
              <Legend />
            </View>

            {selected && <Text style={styles.expenseTitle}>{selected}</Text>}
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
          <WalletItem handlePress={() => {}} {...item} />
        )}
      />
    </SafeAreaView>
  );
}
