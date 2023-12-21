import Color from "color";

export const secondary_candidates = [
  "#00C896",
  "#F6B161",
  "#8685EF",
  "#1BA3B4",
  "#FFA51A",
  "#FF1A56",
  "#BE15A8",
];

const primary = "#151421"; // "#0F0F0F";

const secondary = "#008CFF";

export const randColor = () =>
  secondary_candidates[Math.floor(Math.random() * secondary_candidates.length)];

const ternary = "#8685EF";

export default {
  primary: primary,
  primary_light: Color(primary).lighten(0.25).string(),
  primary_lighter: Color(primary).lighten(0.5).string(),

  primary_dark: Color(primary).darken(0.25).hex(),
  primary_darker: Color(primary).darken(0.5).hex(),

  secondary: secondary,
  secondary_light_1: Color(secondary).lighten(0.25).string(),
  secondary_light_2: Color(secondary).lighten(0.5).string(),

  ternary: ternary,
  ternary_light_1: Color(ternary).lighten(0.25).string(),
  ternary_light_2: Color(ternary).lighten(0.5).string(),

  error: "#f44336",
  warning: "orange",

  text_light: "#FAF8FF",
  text_dark: "gray",
};

export const Sizing = {
  heading: 30,
  subHead: 22.5,
  text: 18,
  tooltip: 14,
};
