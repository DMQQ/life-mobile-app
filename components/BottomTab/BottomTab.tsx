import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { StyleSheet, Text, View } from "react-native";
import Layout from "../../constants/Layout";
import Colors from "../../constants/Colors";
import Ripple from "react-native-material-ripple";
import { Ionicons } from "@expo/vector-icons";
import useKeyboard from "../../utils/hooks/useKeyboard";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";

const styles = StyleSheet.create({
  container: {
    width: Layout.screen.width,
    backgroundColor: Colors.primary_dark,
    justifyContent: "space-around",
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: Colors.primary_light,
  },

  button: {
    flex: 1,
    padding: 12.5,
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
        color={activeRoute === props.route ? Colors.secondary_light_2 : "#fff"}
      />
    </Ripple>
  );

  const keyboard = useKeyboard();

  const isOpenSubScreen = (state.routes[state.index].state?.index || 0) > 0;

  if (isOpenSubScreen || keyboard) return null;

  return (
    <Animated.View
      style={[styles.container, { paddingBottom: 5 }]}
      entering={FadeInDown}
      exiting={FadeOutDown}
    >
      <Btn route="TimelineScreens" iconName={"calendar"} />

      <Btn route="NotesScreens" iconName={"clipboard"} />

      <Btn route="Root" iconName={"home"} />

      <Btn route="WorkoutScreens" iconName={"barbell"} />

      <Btn route="WalletScreens" iconName={"wallet"} />
    </Animated.View>
  );
}
