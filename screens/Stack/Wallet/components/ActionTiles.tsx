import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StyleSheet } from "react-native";
import Ripple from "react-native-material-ripple";
import Colors from "../../../../constants/Colors";
import Animated, { SharedValue } from "react-native-reanimated";

const styles = StyleSheet.create({
  action_tiles: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
  },
  action_tile: {
    backgroundColor: "red",
    borderRadius: 5,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    margin: 5,
  },
});

interface ActionTilesProps {
  onAddExpense: () => void;
  scrollY: SharedValue<number>;
}

export default function ActionTiles(props: ActionTilesProps) {
  const navigation = useNavigation<any>();

  return (
    <Animated.View style={[styles.action_tiles]}>
      <ActionTile icon="bar-chart-2" color="#485dfe" text="Stats" />
      <ActionTile
        icon="list"
        color={Colors.primary_dark}
        text="List"
        onPress={() => navigation.navigate("Watchlist")}
      />
      <ActionTile icon="edit" color="#8b007d" text="Edit" />

      <ActionTile
        onPress={props.onAddExpense}
        icon="plus"
        text="add"
        color={Colors.primary_darker}
      />
    </Animated.View>
  );
}

const ActionTile = (props: {
  color?: string;
  text: string;
  icon: string;
  onPress?: () => void;
}) => {
  return (
    <Ripple
      onPress={props.onPress}
      style={[
        styles.action_tile,
        {
          backgroundColor: props.color,
        },
      ]}
    >
      <Feather size={25} color={"#fff"} name={props.icon as any} />
    </Ripple>
  );
};
