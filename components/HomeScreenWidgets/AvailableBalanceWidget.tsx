import Color from "color";
import { FlatList, StyleSheet, Text, View } from "react-native";
import Colors, { Sizing, randColor } from "../../constants/Colors";
import { ViewMoreButton } from "../ui/Button/Button";
import { useNavigation } from "@react-navigation/native";
import { Expense, Wallet } from "../../types";
import { Padding, Rounded } from "../../constants/Layout";

const backgroundColor = "#BE15A8";

const styles = StyleSheet.create({
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
    marginHorizontal: 5,
  },
  container: {
    padding: Padding.xxl,
    backgroundColor,
    borderRadius: Rounded.xxl,
  },
  title_row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: "#ffffff",
    fontSize: Sizing.subHead,
    fontWeight: "bold",
  },
  balance: {
    fontSize: 55,
    color: "#fff",
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.25)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  activity: {
    color: "#ffffff",
    fontSize: Sizing.tooltip,
    fontWeight: "bold",
  },
  list: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Padding.xs,
  },
  expense_container: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 5,
  },
});

const ExpenseItem = (props: { text: string }) => (
  <View style={styles.expense_container}>
    <View style={styles.dot} />
    <Text style={{ color: "#fff" }}>{props.text}</Text>
  </View>
);

export default function AvailableBalanceWidget(props: { data: Wallet }) {
  const navigation = useNavigation<any>();

  const expenses = props?.data?.expenses?.slice(0, 4) || [];

  return (
    <View style={styles.container}>
      <View style={{ marginBottom: 10 }}>
        <View style={styles.title_row}>
          <Text style={styles.title}>Available Balance</Text>

          <ViewMoreButton
            bg="#fff"
            text="See more"
            onPress={() => navigation.navigate("WalletScreens")}
          />
        </View>
        <Text style={styles.balance}>
          {props?.data?.balance.toFixed(2)}
          <Text style={{ fontSize: 25 }}>zł</Text>
        </Text>
      </View>

      <Text style={styles.activity}>Recent activity</Text>

      <View style={styles.list}>
        {expenses.map((item: Expense) => (
          <ExpenseItem key={item.id} text={item.description} />
        ))}
      </View>
    </View>
  );
}
