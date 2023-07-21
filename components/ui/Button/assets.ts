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
    fontSize: 20,
    textTransform: "uppercase",
  },
});

export const VARIANTS = {
  // primary: "#FF0056",
  primary: "#8408D4",

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
    shadowColor: "#000",
    shadowOffset: {
      width: 5,
      height: 20,
    },
    shadowOpacity: 1,
    shadowRadius: 20.0,
    // elevation: 30,
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
  md: 8,
  lg: 10,
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
  xl: {
    padding: 15,
  },
};
