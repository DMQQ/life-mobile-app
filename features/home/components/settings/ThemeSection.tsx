import Button from "@/components/ui/Button/Button"
import GroupSelector from "@/components/ui/GroupSelector"
import Colors, { defaultColors } from "@/constants/Colors"
import Layout from "@/constants/Layout"
import { Feather } from "@expo/vector-icons"
import Color from "color"
import { ColorPicker as NativeColorPicker, Host } from "@expo/ui/swift-ui"
import { reloadAppAsync } from "expo"
import * as SecureStore from "expo-secure-store"
import React, { useState } from "react"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import Feedback from "react-native-haptic-feedback"
import Ripple from "react-native-material-ripple"
import Text from "@/components/ui/Text/Text"

interface ColorPalette {
    name: string
    primary: string
    secondary: string
    ternary: string
    foreground: string
    category: string
    primary_light?: string
    primary_lighter?: string
    primary_surface?: string
    primary_lightest?: string
    primary_faded?: string
    primary_dark?: string
    primary_darker?: string
    secondary_light_1?: string
    secondary_light_2?: string
    secondary_dark_1?: string
    secondary_dark_2?: string
    warning?: string
    success?: string
    danger?: string
    info?: string
    positive?: string
    negative?: string
    chart_positive?: string
    text_light?: string
    text_dark?: string
    overlay?: string
    foreground_secondary?: string
    foreground_disabled?: string
    foreground_hairline?: string
    ternary_light_1?: string
    ternary_light_2?: string
    borderColor?: string
}

const colorPalettes: ColorPalette[] = [
    {
        name: "Deep dark",
        primary: "#000",
        secondary: defaultColors.secondary,
        ternary: "#333",
        foreground: "#fff",
        category: "Finance",
    },
    {
        name: "24.12.2025",
        primary: "#111111",
        secondary: "#334af1",
        ternary: "#f13c3c",
        foreground: "#f5f5f5",
        category: "Finance",
    },
    {
        name: "Default",
        primary: defaultColors.primary,
        secondary: defaultColors.secondary,
        ternary: defaultColors.ternary,
        foreground: defaultColors.foreground,
        category: "Finance",
    },
    {
        name: "DMQ dark",
        primary: "#111111",
        secondary: "#00a97f",
        ternary: "#8685ef",
        foreground: "#faf8ff",
        category: "Finance",
    },
    {
        name: "DMQ2 dark",
        primary: "#00001E",
        secondary: "#7985ff",
        ternary: "#128583",
        foreground: "#faf8ff",
        category: "Finance",
    },
    {
        name: "Charcoal Mint",
        primary: "#0D1B1E",
        secondary: "#00FFB3",
        ternary: "#F7C948",
        foreground: "#E6FFF9",
        category: "Finance",
    },
    {
        name: "Noir Emerald",
        primary: "#101415",
        secondary: "#50FA7B",
        ternary: "#FF79C6",
        foreground: "#F8FFF8",
        category: "Finance",
    },
    {
        name: "Graphite Mint",
        primary: "#1A1C1D",
        secondary: "#A3FFD6",
        ternary: "#FFD580",
        foreground: "#F1FFF8",
        category: "Finance",
    },
    {
        name: "Velvet Night",
        primary: "#140D1C",
        secondary: "#C084FC",
        ternary: "#FFD6A5",
        foreground: "#FAF5FF",
        category: "Finance",
    },
    {
        name: "Deep Jade",
        primary: "#0E1A17",
        secondary: "#00DFA2",
        ternary: "#FF9B85",
        foreground: "#E6FFF6",
        category: "Finance",
    },
    {
        name: "Midnight Raven",
        primary: "#08090A",
        secondary: "#FF4C61",
        ternary: "#3DDC97",
        foreground: "#E1E1E1",
        category: "Finance",
    },
    {
        name: "Abyssal Blue",
        primary: "#001526",
        secondary: "#005F8A",
        ternary: "#00B4EF",
        foreground: "#E8F9FD",
        category: "Finance",
    },
    {
        name: "Neptune Depths",
        primary: "#001F3F",
        secondary: "#0074D9",
        ternary: "#7FDBFF",
        foreground: "#ECF7FF",
        category: "Finance",
    },
    {
        name: "Ash Slate",
        primary: "#000000",
        secondary: "#3B82F6",
        ternary: "#818CF8",
        foreground: "#F4F4F5",
        category: "Finance",
        primary_light: "#0F0F18",
        primary_lighter: "#161622",
        primary_surface: "#13131E",
        primary_lightest: "#1C1C2C",
        primary_faded: "#24243A",
        primary_dark: "#000000",
        primary_darker: "#000000",
        secondary_light_1: "#60A5FA",
        secondary_light_2: "#93C5FD",
        secondary_dark_1: "#2563EB",
        secondary_dark_2: "#1D4ED8",
        warning: "#F59E0B",
        success: "#34D399",
        danger: "#F87171",
        info: "#60A5FA",
        positive: "#34D399",
        negative: "#F87171",
        chart_positive: "#6EE7B7",
        text_light: "#FFFFFF",
        text_dark: "#71717A",
        overlay: "rgba(0,0,0,0.5)",
        foreground_secondary: "rgba(244,244,245,0.7)",
        foreground_disabled: "rgba(244,244,245,0.4)",
        foreground_hairline: "rgba(244,244,245,0.08)",
        ternary_light_1: "#A5B4FC",
        ternary_light_2: "#C7D2FE",
        borderColor: "#1A1A2A",
    },
]

type ColorGroup =
    | "core"
    | "primary"
    | "secondary"
    | "status"
    | "financial"
    | "text"
    | "foreground"
    | "overlay"
    | "ternary"
    | "border"

interface ColorConfig {
    key: string
    label: string
    sub: string
    group?: ColorGroup
}

const ALL_COLORS: ColorConfig[] = [
    { key: "primary", label: "Background", sub: "Main screen background", group: "core" },
    { key: "secondary", label: "Accent", sub: "Buttons, CTAs, highlights", group: "core" },
    { key: "ternary", label: "Ternary", sub: "Supplementary accent", group: "core" },
    { key: "foreground", label: "Text", sub: "Primary text color", group: "core" },

    { key: "primary_light", label: "Light", sub: "Cards, inputs (+25%)", group: "primary" },
    { key: "primary_lighter", label: "Lighter", sub: "Inner containers (+40%)", group: "primary" },
    { key: "primary_surface", label: "Surface", sub: "Chart items (+30%)", group: "primary" },
    { key: "primary_lightest", label: "Lightest", sub: "Chart containers (+50%)", group: "primary" },
    { key: "primary_faded", label: "Faded", sub: "Elevated surfaces (+80%)", group: "primary" },
    { key: "primary_dark", label: "Dark", sub: "Headers (-25%)", group: "primary" },
    { key: "primary_darker", label: "Darker", sub: "Calendar bg (-50%)", group: "primary" },

    { key: "secondary_light_1", label: "Light", sub: "Subtle accents (+25%)", group: "secondary" },
    { key: "secondary_light_2", label: "Lighter", sub: "Dimmed accents (+50%)", group: "secondary" },
    { key: "secondary_dark_1", label: "Dark", sub: "Event backgrounds (-25%)", group: "secondary" },
    { key: "secondary_dark_2", label: "Darker", sub: "Deep shadows (-50%)", group: "secondary" },

    { key: "warning", label: "Warning", sub: "Warning color", group: "status" },
    { key: "success", label: "Success", sub: "Success states", group: "status" },
    { key: "danger", label: "Danger", sub: "Destructive actions", group: "status" },
    { key: "info", label: "Info", sub: "Info indicators", group: "status" },

    { key: "positive", label: "Positive", sub: "Income amount", group: "financial" },
    { key: "negative", label: "Negative", sub: "Expense amount", group: "financial" },
    { key: "chart_positive", label: "Chart Pos", sub: "Chart positive", group: "financial" },

    { key: "text_light", label: "Text Light", sub: "High-contrast text", group: "text" },
    { key: "text_dark", label: "Text Dark", sub: "Placeholder text", group: "text" },

    { key: "overlay", label: "Overlay", sub: "Modal scrim (50%)", group: "overlay" },

    { key: "foreground_secondary", label: "Fg Secondary", sub: "Body text (70%)", group: "foreground" },
    { key: "foreground_disabled", label: "Fg Disabled", sub: "Disabled text (40%)", group: "foreground" },
    { key: "foreground_hairline", label: "Fg Hairline", sub: "Separators (8%)", group: "foreground" },

    { key: "ternary_light_1", label: "Ternary Light", sub: "Light ternary (+25%)", group: "ternary" },
    { key: "ternary_light_2", label: "Ternary Lighter", sub: "Lighter ternary (+50%)", group: "ternary" },

    { key: "borderColor", label: "Border", sub: "Card borders", group: "border" },
]

const GROUPS: { key: ColorGroup; label: string }[] = [
    { key: "core", label: "Core" },
    { key: "primary", label: "Primary Variants" },
    { key: "secondary", label: "Secondary Variants" },
    { key: "status", label: "Status" },
    { key: "financial", label: "Financial" },
    { key: "text", label: "Text" },
    { key: "foreground", label: "Foreground Alpha" },
    { key: "overlay", label: "Overlays" },
    { key: "ternary", label: "Ternary" },
    { key: "border", label: "Border" },
]

const CARD_WIDTH = (Layout.screen.width - 32 - 10) / 2

function CollapsibleSection({
    label,
    count,
    expanded,
    onToggle,
    children,
}: {
    label: string
    count: number
    expanded: boolean
    onToggle: () => void
    children: React.ReactNode
}) {
    return (
        <View>
            <TouchableOpacity onPress={onToggle} style={ts.groupHeader} activeOpacity={0.7}>
                <Feather name={expanded ? "chevron-down" : "chevron-right"} size={14} color={Colors.foreground_secondary} />
                <Text style={ts.groupLabel}>{label}</Text>
                <View style={ts.groupBadge}>
                    <Text style={ts.groupBadgeText}>{count}</Text>
                </View>
            </TouchableOpacity>
            {expanded && children}
        </View>
    )
}

function ColorRow({
    color,
    label,
    sub,
    border,
    onChange,
}: {
    color: string
    label: string
    sub: string
    border: boolean
    onChange: (c: string) => void
}) {
    return (
        <View style={[ts.colorRow, border && ts.colorRowBorder]}>
            <View style={[ts.colorSwatch, { backgroundColor: color }]} />
            <View style={{ flex: 1 }}>
                <Text style={ts.colorLabel}>{label}</Text>
                <Text style={ts.colorSub}>{sub}</Text>
            </View>
            <Host matchContents>
                <NativeColorPicker selection={color} onSelectionChange={onChange} supportsOpacity={false} />
            </Host>
        </View>
    )
}

export default function ThemeSection() {
    const [mode, setMode] = useState<"presets" | "custom">("presets")
    const [selectedPalette, setSelectedPalette] = useState<ColorPalette | null>(null)
    const [customColors, setCustomColors] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {}
        ALL_COLORS.forEach((cfg) => {
            initial[cfg.key] = (Colors as any)[cfg.key] ?? ""
        })
        return initial
    })
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
        primary: false,
        secondary: false,
    })

    const toggleGroup = (group: string) => setExpandedGroups((prev) => ({ ...prev, [group]: !prev[group] }))

    const preview =
        mode === "custom"
            ? customColors
            : (selectedPalette ?? {
                  primary: Colors.primary,
                  secondary: Colors.secondary,
                  ternary: Colors.ternary,
                  foreground: Colors.foreground,
              })

    const applyTheme = async (palette: ColorPalette) => {
        await SecureStore.setItemAsync("color_scheme_primary", palette.primary)
        await SecureStore.setItemAsync("color_scheme_secondary", palette.secondary)
        await SecureStore.setItemAsync("color_scheme_ternary", palette.ternary)
        await SecureStore.setItemAsync("color_scheme_foreground", palette.foreground)
        await Promise.all(
            ALL_COLORS.map((cfg) => {
                const val = (palette as any)[cfg.key]
                return val
                    ? SecureStore.setItemAsync(`theme_${cfg.key}`, val)
                    : SecureStore.deleteItemAsync(`theme_${cfg.key}`).catch(() => {})
            }),
        )
        await reloadAppAsync()
    }

    const applyCustom = async () => {
        const saves = ALL_COLORS.map((cfg) => SecureStore.setItemAsync(`theme_${cfg.key}`, customColors[cfg.key]))
        await Promise.all(saves)
        await reloadAppAsync()
    }

    const handleApply = async () => {
        Feedback.trigger("impactMedium")
        if (mode === "presets" && selectedPalette) {
            await applyTheme(selectedPalette)
        } else if (mode === "custom") {
            await applyCustom()
        }
    }

    const canApply = mode === "custom" || selectedPalette !== null

    return (
        <View style={ts.root}>
            <View style={ts.toggle}>
                <GroupSelector
                    value={mode}
                    onChange={(m) => setMode(m as "presets" | "custom")}
                    options={[
                        { label: "Presets", value: "presets" },
                        { label: "Custom", value: "custom" },
                    ]}
                />
            </View>

            <View style={[ts.preview, { backgroundColor: preview.primary }]}>
                <View style={{ flex: 1 }}>
                    <Text style={[ts.previewTitle, { color: preview.foreground }]}>
                        {mode === "custom" ? "Custom" : selectedPalette?.name ?? "Select a palette"}
                    </Text>
                    <Text style={[ts.previewSub, { color: Color(preview.foreground).alpha(0.5).string() }]}>
                        {preview.primary}
                    </Text>
                </View>
                <View style={ts.previewSwatches}>
                    {[preview.secondary, preview.ternary, preview.foreground].map((c, i) => (
                        <View key={i} style={[ts.previewSwatch, { backgroundColor: c }]} />
                    ))}
                </View>
            </View>

            {mode === "presets" ? (
                <View style={ts.grid}>
                    {colorPalettes.map((palette) => {
                        const selected = selectedPalette?.name === palette.name
                        return (
                            <Ripple
                                key={palette.name}
                                onPress={() => {
                                    Feedback.trigger("selection")
                                    setSelectedPalette(palette)
                                }}
                                style={[ts.card, { backgroundColor: palette.primary }, selected && ts.cardSelected]}
                            >
                                <View style={ts.cardInner}>
                                    <View style={ts.cardTop}>
                                        <Text style={ts.cardName} numberOfLines={2}>
                                            {palette.name}
                                        </Text>
                                        {selected && <Feather name="check-circle" size={13} color={palette.secondary} />}
                                    </View>
                                    <View style={ts.cardSwatches}>
                                        {[palette.secondary, palette.ternary, palette.foreground].map((c, i) => (
                                            <View key={i} style={[ts.cardSwatch, { backgroundColor: c }]} />
                                        ))}
                                    </View>
                                </View>
                            </Ripple>
                        )
                    })}
                </View>
            ) : (
                <View style={ts.colorRows}>
                    {GROUPS.map((group) => {
                        const items = ALL_COLORS.filter((c) => c.group === group.key)
                        if (items.length === 0) return null

                        if (group.key === "primary") {
                            return (
                                <CollapsibleSection
                                    key={group.key}
                                    label={group.label}
                                    count={items.length}
                                    expanded={expandedGroups.primary}
                                    onToggle={() => toggleGroup("primary")}
                                >
                                    {items.map((cfg) => (
                                        <ColorRow
                                            key={cfg.key}
                                            color={customColors[cfg.key]}
                                            label={cfg.label}
                                            sub={cfg.sub}
                                            border
                                            onChange={(c) => setCustomColors((p) => ({ ...p, [cfg.key]: c }))}
                                        />
                                    ))}
                                </CollapsibleSection>
                            )
                        }

                        return (
                            <View key={group.key}>
                                <View style={ts.colorSectionLabel}>
                                    <Text style={ts.colorSectionLabelText}>{group.label}</Text>
                                </View>
                                {items.map((cfg, i) => (
                                    <ColorRow
                                        key={cfg.key}
                                        color={customColors[cfg.key]}
                                        label={cfg.label}
                                        sub={cfg.sub}
                                        border={i < items.length - 1}
                                        onChange={(c) => setCustomColors((p) => ({ ...p, [cfg.key]: c }))}
                                    />
                                ))}
                            </View>
                        )
                    })}
                </View>
            )}

            <Button onPress={handleApply} disabled={!canApply} style={ts.applyBtn}>
                Apply Theme
            </Button>
        </View>
    )
}

const ts = StyleSheet.create({
    root: { gap: 14 },

    toggle: {},
    toggleBtn: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: "center" },
    toggleBtnActive: { backgroundColor: Color(Colors.primary).lighten(0.6).string() },
    toggleLabel: { color: Colors.text_dark, fontSize: 14, fontWeight: "500" },
    toggleLabelActive: { color: Colors.text_light, fontWeight: "600" },

    preview: {
        borderRadius: 18,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        minHeight: 72,
    },
    previewTitle: { fontSize: 15, fontWeight: "600", marginBottom: 2 },
    previewSub: { fontSize: 11 },
    previewSwatches: { flexDirection: "row", gap: 7 },
    previewSwatch: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: "rgba(255,255,255,0.18)",
    },

    grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    card: {
        width: CARD_WIDTH,
        borderRadius: 18,
        overflow: "hidden",
        borderWidth: 2,
        borderColor: "transparent",
    },
    cardSelected: { borderColor: Colors.secondary },
    cardInner: { padding: 12, height: 86, justifyContent: "space-between" },
    cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
    cardName: { color: "#fff", fontSize: 12, fontWeight: "600", flex: 1, marginRight: 4 },
    cardSwatches: { flexDirection: "row", gap: 5 },
    cardSwatch: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.22)",
    },

    colorRows: {
        backgroundColor: Colors.primary_light,
        borderRadius: 18,
        overflow: "hidden",
    },
    colorRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 14,
    },
    colorRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(255,255,255,0.08)" },
    colorSwatch: {
        width: 38,
        height: 38,
        borderRadius: 19,
        borderWidth: 1.5,
        borderColor: "rgba(255,255,255,0.12)",
    },
    colorLabel: { color: Colors.text_light, fontSize: 15, fontWeight: "500" },
    colorSub: { color: Colors.foreground_secondary, fontSize: 12, marginTop: 1 },

    groupHeader: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.foreground_hairline,
    },
    groupLabel: { color: Colors.foreground_secondary, fontSize: 13, fontWeight: "600", flex: 1 },
    groupBadge: {
        backgroundColor: Colors.foreground_hairline,
        borderRadius: 8,
        paddingHorizontal: 7,
        paddingVertical: 2,
    },
    groupBadgeText: { color: Colors.foreground_secondary, fontSize: 11, fontWeight: "600" },
    groupDivider: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.foreground_hairline, marginVertical: 4 },

    colorSectionLabel: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 4,
    },
    colorSectionLabelText: {
        color: Colors.text_dark,
        fontSize: 11,
        fontWeight: "600",
        letterSpacing: 0.5,
        textTransform: "uppercase",
    },

    applyBtn: { borderRadius: 16 },
})
