import { View, Text, StyleSheet, StyleProp, ViewStyle } from "react-native";
import {
  AntDesign,
  Entypo,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import moment from "moment";
import Color from "color";
import Colors from "@/constants/Colors";
import Ripple from "react-native-material-ripple";
import Animated, {
  AnimatedStyleProp,
  FadeInUp,
  Layout,
} from "react-native-reanimated";

export interface WalletElement {
  description: string;
  amount: number;
  type: string;
  date: string;
  id: string;

  balanceBeforeInteraction: number;

  category: keyof typeof Icons;
}

interface WalletItemProps extends WalletElement {}

const styles = StyleSheet.create({
  expense_item: {
    height: 70,
    borderRadius: 15,
    padding: 10,
    flexDirection: "row",
    backgroundColor: Colors.primary_lighter,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    marginLeft: 10,
    fontWeight: "bold",
    marginBottom: 5,
  },
  icon_container: {},
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

  edit: {
    backgroundColor: Colors.primary,
    icon: <Ionicons name="create" color="#fff" size={24} />,
  },

  income: {
    backgroundColor: Colors.secondary_light_1,
    icon: (
      <FontAwesome5
        name="dollar-sign"
        size={24}
        color={Colors.secondary_light_1}
      />
    ),
  },

  none: {
    backgroundColor: Colors.primary,
    icon: <Ionicons name="add" color={Colors.secondary} size={24} />,
  },
} as const;

const makeColor = (color: string) => {
  const [red, green, blue] = Color(color).rgb().array();

  return `rgba(${red}, ${green}, ${blue}, 0.15)`;
};

export const CategoryIcon = (props: {
  category: keyof typeof Icons;
  type: "income" | "expense";
  clear?: boolean;
}) => (
  <View style={[styles.icon_container, { position: "relative" }]}>
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: !props.clear
          ? makeColor(
              Icons[
                props.type === "income" ? "income" : props.category || "none"
              ]?.backgroundColor
            )
          : undefined,
        borderRadius: 10,
        height: 50,
        width: 50,
      }}
    >
      {
        Icons[props.type === "income" ? "income" : props.category || "none"]
          ?.icon
      }
    </View>
  </View>
);

export default function WalletItem(
  item: WalletItemProps & {
    handlePress: Function;
    animatedStyle: AnimatedStyleProp<any>;
    index: number;
    containerStyle?: StyleProp<ViewStyle>;
  }
) {
  const price =
    item.type === "expense"
      ? (item.amount * -1).toFixed(2)
      : item.amount.toFixed(2);

  const isBalanceEdit =
    item.description.includes("Balance edited") || item.amount === 0;

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
      <Ripple
        disabled={isBalanceEdit}
        style={[styles.expense_item, item.containerStyle]}
        onPress={() => item.handlePress()}
      >
        <CategoryIcon
          type={item.type as "income" | "expense"}
          category={isBalanceEdit ? "edit" : item.category}
        />

        <View style={{ height: "100%", justifyContent: "center", flex: 3 }}>
          <Text style={styles.title} numberOfLines={1}>
            {item.description}
          </Text>
          <View style={{ flexDirection: "row" }}>
            <Text style={styles.date}>
              {parseDateToText(item.date)} &#183;{" "}
              {item.category ? `${item.category}` : ""}
            </Text>
          </View>
        </View>
        {!isBalanceEdit && (
          <View style={[styles.price_container, { flexDirection: "row" }]}>
            <Text
              style={[
                styles.price,
                {
                  marginHorizontal: 5,
                  width: "100%",
                  textAlign: "right",
                  color: item.type === "expense" ? "#F07070" : "#66E875",
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
