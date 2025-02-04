import { View, Text, StyleSheet, StyleProp, ViewStyle } from "react-native";
import moment from "moment";
import Colors from "@/constants/Colors";
import Ripple from "react-native-material-ripple";
import Animated, { AnimatedStyle } from "react-native-reanimated";
import { CategoryIcon, Icons } from "../ExpenseIcon";

export interface WalletElement {
  description: string;
  amount: number;
  type: string;
  date: string;
  id: string;

  balanceBeforeInteraction: number;

  category: keyof typeof Icons;

  note?: string;
}

export { Icons } from "../ExpenseIcon";

export { CategoryIcon } from "../ExpenseIcon";

interface WalletItemProps extends WalletElement {}

const styles = StyleSheet.create({
  expense_item: {
    height: 65,
    borderRadius: 15,
    padding: 10,
    flexDirection: "row",
    backgroundColor: Colors.primary_lighter,
  },
  title: {
    color: "#fff",
    fontSize: 15,
    marginLeft: 10,
    fontWeight: "bold",
    marginBottom: 5,
  },
  icon_container: {
    padding: 7.5,
    justifyContent: "center",
  },
  date: {
    color: "#9f9f9f",
    fontSize: 10,
    marginLeft: 10,
    lineHeight: 15,
  },
  price_container: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  price: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  button: {
    padding: 5,
    paddingHorizontal: 7.5,
    backgroundColor: Colors.primary_light,
  },
  buttonText: {
    color: Colors.secondary,
    fontSize: 20,
    fontWeight: "bold",
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,
    height: 40,
    width: 40,
  },
});

export function parseDateToText(date: string) {
  const providedDate = moment(date);

  const today = moment();
  const yesterday = moment().subtract(1, "days");

  if (providedDate.isSame(today, "day")) {
    return "Today";
  }
  if (providedDate.isSame(yesterday, "day")) {
    return "Yesterday";
  }
  return providedDate.format("YYYY-MM-DD");
}

export default function WalletItem(
  item: WalletItemProps & {
    handlePress: Function;
    animatedStyle: AnimatedStyle;
    index: number;
    containerStyle?: StyleProp<ViewStyle>;
  }
) {
  const price = item.type === "expense" ? (item.amount * -1).toFixed(2) : item.amount.toFixed(2);

  const isBalanceEdit = item.description.includes("Balance edited") || item.amount === 0;

  return (
    <Animated.View
      style={[
        {
          marginBottom: 15,
          position: "relative",
        },
        item.animatedStyle,
      ]}
    >
      <Ripple disabled={isBalanceEdit} style={[styles.expense_item, item.containerStyle]} onPress={() => item.handlePress()}>
        <CategoryIcon type={item.type as "income" | "expense" | "refunded"} category={isBalanceEdit ? "edit" : item.category} />

        <View style={{ height: "100%", justifyContent: "center", flex: 3 }}>
          <Text style={styles.title} numberOfLines={1}>
            {item.description}
          </Text>
          <View style={{ flexDirection: "row" }}>
            <Text style={styles.date}>
              {parseDateToText(item.date)} &#183; {item.category ? `${item.category}` : ""}
            </Text>
          </View>
        </View>
        {!isBalanceEdit && (
          <View style={[styles.price_container, { flexDirection: "row" }]}>
            <Text
              style={[
                styles.price,
                {
                  marginRight: 10,
                  width: "100%",
                  textAlign: "right",
                  color: item.type === "refunded" ? Colors.secondary_light_2 : item.type === "expense" ? "#F07070" : "#66E875",
                  ...(item.type === "refunded" ? { textDecorationLine: "line-through" } : {}),
                },
              ]}
            >
              {price}
              <Text style={{ fontSize: 14 }}>zł</Text>
            </Text>
          </View>
        )}
      </Ripple>
    </Animated.View>
  );
}
