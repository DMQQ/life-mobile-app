import { StyleSheet, Text, View, ScrollView, Dimensions, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Color from "color";
import { useNavigation } from "@react-navigation/native";
import Colors from "@/constants/Colors";
import Ripple from "react-native-material-ripple";
import moment from "moment";
import { memo, useState } from "react";
import Animated, { LinearTransition } from "react-native-reanimated";
import WalletLimits from "@/features/wallet/components/Limits";
import useGetStatistics from "@/features/wallet/hooks/useGetStatistics";
import WeeklyComparisonChart from "./WalletChart";
import ZeroExpenseStats from "@/features/wallet/components/WalletChart/ZeroSpendings";
import { gql, useQuery } from "@apollo/client";
import { AnimatedNumber } from "@/components";

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

const AvailableBalanceWidget = ({ data, loading }: Props) => {
  const navigation = useNavigation<any>();

  if (loading) {
    return <View style={styles.loadingContainer} />;
  }

  return (
    <Animated.View style={styles.container} layout={LinearTransition.delay(200)}>
      <View style={styles.header}>
        <View>
          <Text style={styles.balance}>
            <AnimatedNumber
              value={data?.wallet?.balance || 0}
              style={styles.balance}
              formatValue={(value) => value.toFixed(2) + "zł"}
              delay={250}
            />
          </Text>
        </View>
        <Ripple
          style={styles.actionButton}
          onPress={() =>
            navigation.navigate("WalletScreens", {
              screen: "CreateExpense",
              params: {
                shouldOpenPhotoPicker: true,
              },
            })
          }
        >
          <MaterialCommunityIcons name="camera" size={20} color={Colors.secondary} />
          <Text style={styles.actionButtonText}>AI scan</Text>
        </Ripple>
      </View>

      <WeeklyComparisonChart />

      <ZeroExpenseStats />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
    backgroundColor: Colors.primary,
    borderRadius: 24,
    gap: 20,
    flex: 1,
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
    gap: 8,
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
