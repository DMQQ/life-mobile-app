import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Platform, StyleSheet } from "react-native";
import Layout from "../../constants/Layout";
import Colors from "../../constants/Colors";
import Ripple from "react-native-material-ripple";
import { Ionicons } from "@expo/vector-icons";
import useKeyboard from "../../utils/hooks/useKeyboard";
import Animated from "react-native-reanimated";
import { useTheme } from "../../utils/context/ThemeContext";
import { Padding } from "@/constants/Values";
import lowOpacity from "@/utils/functions/lowOpacity";

const styles = StyleSheet.create({
  container: {
    width: Layout.screen.width,
    backgroundColor: Colors.primary_dark,
    justifyContent: "space-around",
    flexDirection: "row",
  },

  button: {
    padding: 5,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
  },
});

export default function BottomTab({ navigation, state, insets }: BottomTabBarProps) {
  const navigate = (route: string) => navigation.navigate(route);

  const activeRoute = state.routes[state.index].name;

  const { theme } = useTheme();

  const Btn = (props: { route: string; iconName: any; label: string }) => (
    <Ripple
      rippleCentered
      rippleColor={theme.colors.secondary}
      style={[
        styles.button,
        {
          width: Layout.screen.width / state.routes.length,
          backgroundColor: activeRoute === props.route ? lowOpacity(theme.colors.secondary, 0.075) : undefined,
        },
      ]}
      onPress={() => navigate(props.route)}
    >
      <Ionicons
        size={22.5}
        name={props.iconName}
        color={activeRoute === props.route ? Colors.secondary_light_1 : "#fff"}
        style={{ marginBottom: 2.5, paddingVertical: 7.5 }}
      />
    </Ripple>
  );

  const keyboard = useKeyboard();

  const isOpenSubScreen = (state.routes[state.index].state?.index || 0) > 0;

  console.log("isOpenSubScreen", isOpenSubScreen);

  if (isOpenSubScreen || keyboard) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingBottom: Platform.OS === "android" ? Padding.s + insets.bottom : Padding.xxl,
          borderTopColor: Colors.primary_dark,
          borderTopWidth: 1,

          paddingTop: Platform.OS === "android" ? insets.bottom + Padding.s : Padding.s,
        },
      ]}
    >
      <Btn route="NotesScreens" label="Notes" iconName={"clipboard"} />

      <Btn route="WorkoutScreens" label="Training" iconName={"barbell"} />

      <Btn route="Root" label="Home" iconName={"home"} />

      <Btn route="WalletScreens" label="Wallet" iconName={"wallet"} />

      <Btn route="TimelineScreens" label="Timeline" iconName={"calendar"} />
    </Animated.View>
  );
}
