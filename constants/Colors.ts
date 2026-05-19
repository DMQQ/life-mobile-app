import Color from "color"

import { getItem } from "expo-secure-store"

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
]

// Base colors (set by preset themes, used as derivation source for variants)
const base_primary = getItem("color_scheme_primary") ?? "#0d0f14"
const base_secondary = getItem("color_scheme_secondary") ?? secondary_candidates[secondary_candidates.length - 1]
const base_foreground = getItem("color_scheme_foreground") ?? "#FFFFFF"
const base_ternary = getItem("color_scheme_ternary") ?? "#7B84FF"

export const randColor = () => secondary_candidates[Math.floor(Math.random() * secondary_candidates.length)]

const theme = {
    // ── Primary palette ──
    primary: getItem("theme_primary") ?? base_primary,
    primary_light: getItem("theme_primary_light") ?? Color(base_primary).lighten(0.25).string(),
    primary_lighter: getItem("theme_primary_lighter") ?? Color(base_primary).lighten(0.4).string(),
    primary_surface: getItem("theme_primary_surface") ?? Color(base_primary).lighten(0.3).string(),
    primary_lightest: getItem("theme_primary_lightest") ?? Color(base_primary).lighten(0.5).string(),
    primary_faded: getItem("theme_primary_faded") ?? Color(base_primary).lighten(0.8).string(),
    primary_dark: getItem("theme_primary_dark") ?? Color(base_primary).darken(0.25).hex(),
    primary_darker: getItem("theme_primary_darker") ?? Color(base_primary).darken(0.5).hex(),

    // ── Secondary palette ──
    secondary: getItem("theme_secondary") ?? base_secondary,
    secondary_light_1: getItem("theme_secondary_light_1") ?? Color(base_secondary).lighten(0.25).string(),
    secondary_light_2: getItem("theme_secondary_light_2") ?? Color(base_secondary).lighten(0.5).string(),
    secondary_dark_1: getItem("theme_secondary_dark_1") ?? Color(base_secondary).darken(0.25).hex(),
    secondary_dark_2: getItem("theme_secondary_dark_2") ?? Color(base_secondary).darken(0.5).hex(),

    // ── Ternary ──
    ternary: getItem("theme_ternary") ?? base_ternary,
    ternary_light_1: getItem("theme_ternary_light_1") ?? Color(base_ternary).lighten(0.25).string(),
    ternary_light_2: getItem("theme_ternary_light_2") ?? Color(base_ternary).lighten(0.5).string(),

    // ── Status & semantic ──
    error: getItem("theme_error") ?? "#f44336",
    warning: getItem("theme_warning") ?? "orange",
    warning_amber: getItem("theme_warning_amber") ?? "#FFC107",
    success: getItem("theme_success") ?? "#34C759",
    danger: getItem("theme_danger") ?? "#FF3B30",
    info: getItem("theme_info") ?? "#007AFF",
    expired: getItem("theme_expired") ?? "#BA4343",

    // ── Financial indicators ──
    positive: getItem("theme_positive") ?? "#66E875",
    negative: getItem("theme_negative") ?? "#F07070",
    chart_positive: getItem("theme_chart_positive") ?? "#4ECDC4",
    chart_negative: getItem("theme_chart_negative") ?? "#FF8A80",

    // ── Text ──
    text_light: getItem("theme_text_light") ?? "#FAF8FF",
    text_dark: getItem("theme_text_dark") ?? "gray",

    // ── Foreground ──
    foreground: getItem("theme_foreground") ?? base_foreground,
    foreground_secondary: getItem("theme_foreground_secondary") ?? Color(base_foreground).alpha(0.7).string(),
    foreground_muted: getItem("theme_foreground_muted") ?? Color(base_foreground).alpha(0.6).string(),
    foreground_disabled: getItem("theme_foreground_disabled") ?? Color(base_foreground).alpha(0.4).string(),
    foreground_placeholder: getItem("theme_foreground_placeholder") ?? Color(base_foreground).alpha(0.3).string(),
    foreground_hairline: getItem("theme_foreground_hairline") ?? Color(base_foreground).alpha(0.08).string(),

    // ── Overlays ──
    overlay: getItem("theme_overlay") ?? "rgba(0,0,0,0.5)",
    overlay_heavy: getItem("theme_overlay_heavy") ?? "rgba(0,0,0,0.75)",
    overlay_light: getItem("theme_overlay_light") ?? "rgba(0,0,0,0.2)",

    // ── Borders ──
    borderColor: getItem("theme_borderColor") ?? Color(Color(base_primary).lighten(0.4).string()).lighten(0.5).hex(),
} as const

export const defaultColors = {
    primary: "#0d0f14",
    secondary: secondary_candidates[secondary_candidates.length - 1],
    foreground: "#fff",
    ternary: base_ternary,
}

export default theme

export const Sizing = {
    heading: 30,
    subHead: 22.5,
    text: 18,
    tooltip: 14,
} as const

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
}

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
}

const darkPrimaryOptions = [
    "#0d0f14", // original
    "#101217", // slightly cooler tone
    "#12141A", // darker steel
    "#0C0E13", // blackened blue-grey
    "#111418", // slate black
    "#161A1F", // modern dark neutral
    "#1A1D24", // charcoal steel
    "#0B0D11", // near-black bluish
    "#1C1C1E", // iOS dark
    "#0F0F0F", // pure dark
    "#1A1A1A", // neutral dark
    "#171717", // tailwind neutral-900
    "#0A0A0A", // deep black
    "#141414", // github dark
    "#1E1E1E", // vscode dark
    "#0D1117", // github dark bg
    "#13151A", // discord dark
    "#18181B", // zinc-900
    "#09090B", // zinc-950
    "#020617", // slate-950
]

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
        "#F97316", // orange-500
        "#EF4444", // red-500
        "#10B981", // emerald-500
        "#3B82F6", // blue-500
        "#8B5CF6", // violet-500
        "#F59E0B", // amber-500
        "#EC4899", // pink-500
        "#6366F1", // indigo-500
        "#06B6D4", // cyan-500
        "#84CC16", // lime-500
        "#64748B", // slate-500
        "#6B7280", // gray-500
        "#71717A", // zinc-500
        "#737373", // neutral-500
        "#78716C", // stone-500
        "#374151", // gray-700
        "#27272A", // zinc-800
        "#1F2937", // gray-800
        "#DC2626", // red-600
        "#2563EB", // blue-600
        "#7C3AED", // violet-600
        "#059669", // emerald-600
        "#D97706", // amber-600
        "#DB2777", // pink-600
        "#4338CA", // indigo-600
        "#0891B2", // cyan-600
        "#65A30D", // lime-600
        "#475569", // slate-600
        "#4B5563", // gray-600
        "#52525B", // zinc-600
        "#525252", // neutral-600
        "#57534E", // stone-600
    ]),
]

export const CustomThemeOptions = {
    primary: darkPrimaryOptions,
    secondary: secondaryCandidates,
}
