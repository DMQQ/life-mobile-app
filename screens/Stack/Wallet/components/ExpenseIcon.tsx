import { AntDesign, Entypo, FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import lowOpacity from "@/utils/functions/lowOpacity";
import { StyleSheet, View } from "react-native";

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

  refunded: {
    backgroundColor: Colors.secondary_light_1,
    icon: <Entypo name="back-in-time" color={Colors.secondary_light_2} size={20} />,
  },

  none: {
    backgroundColor: Colors.primary,
    icon: <Ionicons name="add" color={Colors.secondary} size={20} />,
  },
} as const;

export const CategoryIcon = (props: { category: keyof typeof Icons; type: "income" | "expense" | "refunded"; clear?: boolean }) => {
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

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,
    height: 40,
    width: 40,
  },

  icon_container: {
    padding: 7.5,
    justifyContent: "center",
  },
});
