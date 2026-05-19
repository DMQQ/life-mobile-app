import { ModalHeader } from "@/components"
import Button from "@/components/ui/Button/Button"
import Text from "@/components/ui/Text/Text"
import Colors, { defaultColors } from "@/constants/Colors"
import Layout from "@/constants/Layout"
import useUser from "@/utils/hooks/useUser"
import { useExpoUpdates } from "@/utils/hooks/useExpoUpdate"
import { Feather } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { reloadAppAsync } from "expo"
import * as SecureStore from "expo-secure-store"
import React, { useEffect, useState } from "react"
import { ScrollView, StyleSheet, Switch, TouchableOpacity, View } from "react-native"
import Feedback from "react-native-haptic-feedback"
import Ripple from "react-native-material-ripple"
import * as ExpoAppleWatch from "@/modules/expo-apple-watch"
import { ColorPicker as NativeColorPicker, Host } from "@expo/ui/swift-ui"
import { gql, useMutation, useQuery } from "@apollo/client"
import Color from "color"
import { NOTIFICATION_TYPES } from "./EnabledNotifications"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import GroupSelector from "@/components/ui/GroupSelector"

interface ColorPalette {
    name: string
    primary: string
    secondary: string
    ternary: string
    foreground: string
    category: string
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
]

const GET_NOTIFICATION_SETTINGS = gql`
    query GetNotificationSettings {
        getNotificationSettings {
            id
            isEnable
            enabledNotifications
        }
    }
`

const GET_AVAILABLE_NOTIFICATION_TYPES = gql`
    query GetAvailableNotificationTypes {
        getAvailableNotificationTypes {
            key
            title
            description
            category
            schedule
        }
    }
`

const TOGGLE_ENABLED_NOTIFICATIONS = gql`
    mutation ToggleEnabledNotifications($input: JSON!) {
        toggleEnabledNotifications(input: $input) {
            id
            isEnable
            enabledNotifications
        }
    }
`

const CARD_BG = Color(Colors.primary).lighten(0.4).string()
const SEPARATOR = "rgba(255,255,255,0.08)"
const ICON_SIZE = 32

const s = StyleSheet.create({
    container: { flex: 1 },
    inner: { flex: 1 },
    scroll: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 60 },

    profileCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        backgroundColor: CARD_BG,
        borderRadius: 20,
        padding: 16,
        marginBottom: 32,
    },
    avatar: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: Colors.secondary,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: { color: "#fff", fontWeight: "700", fontSize: 24 },
    profileEmail: { color: Colors.text_light, fontWeight: "600" },
    profileSub: { color: Colors.foreground_secondary, marginTop: 2 },

    sectionLabel: {
        color: Colors.text_dark,
        fontSize: 11.5,
        letterSpacing: 0.6,
        textTransform: "uppercase",
        marginBottom: 7,
        marginLeft: 4,
    },
    sectionGap: { marginTop: 30 },

    card: { backgroundColor: CARD_BG, borderRadius: 20, overflow: "hidden" },
    row: {
        flexDirection: "row",
        alignItems: "center",
        minHeight: 50,
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 12,
    },
    rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: SEPARATOR },
    iconBox: {
        width: ICON_SIZE,
        height: ICON_SIZE,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    rowLabel: { flex: 1, color: Colors.text_light },
    rowRight: { flexDirection: "row", alignItems: "center", gap: 8 },
    colorDots: { flexDirection: "row", gap: 4 },
    colorDot: { width: 13, height: 13, borderRadius: 7 },

    subCard: {
        backgroundColor: Colors.primary_light,
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 12,
    },
    toggleRow: {
        flexDirection: "row",
        alignItems: "center",
        minHeight: 46,
        paddingHorizontal: 14,
        paddingVertical: 8,
        gap: 12,
    },
    toggleLabel: { flex: 1, color: Colors.text_light, fontSize: 15 },
    toggleSub: { color: Colors.foreground_secondary, fontSize: 12, marginTop: 1 },
    saveBtn: { marginTop: 4 },

    watchStatus: { color: Colors.foreground_secondary, fontSize: 13 },
    watchStatusOk: { color: Colors.secondary },
    watchActionRow: { flexDirection: "row", alignItems: "center", minHeight: 46, paddingHorizontal: 14, gap: 12 },
    watchActionLabel: { flex: 1, color: Colors.text_light, fontSize: 15 },
})

type SettingSection = "notifications" | "watch" | "theme"

type SettingsParamList = {
    SettingsIndex: undefined
    SettingsDetail: { section: SettingSection; title: string }
}

type SP<T extends keyof SettingsParamList> = NativeStackScreenProps<SettingsParamList, T>

const SettingsStack = createNativeStackNavigator<SettingsParamList>()

export default function SettingsNavigator() {
    return (
        <SettingsStack.Navigator screenOptions={{ headerShown: true }}>
            <SettingsStack.Screen name="SettingsIndex" component={SettingsIndex} />
            <SettingsStack.Screen name="SettingsDetail" component={SettingsDetail} />
        </SettingsStack.Navigator>
    )
}

function SettingsIndex({ navigation }: SP<"SettingsIndex">) {
    const { removeUser, user } = useUser()

    const dismiss = () => {
        Feedback.trigger("impactLight")
        navigation.getParent()?.goBack()
    }

    const go = (section: SettingSection, title: string) => {
        Feedback.trigger("selection")
        navigation.navigate("SettingsDetail", { section, title })
    }

    const handleSignout = async () => {
        await removeUser()
        let keys = await AsyncStorage.getAllKeys()
        keys = keys.filter((k) => !k.startsWith("color_scheme"))
        await AsyncStorage.multiRemove(keys)
        navigation.getParent()?.goBack()
    }

    return (
        <View style={s.container}>
            <ModalHeader title="Settings" onClose={dismiss} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={s.scroll}
                keyboardDismissMode="on-drag"
            >
                <View style={s.profileCard}>
                    <View style={s.avatar}>
                        <Text style={s.avatarText}>{user?.email?.[0]?.toUpperCase() ?? "U"}</Text>
                    </View>
                    <View>
                        <Text variant="body" style={s.profileEmail}>
                            {user?.email}
                        </Text>
                        <Text variant="caption" style={s.profileSub}>
                            Personal account
                        </Text>
                    </View>
                </View>

                <SectionLabel title="Preferences" />
                <Card>
                    <SettingsRow
                        icon={
                            <IconBox bg={Colors.secondary}>
                                <Feather name="bell" size={16} color="#fff" />
                            </IconBox>
                        }
                        label="Notifications"
                        onPress={() => go("notifications", "Notifications")}
                        right={<Feather name="chevron-right" size={16} color={Colors.text_dark} />}
                    />
                    <SettingsRow
                        icon={
                            <IconBox bg="#3A3A3C">
                                <Feather name="watch" size={16} color="#fff" />
                            </IconBox>
                        }
                        label="Apple Watch"
                        isLast
                        onPress={() => go("watch", "Apple Watch")}
                        right={<Feather name="chevron-right" size={16} color={Colors.text_dark} />}
                    />
                </Card>

                <View style={s.sectionGap} />
                <SectionLabel title="Appearance" />
                <Card>
                    <SettingsRow
                        icon={
                            <IconBox bg={Colors.ternary}>
                                <Feather name="sliders" size={16} color="#fff" />
                            </IconBox>
                        }
                        label="Color Theme"
                        isLast
                        onPress={() => go("theme", "Color Theme")}
                        right={
                            <View style={s.colorDots}>
                                <View style={[s.colorDot, { backgroundColor: Colors.secondary }]} />
                                <View style={[s.colorDot, { backgroundColor: Colors.ternary }]} />
                                <View style={[s.colorDot, { backgroundColor: Colors.foreground }]} />
                            </View>
                        }
                    />
                </Card>

                <View style={s.sectionGap} />
                <SectionLabel title="App" />
                <Card>
                    <UpdateRow />
                </Card>

                <View style={s.sectionGap} />
                <SectionLabel title="Account" />
                <Card>
                    <TouchableOpacity onPress={handleSignout} activeOpacity={0.65} style={s.row}>
                        <IconBox bg={Colors.error}>
                            <Feather name="log-out" size={16} color="#fff" />
                        </IconBox>
                        <Text variant="body" style={[s.rowLabel, { color: Colors.error }]}>
                            Sign Out
                        </Text>
                    </TouchableOpacity>
                </Card>
            </ScrollView>
        </View>
    )
}

function SettingsDetail({ navigation, route }: SP<"SettingsDetail">) {
    const { section, title } = route.params

    return (
        <View style={s.container}>
            <ModalHeader title={title} onClose={() => navigation.goBack()} closeIcon="chevron.backward" />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={s.scroll}
                keyboardDismissMode="on-drag"
            >
                {section === "notifications" && <NotificationsSection />}
                {section === "watch" && <WatchSection />}
                {section === "theme" && <ThemeSection />}
            </ScrollView>
        </View>
    )
}

function SectionLabel({ title }: { title: string }) {
    return <Text style={s.sectionLabel}>{title}</Text>
}

function Card({ children }: { children: React.ReactNode }) {
    return <View style={s.card}>{children}</View>
}

function SettingsRow({
    icon,
    label,
    right,
    onPress,
    isLast,
}: {
    icon: React.ReactNode
    label: string
    right?: React.ReactNode
    onPress?: () => void
    isLast?: boolean
}) {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.65 : 1} style={[s.row, !isLast && s.rowBorder]}>
            {icon}
            <Text variant="body" style={s.rowLabel}>
                {label}
            </Text>
            {right && <View style={s.rowRight}>{right}</View>}
        </TouchableOpacity>
    )
}

function IconBox({ bg, children }: { bg: string; children: React.ReactNode }) {
    return <View style={[s.iconBox, { backgroundColor: bg }]}>{children}</View>
}

function ToggleRow({
    label,
    subtitle,
    value,
    onChange,
    disabled,
    isLast,
}: {
    label: string
    subtitle?: string
    value: boolean
    onChange: (v: boolean) => void
    disabled?: boolean
    isLast?: boolean
}) {
    return (
        <View style={[s.toggleRow, !isLast && s.rowBorder]}>
            <View style={{ flex: 1 }}>
                <Text style={[s.toggleLabel, disabled && { opacity: 0.45 }]}>{label}</Text>
                {subtitle && <Text style={[s.toggleSub, disabled && { opacity: 0.45 }]}>{subtitle}</Text>}
            </View>
            <Switch
                value={value}
                onValueChange={(v) => {
                    Feedback.trigger("selection")
                    onChange(v)
                }}
                disabled={disabled}
                trackColor={{ false: "rgba(255,255,255,0.15)", true: Colors.secondary }}
                thumbColor={value ? Colors.primary : "rgba(255,255,255,0.85)"}
            />
        </View>
    )
}

interface ColorConfig {
    key: string
    label: string
    sub: string
    group?: "primary" | "secondary"
}

const ALL_COLORS: ColorConfig[] = [
    // ── Core ──
    { key: "primary", label: "Background", sub: "Main screen background" },
    { key: "secondary", label: "Accent", sub: "Buttons, CTAs, highlights" },
    { key: "ternary", label: "Ternary", sub: "Supplementary accent" },
    { key: "foreground", label: "Text", sub: "Primary text color" },

    // ── Primary variants (collapsible) ──
    { key: "primary_light", label: "Light", sub: "Cards, inputs (+25%)", group: "primary" },
    { key: "primary_lighter", label: "Lighter", sub: "Inner containers (+40%)", group: "primary" },
    { key: "primary_surface", label: "Surface", sub: "Chart items (+30%)", group: "primary" },
    { key: "primary_lightest", label: "Lightest", sub: "Chart containers (+50%)", group: "primary" },
    { key: "primary_faded", label: "Faded", sub: "Elevated surfaces (+80%)", group: "primary" },
    { key: "primary_dark", label: "Dark", sub: "Headers (-25%)", group: "primary" },
    { key: "primary_darker", label: "Darker", sub: "Calendar bg (-50%)", group: "primary" },

    // ── Secondary variants (collapsible) ──
    { key: "secondary_light_1", label: "Light", sub: "Subtle accents (+25%)", group: "secondary" },
    { key: "secondary_light_2", label: "Lighter", sub: "Dimmed accents (+50%)", group: "secondary" },
    { key: "secondary_dark_1", label: "Dark", sub: "Event backgrounds (-25%)", group: "secondary" },
    { key: "secondary_dark_2", label: "Darker", sub: "Deep shadows (-50%)", group: "secondary" },

    // ── Status ──
    { key: "error", label: "Error", sub: "Error states" },
    { key: "warning", label: "Warning", sub: "Warning color" },
    { key: "warning_amber", label: "Warning Amber", sub: "Amber warning" },
    { key: "success", label: "Success", sub: "Success states" },
    { key: "danger", label: "Danger", sub: "Destructive actions" },
    { key: "info", label: "Info", sub: "Info indicators" },
    { key: "expired", label: "Expired", sub: "Overdue status" },

    // ── Financial ──
    { key: "positive", label: "Positive", sub: "Income amount" },
    { key: "negative", label: "Negative", sub: "Expense amount" },
    { key: "chart_positive", label: "Chart Pos", sub: "Chart positive" },
    { key: "chart_negative", label: "Chart Neg", sub: "Chart negative" },

    // ── Text ──
    { key: "text_light", label: "Text Light", sub: "High-contrast text" },
    { key: "text_dark", label: "Text Dark", sub: "Placeholder text" },

    // ── Overlays ──
    { key: "overlay", label: "Overlay", sub: "Modal scrim (50%)" },
    { key: "overlay_heavy", label: "Overlay Heavy", sub: "Image viewer (75%)" },
    { key: "overlay_light", label: "Overlay Light", sub: "Subtle dim (20%)" },

    // ── Foreground alpha variants ──
    { key: "foreground_secondary", label: "Fg Secondary", sub: "Body text (70%)" },
    { key: "foreground_muted", label: "Fg Muted", sub: "Meta text (60%)" },
    { key: "foreground_disabled", label: "Fg Disabled", sub: "Disabled text (40%)" },
    { key: "foreground_placeholder", label: "Fg Placeholder", sub: "Placeholder (30%)" },
    { key: "foreground_hairline", label: "Fg Hairline", sub: "Separators (8%)" },

    // ── Ternary variants ──
    { key: "ternary_light_1", label: "Ternary Light", sub: "Light ternary (+25%)" },
    { key: "ternary_light_2", label: "Ternary Lighter", sub: "Lighter ternary (+50%)" },

    // ── Border ──
    { key: "borderColor", label: "Border", sub: "Card borders" },
]

const GROUP_LABELS: Record<string, string> = {
    primary: "Primary Variants",
    secondary: "Secondary Variants",
}

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
            <TouchableOpacity
                onPress={onToggle}
                style={ts.groupHeader}
                activeOpacity={0.7}
            >
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

function ThemeSection() {
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

    const toggleGroup = (group: string) =>
        setExpandedGroups((prev) => ({ ...prev, [group]: !prev[group] }))

    const preview =
        mode === "custom"
            ? customColors
            : (selectedPalette ?? {
                  primary: Colors.primary,
                  secondary: Colors.secondary,
                  ternary: Colors.ternary,
                  foreground: Colors.foreground,
              })

    const clearGranularOverrides = async () => {
        const results = ALL_COLORS.map((cfg) =>
            SecureStore.deleteItemAsync(`theme_${cfg.key}`).catch(() => {}),
        )
        await Promise.all(results)
    }

    const applyTheme = async (
        palette: Omit<ColorPalette, "name" | "category"> & { name: string; category: string },
    ) => {
        await SecureStore.setItemAsync("color_scheme_primary", palette.primary)
        await SecureStore.setItemAsync("color_scheme_secondary", palette.secondary)
        await SecureStore.setItemAsync("color_scheme_ternary", palette.ternary)
        await SecureStore.setItemAsync("color_scheme_foreground", palette.foreground)
        await clearGranularOverrides()
        await reloadAppAsync()
    }

    const applyCustom = async () => {
        const saves = ALL_COLORS.map((cfg) =>
            SecureStore.setItemAsync(`theme_${cfg.key}`, customColors[cfg.key]),
        )
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

    // Separate colors by group
    const coreColors = ALL_COLORS.filter((c) => !c.group)
    const groupedColors = ALL_COLORS.filter((c) => c.group)
    const primaryColors = groupedColors.filter((c) => c.group === "primary")
    const secondaryColors = groupedColors.filter((c) => c.group === "secondary")

    return (
        <View style={ts.root}>
            {/* Mode toggle */}
            <View style={ts.toggle}>
                <GroupSelector
                    value={mode}
                    onChange={(m) => setMode(m)}
                    options={[
                        { label: "Presets", value: "presets" },
                        { label: "Custom", value: "custom" },
                    ]}
                />
            </View>

            {/* Live preview */}
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
                                        {selected && (
                                            <Feather name="check-circle" size={13} color={palette.secondary} />
                                        )}
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
                    {/* Core colors */}
                    {coreColors.map((cfg, i) => (
                        <ColorRow
                            key={cfg.key}
                            color={customColors[cfg.key]}
                            label={cfg.label}
                            sub={cfg.sub}
                            border={i < coreColors.length - 1}
                            onChange={(c) => setCustomColors((p) => ({ ...p, [cfg.key]: c }))}
                        />
                    ))}

                    {/* Primary variants collapsible */}
                    <CollapsibleSection
                        label="Primary Variants"
                        count={primaryColors.length}
                        expanded={expandedGroups.primary}
                        onToggle={() => toggleGroup("primary")}
                    >
                        {primaryColors.map((cfg) => (
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

                    {/* Secondary variants collapsible */}
                    <CollapsibleSection
                        label="Secondary Variants"
                        count={secondaryColors.length}
                        expanded={expandedGroups.secondary}
                        onToggle={() => toggleGroup("secondary")}
                    >
                        {secondaryColors.map((cfg) => (
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

                    {/* Separator between grouped and remaining standalone */}
                    {expandedGroups.primary || expandedGroups.secondary ? (
                        <View style={ts.groupDivider} />
                    ) : null}

                    {/* Status, Financial, Text, Foreground variants, Overlays, Ternary, Border */}
                    {[
                        { label: "Status", keys: ["error", "warning", "warning_amber", "success", "danger", "info", "expired"] },
                        { label: "Financial", keys: ["positive", "negative", "chart_positive", "chart_negative"] },
                        { label: "Text", keys: ["text_light", "text_dark"] },
                        { label: "Foreground Alpha", keys: ["foreground_secondary", "foreground_muted", "foreground_disabled", "foreground_placeholder", "foreground_hairline"] },
                        { label: "Overlays", keys: ["overlay", "overlay_heavy", "overlay_light"] },
                        { label: "Ternary", keys: ["ternary_light_1", "ternary_light_2"] },
                        { label: "Border", keys: ["borderColor"] },
                    ].map((section) => {
                        const sectionColors = coreColors.filter((c) => section.keys.includes(c.key))
                        if (sectionColors.length === 0) return null
                        return (
                            <View key={section.label}>
                                {/* Small section label */}
                                <View style={ts.colorSectionLabel}>
                                    <Text style={ts.colorSectionLabelText}>{section.label}</Text>
                                </View>
                                {sectionColors.map((cfg) => (
                                    <ColorRow
                                        key={cfg.key}
                                        color={customColors[cfg.key]}
                                        label={cfg.label}
                                        sub={cfg.sub}
                                        border
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
                <NativeColorPicker
                    selection={color}
                    onSelectionChange={onChange}
                    supportsOpacity={false}
                />
            </Host>
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
    groupBadgeText: { color: Colors.foreground_muted, fontSize: 11, fontWeight: "600" },
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

function NotificationsSection() {
    const [settings, setSettings] = useState({ isEnable: true, enabledNotifications: {} as Record<string, boolean> })
    const [hasChanges, setHasChanges] = useState(false)

    const { data } = useQuery<{
        getNotificationSettings: { id: string; isEnable: boolean; enabledNotifications: Record<string, boolean> | null }
    }>(GET_NOTIFICATION_SETTINGS, {
        onCompleted: (d) => {
            if (d?.getNotificationSettings) {
                setSettings({
                    isEnable: d.getNotificationSettings.isEnable,
                    enabledNotifications: d.getNotificationSettings.enabledNotifications || {},
                })
            }
        },
        errorPolicy: "all",
    })

    const { data: typesData } = useQuery<{
        getAvailableNotificationTypes: { key: string; title: string; description: string }[]
    }>(GET_AVAILABLE_NOTIFICATION_TYPES)

    const [save, { loading: saving }] = useMutation(TOGGLE_ENABLED_NOTIFICATIONS, {
        onCompleted: () => {
            setHasChanges(false)
            Feedback.trigger("notificationSuccess")
        },
        onError: () => Feedback.trigger("notificationError"),
    })

    useEffect(() => {
        if (data?.getNotificationSettings?.enabledNotifications && typesData?.getAvailableNotificationTypes) {
            const current = data.getNotificationSettings.enabledNotifications
            const defaults: Record<string, boolean> = {}
            typesData.getAvailableNotificationTypes.forEach((t) => {
                defaults[t.key] = current[t.key] !== false
            })
            setSettings((prev) => ({ ...prev, enabledNotifications: defaults }))
        }
    }, [data, typesData])

    const notifTypes = typesData?.getAvailableNotificationTypes || NOTIFICATION_TYPES

    return (
        <>
            <View style={s.subCard}>
                <ToggleRow
                    label="Allow Notifications"
                    subtitle="Master toggle for all push alerts"
                    value={settings.isEnable}
                    onChange={(v) => {
                        setSettings((p) => ({ ...p, isEnable: v }))
                        setHasChanges(true)
                    }}
                    isLast
                />
            </View>

            <View style={s.subCard}>
                {notifTypes.map((n, i) => (
                    <ToggleRow
                        key={n.key}
                        label={n.title}
                        value={settings.enabledNotifications[n.key] !== false && settings.isEnable}
                        onChange={(v) => {
                            setSettings((p) => ({
                                ...p,
                                enabledNotifications: { ...p.enabledNotifications, [n.key]: v },
                            }))
                            setHasChanges(true)
                        }}
                        disabled={!settings.isEnable}
                        isLast={i === notifTypes.length - 1}
                    />
                ))}
            </View>

            <View style={s.saveBtn}>
                <Button
                    onPress={() => save({ variables: { input: settings.enabledNotifications } })}
                    disabled={!hasChanges || saving}
                >
                    {saving ? "Saving…" : "Save Changes"}
                </Button>
            </View>
        </>
    )
}

function WatchSection() {
    const { token } = useUser()
    const [isSyncing, setIsSyncing] = useState(false)
    const [status, setStatus] = useState<{ text: string; ok: boolean } | null>(null)

    const handleSync = async () => {
        try {
            setIsSyncing(true)
            Feedback.trigger("impactLight")

            if (!token?.trim()) {
                setStatus({ text: "No auth token — please sign in", ok: false })
                return
            }
            if (!ExpoAppleWatch.isWatchAvailable()) {
                setStatus({ text: "Watch not paired or app not installed", ok: false })
                return
            }

            const reachable = ExpoAppleWatch.isWatchReachable()
            setStatus({ text: reachable ? "Watch reachable" : "Will sync when available", ok: reachable })

            await ExpoAppleWatch.sendAuthToken(token)
            Feedback.trigger("notificationSuccess")
            setStatus({ text: "Synced successfully", ok: true })
        } catch (err: any) {
            Feedback.trigger("notificationError")
            setStatus({ text: err?.message || "Sync failed", ok: false })
        } finally {
            setIsSyncing(false)
        }
    }

    return (
        <View style={s.subCard}>
            {status && (
                <View style={[s.toggleRow, s.rowBorder]}>
                    <Feather name="info" size={15} color={status.ok ? Colors.secondary : Colors.text_dark} />
                    <Text style={[s.watchStatus, status.ok && s.watchStatusOk]}>{status.text}</Text>
                </View>
            )}
            <TouchableOpacity onPress={handleSync} activeOpacity={0.65} style={s.watchActionRow} disabled={isSyncing}>
                <Feather name="refresh-cw" size={16} color={isSyncing ? Colors.text_dark : Colors.secondary} />
                <Text style={[s.watchActionLabel, isSyncing && { color: Colors.text_dark }]}>
                    {isSyncing ? "Syncing…" : "Sync to Apple Watch"}
                </Text>
                {!isSyncing && <Feather name="chevron-right" size={16} color={Colors.text_dark} />}
            </TouchableOpacity>
        </View>
    )
}

function UpdateRow() {
    const { isDownloading, checkForUpdate, downloadAndRestart } = useExpoUpdates()

    useEffect(() => {
        checkForUpdate()
    }, [])

    return (
        <SettingsRow
            icon={
                <IconBox bg={Color(Colors.secondary).darken(0.3).string()}>
                    <Feather name="download" size={16} color="#fff" />
                </IconBox>
            }
            label={isDownloading ? "Updating…" : "Update App"}
            isLast
            onPress={downloadAndRestart}
        />
    )
}
