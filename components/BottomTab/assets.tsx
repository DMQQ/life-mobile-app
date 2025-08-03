import * as Icons from "@expo/vector-icons";
import Colors from "@/constants/Colors";

interface RouteProp {
  name: string;
  icon: (isFocused: boolean) => React.ReactNode;
}

interface Routes {
  [key: string]: RouteProp;
}

const ICON_SIZE = 28;

export const routes = {
  Root: {
    name: "Root",
    icon: (isFocused) => (
      <Icons.Ionicons
        name="home"
        size={ICON_SIZE}
        color={isFocused ? Colors.secondary : Colors.foreground}
      />
    ),
  },
  Timeline: {
    name: "",
    icon: (isFocused) => (
      <Icons.Ionicons
        name="calendar"
        size={ICON_SIZE}
        color={isFocused ? Colors.secondary : Colors.foreground}
      />
    ),
  },
  Workout: {
    name: "Workout",
    icon: (isFocused) => (
      <Icons.Ionicons
        name="body"
        size={ICON_SIZE}
        color={isFocused ? Colors.secondary : Colors.foreground}
      />
    ),
  },
  Settings: {
    name: "Settings",
    icon: (isFocused) => (
      <Icons.Ionicons
        name="settings"
        size={ICON_SIZE}
        color={isFocused ? Colors.secondary : Colors.foreground}
      />
    ),
  },
} as Routes;
