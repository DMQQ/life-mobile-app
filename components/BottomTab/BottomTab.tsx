import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Platform, StyleSheet } from "react-native";
import Layout from "../../constants/Layout";
import Colors from "../../constants/Colors";
import Ripple from "react-native-material-ripple";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import useKeyboard from "../../utils/hooks/useKeyboard";
import Animated, { FadeInDown, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { useTheme } from "../../utils/context/ThemeContext";
import { Padding } from "@/constants/Values";
import moment from "moment";
import BlurSurface from "../ui/BlurSurface";

const styles = StyleSheet.create({
  container: {
    width: Layout.screen.width,
    justifyContent: "space-around",
    flexDirection: "row",
    position: "absolute",
    bottom: 0,
    height: 90,
  },

  button: {
    padding: 5,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
  },

  innerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
});

export default function BottomTab({ navigation, state, insets }: BottomTabBarProps) {
  const navigate = (route: string) => navigation.navigate(route);

  const activeRoute = state.routes[state.index].name;

  const { theme } = useTheme();

  const Btn = (props: { route: string; iconName: any; label: string; onLongPress?: any }) => (
    <Ripple
      onLongPress={props.onLongPress}
      rippleCentered
      rippleColor={theme.colors.secondary}
      style={[
        styles.button,
        {
          width: Layout.screen.width / state.routes.length,
        },
      ]}
      onPress={() => navigate(props.route)}
    >
      {typeof props.iconName === "string" ? (
        <Ionicons
          size={22.5}
          name={props.iconName as any}
          color={activeRoute === props.route ? Colors.secondary : "rgba(255,255,255,0.8)"}
          style={{ marginBottom: 2.5, paddingVertical: 7.5 }}
        />
      ) : (
        props.iconName
      )}
    </Ripple>
  );

  const keyboard = useKeyboard();

  const isOpenSubScreen = (state.routes[state.index].state?.index || 0) > 0;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: isOpenSubScreen || keyboard ? withTiming(100, { duration: 100 }) : withTiming(0),
      },
    ],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]} entering={FadeInDown} exiting={FadeInDown}>
      <BlurSurface
        style={[
          styles.innerContainer,
          {
            paddingBottom: Platform.OS === "android" ? Padding.s + insets.bottom : Padding.xxl,
            paddingTop: Platform.OS === "android" ? insets.bottom + Padding.s : Padding.s,
          },
        ]}
      >
        <Btn
          route="NotesScreens"
          label="Notes"
          iconName={
            <MaterialCommunityIcons
              name="cards"
              size={22.5}
              color={activeRoute === "NotesScreens" ? Colors.secondary : "rgba(255,255,255,0.8)"}
            />
          }
        />

        <Btn
          route="GoalsScreens"
          label="Training"
          iconName={
            <Feather
              name="target"
              size={22.5}
              color={activeRoute === "GoalsScreens" ? Colors.secondary : "rgba(255,255,255,0.8)"}
              style={{ marginBottom: 2.5, paddingVertical: 7.5 }}
            />
          }
        />

        <Btn route="Root" label="Home" iconName={"home"} />

        <Btn
          onLongPress={() => {
            navigation.navigate({
              name: "WalletScreens",
              params: {
                expenseId: null,
              },
            });
          }}
          route="WalletScreens"
          label="Wallet"
          iconName={"wallet"}
        />

        <Btn
          onLongPress={() => {
            navigation.navigate({
              name: "TimelineScreens",
              params: {
                selectedDate: moment(new Date()).format("YYYY-MM-DD"),
              },
            });
          }}
          route="TimelineScreens"
          label="Timeline"
          iconName={"calendar-number"}
        />
      </BlurSurface>
    </Animated.View>
  );
}
