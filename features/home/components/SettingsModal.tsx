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
        backgroundColor: Color(Colors.primary).lighten(0.25).string(),
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

const COLOR_ROLES = [
    { key: "primary" as const, label: "Background", sub: "Main app background" },
    { key: "secondary" as const, label: "Accent", sub: "Buttons & highlights" },
    { key: "ternary" as const, label: "Highlight", sub: "Badges & tags" },
    { key: "foreground" as const, label: "Text", sub: "Primary text color" },
]

const CARD_WIDTH = (Layout.screen.width - 32 - 10) / 2

function ThemeSection() {
    const [mode, setMode] = useState<"presets" | "custom">("presets")
    const [selectedPalette, setSelectedPalette] = useState<ColorPalette | null>(null)
    const [customColors, setCustomColors] = useState({
        primary: Colors.primary,
        secondary: Colors.secondary,
        ternary: Colors.ternary,
        foreground: Colors.foreground,
    })

    const preview =
        mode === "custom"
            ? customColors
            : (selectedPalette ?? {
                  primary: Colors.primary,
                  secondary: Colors.secondary,
                  ternary: Colors.ternary,
                  foreground: Colors.foreground,
              })

    const applyTheme = async (
        palette: Omit<ColorPalette, "name" | "category"> & { name: string; category: string },
    ) => {
        await SecureStore.setItemAsync("color_scheme_primary", palette.primary)
        await SecureStore.setItemAsync("color_scheme_secondary", palette.secondary)
        await SecureStore.setItemAsync("color_scheme_ternary", palette.ternary)
        await SecureStore.setItemAsync("color_scheme_foreground", palette.foreground)
        await reloadAppAsync()
    }

    const handleApply = async () => {
        Feedback.trigger("impactMedium")
        if (mode === "custom") {
            await applyTheme({ name: "Custom", ...customColors, category: "Custom" })
        } else if (selectedPalette) {
            await applyTheme(selectedPalette)
        }
    }

    const canApply = mode === "custom" || selectedPalette !== null

    return (
        <View style={ts.root}>
            {/* Mode toggle */}
            <View style={ts.toggle}>
                <GroupSelector
                    value={mode}
                    onChange={(m) => setMode(m)}
                    options={[
                        {
                            label: "Presets",
                            value: "presets",
                        },
                        {
                            label: "Custom",
                            value: "custom",
                        },
                    ]}
                />
            </View>

            {/* Live preview */}
            <View style={[ts.preview, { backgroundColor: preview.primary }]}>
                <View style={{ flex: 1 }}>
                    <Text style={[ts.previewTitle, { color: preview.foreground }]}>
                        {mode === "custom" ? "Custom" : (selectedPalette?.name ?? "Select a palette")}
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
                    {COLOR_ROLES.map((role, i) => (
                        <View key={role.key} style={[ts.colorRow, i < COLOR_ROLES.length - 1 && ts.colorRowBorder]}>
                            <View style={[ts.colorSwatch, { backgroundColor: customColors[role.key] }]} />
                            <View style={{ flex: 1 }}>
                                <Text style={ts.colorLabel}>{role.label}</Text>
                                <Text style={ts.colorSub}>{role.sub}</Text>
                            </View>
                            <Host matchContents>
                                <NativeColorPicker
                                    selection={customColors[role.key]}
                                    onSelectionChange={(c) => setCustomColors((p) => ({ ...p, [role.key]: c }))}
                                    supportsOpacity={false}
                                />
                            </Host>
                        </View>
                    ))}
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
        backgroundColor: Color(Colors.primary).lighten(0.25).string(),
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
