import Color from "color";

import { getItem } from "expo-secure-store";

export const secondary_candidates = [
  "#00C896",
  "#F6B161",
  "#8685EF",
  "#1BA3B4",
  "#FFA51A",
  "#FF1A56",
  "#BE15A8",
  "#008CFF",
  "#F9F156",
  "#F95656",
  "#DB56F9",
  "#6056F9",
  "#56E4F9",
  "#34FA85",
  "#34A3FA",
];

const primary = getItem("color_scheme_primary") ?? "#0d0f14";

const secondary = getItem("color_scheme_secondary") ?? secondary_candidates[secondary_candidates.length - 1];

export const randColor = () => secondary_candidates[Math.floor(Math.random() * secondary_candidates.length)];

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

export const calendarTheme = {
  // Background
  calendarBackground: theme.primary_darker,
  backgroundColor: theme.primary_darker,

  // Month header
  monthTextColor: theme.text_light,
  textMonthFontWeight: "bold",
  textMonthFontSize: 16,

  // Day names header (Mon, Tue, etc)
  textSectionTitleColor: theme.secondary_light_1,
  textDayHeaderFontWeight: "600",

  // Date styling (numbers)
  dayTextColor: theme.text_light,
  textDayFontWeight: "400",

  // Today styling
  todayTextColor: theme.secondary,
  todayBackgroundColor: Color(theme.secondary).alpha(0.15).string(),

  // Selected day
  selectedDayBackgroundColor: theme.secondary,
  selectedDayTextColor: theme.text_light,

  // Disabled day
  textDisabledColor: theme.text_dark,

  // Arrows
  arrowColor: theme.secondary,

  // Dot markers
  dotColor: theme.secondary,
  selectedDotColor: theme.text_light,

  // Month navigation buttons
  textDayFontFamily: "System",
  textMonthFontFamily: "System",
  textDayHeaderFontFamily: "System",

  // Additional specific styling
  "stylesheet.calendar.header": {
    header: {
      backgroundColor: theme.primary_dark,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingLeft: 10,
      paddingRight: 10,
      paddingTop: 10,
      paddingBottom: 10,
    },
    arrow: {
      padding: 10,
    },
  },
  "stylesheet.day.basic": {
    base: {
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
    },
    today: {
      borderRadius: 16,
    },
    selected: {
      borderRadius: 16,
    },
  },
};

// Timeline specific theme
const timelineTheme = {
  ...calendarTheme,

  // Timeline specific styles
  backgroundColor: theme.primary_darker,
  calendarBackground: theme.primary_darker,

  // Timeline colors
  timelineContainer: {
    backgroundColor: theme.primary_dark,
  },
  eventBackground: theme.secondary_dark_1,
  eventText: {
    color: theme.text_light,
    fontWeight: "bold",
  },
  eventTitleStyle: {
    color: theme.text_light,
    fontWeight: "bold",
  },
  eventSummaryStyle: {
    color: theme.text_light,
    fontStyle: "italic",
  },
  timeLabel: {
    color: theme.secondary_light_1,
    fontWeight: "600",
  },
  // Time column
  timeColumnBackground: theme.primary_darker,
  timeColumnTextColor: theme.secondary_light_1,
  // Lines
  timeColumnLineColor: theme.primary_light,
  eventContainerBorderColor: theme.primary_light,
};

const darkPrimaryOptions = [
  "#0d0f14", // original
  "#101217", // slightly cooler tone
  "#12141A", // darker steel
  "#0C0E13", // blackened blue-grey
  "#111418", // slate black
  "#161A1F", // modern dark neutral
  "#1A1D24", // charcoal steel
  "#0B0D11", // near-black bluish
];

const secondaryCandidates = [
  ...new Set([
    ...secondary_candidates,
    "#2C2F36", // charcoal grey
    "#4A4E57", // medium slate
    "#6C6F76", // desaturated silver-grey
    "#00B2FF", // soft neon blue
    "#00FFA3", // mint green
    "#C2E7FF", // frosty blue
    "#8899AA", // cool dusty blue
    "#8685EF", // cyber violet
    "#999999", // plain light grey
    "#C0C0C0", // soft metallic
  ]),
];

export const CustomThemeOptions = {
  primary: darkPrimaryOptions,
  secondary: secondaryCandidates,
};
