import Color from "color";

export const secondary_candidates = [
  "#00C896",
  "#F6B161",
  "#8685EF",
  "#1BA3B4",
  "#FFA51A",
  "#FF1A56",
  "#BE15A8",
  "#008CFF",
];

const primary = "#0d0f14";

const secondary = secondary_candidates[secondary_candidates.length - 1];

export const randColor = () =>
  secondary_candidates[Math.floor(Math.random() * secondary_candidates.length)];

const ternary = "#7B84FF";

const theme = {
  primary: primary,
  primary_light: Color(primary).lighten(0.25).string(),
  primary_lighter: Color(primary).lighten(0.4).string(),

  primary_dark: Color(primary).darken(0.25).hex(),
  primary_darker: Color(primary).darken(0.5).hex(),

  secondary: secondary,
  secondary_light_1: Color(secondary).lighten(0.25).string(),
  secondary_light_2: Color(secondary).lighten(0.5).string(),

  secondary_dark_1: Color(secondary).darken(0.25).hex(),
  secondary_dark_2: Color(secondary).darken(0.5).hex(),

  ternary: ternary,
  ternary_light_1: Color(ternary).lighten(0.25).string(),
  ternary_light_2: Color(ternary).lighten(0.5).string(),

  error: "#f44336",
  warning: "orange",

  text_light: "#FAF8FF",
  text_dark: "gray",
} as const;

export default theme;

export const Sizing = {
  heading: 30,
  subHead: 22.5,
  text: 18,
  tooltip: 14,
} as const;
