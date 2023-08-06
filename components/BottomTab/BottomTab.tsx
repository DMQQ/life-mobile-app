import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { StyleSheet, View } from "react-native";
import Layout from "../../constants/Layout";
import Colors from "../../constants/Colors";
import Ripple from "react-native-material-ripple";
import { Ionicons } from "@expo/vector-icons";
import useKeyboard from "../../utils/hooks/useKeyboard";

const styles = StyleSheet.create({
  container: {
    width: Layout.screen.width,
    padding: 5,
    backgroundColor: Colors.primary,
    justifyContent: "space-around",
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: Colors.primary_light,
  },

  button: {
    flex: 1,
    padding: 15,
    paddingHorizontal: 15,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,
  },
});

export default function BottomTab({
  navigation,
  state,
  insets,
}: BottomTabBarProps) {
  const navigate = (route: string) => navigation.navigate(route);

  const onCalendarLongPress = () => {
    navigation.navigate("TimelineScreens", { screen: "Timeline" });
  };

  const activeRoute = state.routes[state.index].name;

  const Btn = (props: { route: string; iconName: any }) => (
    <Ripple
      rippleCentered
      rippleColor={Colors.secondary}
      onLongPress={onCalendarLongPress}
      style={[styles.button]}
      onPress={() => navigate(props.route)}
    >
      <Ionicons
        size={25}
        name={props.iconName}
        color={activeRoute === props.route ? "#fff" : Colors.secondary}
      />
    </Ripple>
  );

  const keyboard = useKeyboard();

  if (
    state.routes[state.index].state?.routes
      .map((subRoute) => subRoute.name)
      .some((v) => ["Workout", "Exercise"].includes(v)) ||
    keyboard
  )
    return null;

  return (
    <View style={[styles.container, { paddingBottom: 5 }]}>
      <Btn route="TimelineScreens" iconName={"calendar"} />

      <Btn route="NotesScreens" iconName={"clipboard"} />

      <Btn route="Root" iconName={"home"} />

      <Btn route="WorkoutScreens" iconName={"barbell"} />

      <Btn route="WalletScreens" iconName={"wallet"} />
    </View>
  );
}
