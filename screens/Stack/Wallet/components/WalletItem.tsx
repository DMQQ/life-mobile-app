import { View, Text, StyleSheet } from "react-native";
import {
  AntDesign,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
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
    height: 80,
    borderRadius: 10,
    padding: 10,
    flexDirection: "row",
    backgroundColor: Color(Colors.primary).lighten(0.5).hex(),
  },
  title: {
    color: "#fff",
    fontSize: 24,
    marginLeft: 10,
    fontWeight: "bold",
    marginBottom: 5,
  },
  icon_container: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    flex: 1,
    backgroundColor: "rgba(255,0,0,0.15)",
  },
  date: {
    color: "#9f9f9f",
    fontSize: 12,
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
    fontSize: 22,
    fontWeight: "bold",
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

const Icons = {
  housing: {
    icon: <AntDesign name="home" size={25} color={"#05ad21"} />,
    backgroundColor: "#05ad21",
  },
  transportation: {
    icon: <AntDesign name="car" size={25} color={"#ab0505"} />,
    backgroundColor: "#ab0505",
  },
  food: {
    icon: <Ionicons name="fast-food-outline" color={"#5733FF"} size={25} />,
    backgroundColor: "#5733FF",
  },
  health: {
    icon: <MaterialCommunityIcons name="pill" size={25} color={"#07bab4"} />,
    backgroundColor: "#07bab4",
  },
  entertainment: {
    icon: (
      <MaterialCommunityIcons name="movie-open" size={24} color={"#990583"} />
    ),
    backgroundColor: "#990583",
  },
  utilities: {
    icon: (
      <MaterialCommunityIcons
        name="power-plug-outline"
        size={24}
        color={"#5733ff"}
      />
    ),
    backgroundColor: "#5733FF",
  },
  debt: {
    icon: <AntDesign name="creditcard" size={24} color={"#ff5733"} />,
    backgroundColor: "#FF5733",
  },
  education: {
    icon: <AntDesign name="book" size={24} color={"#cc9a1b"} />,
    backgroundColor: "#cc9a1b",
  },
  savings: {
    icon: <Ionicons name="cash-outline" size={24} color="#cf0a80" />,
    backgroundColor: "#cf0a80",
  },

  travel: {
    backgroundColor: "#33FF57",
    icon: <Ionicons name="airplane-outline" size={24} color="#33ff57" />,
  },
};

export default function WalletItem(
  item: WalletItemProps & {
    handlePress: Function;
    animatedStyle: any;
  }
) {
  const selectedCategory = Object.keys(Icons)[
    Math.trunc(Math.random() * Object.keys(Icons).length)
  ] as keyof typeof Icons;
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
        <View
          style={[
            styles.icon_container,
            {
              backgroundColor: Color(Icons[selectedCategory].backgroundColor)
                .darken(0.7)
                .hex(),
            },
          ]}
        >
          {Icons[selectedCategory].icon}
        </View>

        <View style={{ height: "100%", justifyContent: "center", flex: 3 }}>
          <Text style={styles.title} numberOfLines={1}>
            {item.description}
          </Text>
          <View style={{ flexDirection: "row" }}>
            <Text style={styles.date}>{parseDateToText(item.date)}</Text>
          </View>
        </View>
        <View style={[styles.price_container, { flexDirection: "row" }]}>
          {/* <Dot color={item.type === "expense" ? "red" : "green"} /> */}
          <Text style={[styles.price, { marginLeft: 5 }]}>
            {item.type === "expense" ? "-" : "+"}
            {item.amount.toFixed(2)}zł
          </Text>
        </View>
      </Ripple>
    </Animated.View>
  );
}
