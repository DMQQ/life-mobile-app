import React from "react";
import { StyleSheet, Text, View, FlatList, ScrollView, Dimensions } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Color from "color";
import { useNavigation } from "@react-navigation/native";
import WalletItem from "../../Wallet/components/Wallet/WalletItem";
import Button from "@/components/ui/Button/Button";
import lowOpacity from "@/utils/functions/lowOpacity";

import Colors from "@/constants/Colors";
import Ripple from "react-native-material-ripple";

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
            {data?.wallet?.balance?.toFixed(2)}
            <Text style={styles.currency}> zł</Text>
          </Text>
        </View>
        <Ripple style={styles.actionButton} onPress={() => navigation.navigate("WalletScreens")}>
          <Text style={styles.actionButtonText}>See more</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.secondary} />
        </Ripple>
      </View>

      {/* Weekly Statistics */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Weekly Overview</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsContainer}>
          <StatItem label="Weekly Spent" value={data.statistics?.weeklySpendings?.expense} icon="calendar-week" color="#8685EF" />
          <StatItem label="Income" value={data.statistics?.weeklySpendings?.income} icon="cash-plus" color="#00C896" />
          <StatItem label="Average" value={data.statistics?.weeklySpendings?.average} icon="chart-line" color="#34A3FA" />
        </ScrollView>
      </View>

      {/* Recent Transactions */}
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
    </View>
  );
};

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
