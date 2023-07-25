import Color from "color";

export default {
  primary: "#0F0F0F",
  primary_light: Color("#0F0F0F").lighten(0.1).string(),
  primary_lighter: Color("#0F0F0F").lighten(0.2).string(),
  // secondary: "#00A97F",
  // secondary: "#00C896",
  secondary: "#00C896",
  secondary_light_1: Color("#00C896").lighten(0.1).string(),
  secondary_light_2: Color("#00C896").lighten(0.2).string(),

  ternary: "#8685EF",
  ternary_light_1: Color("#8685EF").lighten(0.1).string(),
  ternary_light_2: Color("#8685EF").lighten(0.2).string(),

  error: "#f44336",
  warning: "orange",

  text_light: "#FAF8FF",
  text_dark: "gray",
};
