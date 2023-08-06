import { View, Text, StyleSheet } from "react-native";
import { Entypo } from "@expo/vector-icons";
import moment from "moment";
import Color from "color";
import Colors from "../../../../constants/Colors";
import Ripple from "react-native-material-ripple";
import Animated, { Layout } from "react-native-reanimated";

export interface WalletElement {
  description: string;
  amount: number;
  type: string;
  date: string;
  id: string;

  balanceBeforeInteraction: number;
}

interface WalletItemProps extends WalletElement {}

const styles = StyleSheet.create({
  expense_item: {
    height: 65,
    borderRadius: 5,
    padding: 5,
    flexDirection: "row",
    backgroundColor: Color(Colors.primary).lighten(0.5).hex(),
  },
  title: {
    color: "#fff",
    fontSize: 22,
    marginLeft: 10,
    fontWeight: "bold",
    lineHeight: 30,
    marginTop: -3,
  },
  icon_container: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    flex: 1,
  },
  date: {
    color: "#b8b8b8",
    fontSize: 15,
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
    fontSize: 20,
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
});

function parseDateToText(date: string) {
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
    animatedStyle: any;
  }
) {
  return (
    <Animated.View
      layout={Layout}
      style={[
        {
          marginBottom: 10,
          position: "relative",
        },
        item.animatedStyle,
      ]}
    >
      <Ripple style={styles.expense_item} onPress={() => item.handlePress()}>
        <View style={{ paddingHorizontal: 5 }}>
          <View style={styles.icon_container}>
            <Entypo
              name={
                item.type === "expense" ? "arrow-bold-down" : "arrow-bold-up"
              }
              size={25}
              color={item.type === "expense" ? Colors.error : Colors.secondary}
            />
          </View>
        </View>
        <View style={{ height: "100%", justifyContent: "center", flex: 3 }}>
          <Text style={styles.date}>{parseDateToText(item.date)}</Text>
          <Text style={styles.title} numberOfLines={1}>
            {item.description}
          </Text>
        </View>
        <View style={[styles.price_container, { flexDirection: "row" }]}>
          {/* <Dot color={item.type === "expense" ? "red" : "green"} /> */}
          <Text style={[styles.price, { marginLeft: 5 }]}>
            {item.type === "expense" ? "-" : "+"} {item.amount.toFixed(2)}zł
          </Text>
        </View>
      </Ripple>
    </Animated.View>
  );
}
