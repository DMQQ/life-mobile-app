import lowOpacity from "@/utils/functions/lowOpacity";
import Colors from "../../../constants/Colors";
import { StyleSheet, ViewStyle } from "react-native";
export const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    borderRadius: 5,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 16,
    textTransform: "uppercase",
  },
});

export const VARIANTS = {
  // primary: "#FF0056", // #8408D4
  primary: Colors.secondary,

  secondary: Colors.primary,
  ternary: Colors.secondary,
  disabled: "#131d33",
  text: "transparent",
};

type Return = ViewStyle;

export const BUTTON_TYPES = {
  flat: (backgroundColor: string): Return => ({ backgroundColor }),
  contained: (backgroundColor: string): Return => ({
    backgroundColor,
    shadowColor: lowOpacity(backgroundColor, 0.5),
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.7,
    shadowRadius: 16.0,

    elevation: 24,
  }),
  outlined: (mainColor: string): Return => ({
    borderWidth: 2,
    borderColor: mainColor,
  }),
  text: (): Return => ({}),
};

export const BUTTON_BORDER_RADIUS = {
  no: 0,
  sm: 5,
  md: 10,
  lg: 15,
  full: 100,
};

export const BUTTON_SIZE = {
  xs: {
    padding: 2.5,
  },
  sm: {
    padding: 5,
  },
  md: {
    padding: 10,
  },
  lg: {
    padding: 15,
  },
  xl: {
    padding: 20,
  },
};
