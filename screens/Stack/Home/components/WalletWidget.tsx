import { StyleSheet, Text, View, ScrollView, Dimensions, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Color from "color";
import { useNavigation } from "@react-navigation/native";
import WalletItem from "../../Wallet/components/Wallet/WalletItem";
import Colors from "@/constants/Colors";
import Ripple from "react-native-material-ripple";
import useGetStatistics from "../../Wallet/hooks/useGetStatistics";
import moment from "moment";
import { memo, useState } from "react";

const Sizing = {
  heading: 30,
  subHead: 22.5,
  text: 18,
  tooltip: 14,
};

interface TransactionItem {
  id: string;
  amount: number;
  category: string;
  date: string;
  type: "income" | "expense";
  description: string;
}

interface Props {
  data: {
    wallet: {
      balance: number;
      expenses: TransactionItem[];
    };
    statistics: {
      weeklySpendings: {
        expense: number;
        income: number;
        average: number;
      };
    };
  };
  loading: boolean;
}

const StatItem = ({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) => (
  <View style={[styles.statItem, { backgroundColor: Color(color).alpha(0.1).string() }]}>
    <View style={{ flexDirection: "row", gap: 10 }}>
      <MaterialCommunityIcons name={icon as any} size={30} color={color} />
      <Text style={[styles.statValue, { color }]}>{value?.toFixed(2)} zł</Text>
    </View>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const AvailableBalanceWidget = ({ data, loading }: Props) => {
  const navigation = useNavigation<any>();

  if (loading) {
    return <View style={styles.loadingContainer} />;
  }

  return (
    <View style={styles.container}>
      {/* Balance Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.balance}>
            {data?.wallet?.balance?.toFixed(2) || "Balance unavailable"}
            {data?.wallet?.balance && <Text style={styles.currency}> zł</Text>}
          </Text>
        </View>
        <Ripple style={styles.actionButton} onPress={() => navigation.navigate("WalletScreens")}>
          <Text style={styles.actionButtonText}>See more</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.secondary} />
        </Ripple>
      </View>

      <IncomeExpenseBar />

      {/* Weekly Statistics */}
      {data.statistics && (
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Weekly Overview</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsContainer}>
            <StatItem label="Weekly Spent" value={data.statistics?.weeklySpendings?.expense} icon="calendar-week" color="#8685EF" />
            <StatItem label="Income" value={data.statistics?.weeklySpendings?.income} icon="cash-plus" color="#00C896" />
            <StatItem label="Average" value={data.statistics?.weeklySpendings?.average} icon="chart-line" color="#34A3FA" />
          </ScrollView>
        </View>
      )}

      {/* Recent Transactions */}
      {data.wallet?.expenses?.length > 0 && (
        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>

          {data?.wallet?.expenses.slice(0, 3).map((expense) => (
            <WalletItem
              handlePress={() =>
                navigation.navigate("WalletScreens", {
                  screen: "Wallet",
                  params: { expenseId: expense.id },
                })
              }
              {...(expense as any)}
              key={expense.id}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const steps = [
  ["This year", [moment().startOf("year").format("YYYY-MM-DD"), moment().endOf("year").format("YYYY-MM-DD")]],
  ["This month", [moment().startOf("month").format("YYYY-MM-DD"), moment().endOf("month").format("YYYY-MM-DD")]],
  ["This week", [moment().startOf("week").format("YYYY-MM-DD"), moment().endOf("week").format("YYYY-MM-DD")]],
  ["Today", [moment().startOf("day").format("YYYY-MM-DD"), moment().endOf("day").format("YYYY-MM-DD")]],
] as const;

const IncomeExpenseBar = memo(() => {
  const [step, setStep] = useState(0);

  const range = step < steps.length ? steps[step][1] : steps[0][1];

  const { data } = useGetStatistics(range as any);

  const totalWidth = Dimensions.get("window").width - 30;

  const expense = data?.statistics?.expense || 0;

  const income = data?.statistics?.income || 0;

  if ((expense === 0 && income === 0) || Number.isNaN(expense) || Number.isNaN(income)) return null;

  const total = expense + income;

  const incomeWidth = (income / total) * totalWidth;

  const expenseWidth = (expense / total) * totalWidth;

  return (
    <View style={{ marginTop: 15 }}>
      <TouchableOpacity
        onPress={() => {
          if (step === steps.length - 1) {
            setStep(0);
          } else {
            setStep(step + 1);
          }
        }}
      >
        <Text style={styles.sectionTitle}>{steps[step][0]} overview</Text>
      </TouchableOpacity>
      <View style={{ flexDirection: "row", backgroundColor: Color(Colors.primary_lighter).lighten(0.5).hex(), borderRadius: 10 }}>
        <View
          style={{
            width: expenseWidth,
            backgroundColor: "#FF5454",
            height: 10,
            borderTopLeftRadius: 10,
            borderBottomLeftRadius: 10,
          }}
        />
        <View
          style={{
            width: incomeWidth,
            backgroundColor: Colors.secondary,
            height: 10,
            borderTopRightRadius: 10,
            borderBottomRightRadius: 10,
          }}
        />
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
        <Text style={{ color: "#FF5454", fontSize: Sizing.tooltip, marginTop: 4 }}>-{expense.toFixed(2)} zł</Text>
        <Text style={{ color: "#fff", fontSize: Sizing.tooltip, marginTop: 4 }}>
          {income - expense > 0 ? "+" : ""}
          {(income - expense).toFixed(2)}zł
        </Text>
        <Text style={{ color: Colors.secondary, fontSize: Sizing.tooltip, marginTop: 4 }}>+{income.toFixed(2)} zł</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: 0,
    backgroundColor: Colors.primary,
    borderRadius: 24,
    gap: 20,
  },
  loadingContainer: {
    height: 400,
    backgroundColor: Colors.primary,
    borderRadius: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  title: {
    fontSize: Sizing.text,
    color: "#fff",
    fontWeight: "600",
  },
  balance: {
    fontSize: 48,
    fontWeight: "bold",
    color: Colors.text_light,
    marginTop: 8,
  },
  currency: {
    fontSize: 24,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Color(Colors.secondary).alpha(0.1).string(),
    padding: 8,
    paddingLeft: 12,
    borderRadius: 20,
    marginBottom: 10,
  },
  actionButtonText: {
    color: Colors.secondary,
    marginRight: 4,
    fontSize: Sizing.tooltip,
  },
  sectionTitle: {
    fontSize: Sizing.text,
    fontWeight: "600",
    color: Colors.text_light,
    marginBottom: 12,
  },
  statsSection: {
    marginTop: 8,
  },
  statsContainer: {
    gap: 12,
    paddingRight: 20,
  },
  statItem: {
    padding: 20,
    borderRadius: 15,
    width: Dimensions.get("window").width * 0.4,
    alignItems: "center",
  },
  statLabel: {
    color: "#fff",
    opacity: 0.9,
    fontSize: 12,
    marginTop: 8,
  },
  statValue: {
    fontSize: Sizing.text,
    fontWeight: "bold",
    marginTop: 4,
  },
  transactionsSection: {
    marginTop: 8,
  },
  transactionsList: {
    gap: 12,
    paddingRight: 20,
  },
  transactionCard: {
    backgroundColor: Colors.primary_lighter,
    padding: 16,
    borderRadius: 16,
    width: Dimensions.get("window").width * 0.75,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 12,
  },
  categoryText: {
    color: Colors.text_light,
    fontSize: Sizing.text,
    fontWeight: "600",
  },
  amount: {
    fontSize: Sizing.text,
    fontWeight: "bold",
  },
  transactionDate: {
    color: Colors.text_light,
    opacity: 0.7,
    fontSize: Sizing.tooltip,
  },
});

export default AvailableBalanceWidget;
