import { View, Text, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { AntDesign, Entypo, FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import moment from "moment";
import Color from "color";
import Colors from "@/constants/Colors";
import Ripple from "react-native-material-ripple";
import Animated, { AnimatedStyle, AnimatedStyleProp, FadeInUp, Layout } from "react-native-reanimated";
import lowOpacity from "@/utils/functions/lowOpacity";

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

export const Icons = {
  housing: {
    icon: <AntDesign name="home" size={20} color={"#05ad21"} />,
    backgroundColor: "#05ad21",
  },
  transportation: {
    icon: <AntDesign name="car" size={20} color={"#ab0505"} />,
    backgroundColor: "#ab0505",
  },
  food: {
    icon: <Ionicons name="fast-food-outline" color={"#5733FF"} size={20} />,
    backgroundColor: "#5733FF",
  },
  drinks: {
    icon: <Ionicons name="beer-outline" color={"#5733FF"} size={20} />,
    backgroundColor: "#5733FF",
  },
  shopping: {
    icon: <MaterialCommunityIcons name="shopping" size={20} color={"#ff5733"} />,
    backgroundColor: "#ff5733",
  },
  addictions: {
    icon: <MaterialCommunityIcons name="smoking" size={20} color={"#ff5733"} />,
    backgroundColor: "#ff5733",
  },
  work: {
    icon: <MaterialCommunityIcons name="briefcase" size={20} color={"#5733ff"} />,
    backgroundColor: "#5733FF",
  },
  clothes: {
    icon: <MaterialCommunityIcons name="tshirt-crew" size={20} color={"#ff5733"} />,
    backgroundColor: "#ff5733",
  },
  health: {
    icon: <MaterialCommunityIcons name="pill" size={20} color={"#07bab4"} />,
    backgroundColor: "#07bab4",
  },
  entertainment: {
    icon: <MaterialCommunityIcons name="movie-open" size={20} color={"#990583"} />,
    backgroundColor: "#990583",
  },
  utilities: {
    icon: <MaterialCommunityIcons name="power-plug-outline" size={20} color={"#5733ff"} />,
    backgroundColor: "#5733FF",
  },
  debt: {
    icon: <AntDesign name="creditcard" size={20} color={"#ff5733"} />,
    backgroundColor: "#FF5733",
  },
  education: {
    icon: <AntDesign name="book" size={20} color={"#cc9a1b"} />,
    backgroundColor: "#cc9a1b",
  },
  savings: {
    icon: <Ionicons name="cash-outline" size={20} color="#cf0a80" />,
    backgroundColor: "#cf0a80",
  },

  travel: {
    backgroundColor: "#33FF57",
    icon: <Ionicons name="airplane-outline" size={20} color="#33ff57" />,
  },

  edit: {
    backgroundColor: "gray",
    icon: <Ionicons name="create" color="#fff" size={20} />,
  },

  income: {
    backgroundColor: Colors.secondary_light_1,
    icon: <FontAwesome5 name="dollar-sign" size={20} color={Colors.secondary_light_1} />,
  },

  animals: {
    backgroundColor: "#ff5733",
    icon: <FontAwesome5 name="dog" size={20} color="#ff5733" />,
  },

  none: {
    backgroundColor: Colors.primary,
    icon: <Ionicons name="add" color={Colors.secondary} size={20} />,
  },

  refunded: {
    backgroundColor: Colors.secondary_light_1,
    icon: <Entypo name="back-in-time" color={Colors.secondary_light_2} size={20} />,
  },
} as const;

export const CategoryIcon = (props: { category: keyof typeof Icons; type: "income" | "expense" | "refunded"; clear?: boolean }) => {
  // const category =
  //   props.type === "income" && props.category !== "edit" ? "income" : props.category || props.type === "refunded" ? "refunded" : "none";

  let category = props.category || "none";

  if (props.category === "edit") {
    category = "edit";
  } else if (props.type === "income") {
    category = "income";
  } else if (props.type === "refunded") {
    category = "refunded";
  }

  return (
    <View style={[styles.icon_container, { position: "relative" }]}>
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: !props.clear ? lowOpacity(Icons[category]?.backgroundColor, 15) : undefined,
          },
        ]}
      >
        {Icons[category]?.icon}
      </View>
    </View>
  );
};
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
