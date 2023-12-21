import { Dimensions } from "react-native";

const window = Dimensions.get("window");

const screen = Dimensions.get("screen");

const spacingTypes = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const Padding = {
  xs: 2.5,
  sm: 5,
  md: 7.5,
  lg: 10,
  xl: 15,
  xxl: 20,
};

export const Rounded = {
  xs: 5,
  sm: 7.5,
  md: 10,
  lg: 10,
  xl: 15,
  xxl: 20,
};

export default {
  window,
  screen,

  spacing: (s: keyof typeof spacingTypes) => spacingTypes[s],

  padding: 10,

  isSmallDevice: screen.width < 375,
};
