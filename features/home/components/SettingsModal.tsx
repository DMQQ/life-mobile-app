import { AnimatedSelector, ModalHeader } from "@/components"
import Button from "@/components/ui/Button/Button"
import Text from "@/components/ui/Text/Text"
import Colors, { defaultColors } from "@/constants/Colors"
import Layout from "@/constants/Layout"
import useUser from "@/utils/hooks/useUser"
import { useExpoUpdates } from "@/utils/hooks/useExpoUpdate"
import { GlassIconButton } from "@/components"
import { Feather } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { reloadAppAsync } from "expo"
import { BlurView } from "expo-blur"
import * as SecureStore from "expo-secure-store"
import React, { useEffect, useState } from "react"
import { FlatList, ScrollView, StyleSheet, Switch, TouchableOpacity, View } from "react-native"
import Feedback from "react-native-haptic-feedback"
import Ripple from "react-native-material-ripple"
import * as ExpoAppleWatch from "@/modules/expo-apple-watch"
import ColorPicker, { HueSlider, OpacitySlider, Panel1, Preview } from "reanimated-color-picker"
import { router } from "expo-router"
import { gql, useMutation, useQuery } from "@apollo/client"
import Color from "color"
import { NOTIFICATION_TYPES } from "./EnabledNotifications"

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
    blur: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
    inner: { flex: 1 },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: SEPARATOR,
        backgroundColor: "rgba(0,0,0,0.2)",
    },
    headerTitle: { color: Colors.text_light, fontWeight: "600" },
    closeBtn: { padding: 4 },
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

    card: {
        backgroundColor: CARD_BG,
        borderRadius: 20,
        overflow: "hidden",
    },
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

    expandedPad: { paddingHorizontal: 0, paddingBottom: 8 },
    subCard: {
        backgroundColor: Color(Colors.primary).lighten(0.25).string(),
        borderRadius: 16,
        overflow: "hidden",
        marginHorizontal: 10,
        marginTop: 4,
        marginBottom: 10,
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
    saveBtn: { marginHorizontal: 10, marginTop: 4, marginBottom: 12 },

    paletteItem: {
        width: 120,
        height: 150,
        borderRadius: 20,
        overflow: "hidden",
        borderWidth: 2.5,
        borderColor: "transparent",
        marginRight: 10,
    },
    paletteSelected: { borderColor: Colors.secondary },
    paletteContent: { flex: 1, padding: 12, justifyContent: "space-between" },
    paletteName: { color: "#fff", fontSize: 12, fontWeight: "700" },
    swatchCircles: { flexDirection: "row", gap: 6 },
    swatchCircle: {
        width: 26,
        height: 26,
        borderRadius: 13,
        borderWidth: 1.5,
        borderColor: "rgba(255,255,255,0.25)",
    },

    watchStatus: { color: Colors.foreground_secondary, fontSize: 13 },
    watchStatusOk: { color: Colors.secondary },
    watchActionRow: {
        flexDirection: "row",
        alignItems: "center",
        minHeight: 46,
        paddingHorizontal: 14,
        gap: 12,
    },
    watchActionLabel: { flex: 1, color: Colors.text_light, fontSize: 15 },
})

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

function Chevron({ open }: { open: boolean }) {
    return <Feather name={open ? "chevron-up" : "chevron-down"} size={16} color={Colors.text_dark} />
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

export default function SettingsScreen() {
    const { removeUser, user } = useUser()
    const [expandedSection, setExpandedSection] = useState<string | null>(null)
    const [selectedPalette, setSelectedPalette] = useState<ColorPalette | null>(null)
    const [isCustomMode, setIsCustomMode] = useState(false)
    const [customColors, setCustomColors] = useState({
        primary: "#0D1421",
        secondary: "#00C896",
        ternary: "#FFA726",
        foreground: "#FFFFFF",
    })
    const [activeColorType, setActiveColorType] = useState<"primary" | "secondary" | "ternary" | "foreground">(
        "primary",
    )

    const toggleSection = (key: string) => {
        Feedback.trigger("selection")
        setExpandedSection((prev) => (prev === key ? null : key))
    }

    const handleClose = () => {
        Feedback.trigger("impactLight")
        router.back()
    }

    const handleSignout = async () => {
        await removeUser()
        let keys = await AsyncStorage.getAllKeys()
        keys = keys.filter((k) => !k.startsWith("color_scheme"))
        await AsyncStorage.multiRemove(keys)
        router.back()
    }

    const applyTheme = async (palette: ColorPalette) => {
        await SecureStore.setItemAsync("color_scheme_primary", palette.primary)
        await SecureStore.setItemAsync("color_scheme_secondary", palette.secondary)
        await SecureStore.setItemAsync("color_scheme_ternary", palette.ternary)
        await SecureStore.setItemAsync("color_scheme_foreground", palette.foreground)
        await reloadAppAsync()
    }

    const handleApply = async () => {
        Feedback.trigger("impactMedium")
        if (isCustomMode) {
            await applyTheme({ name: "Custom", ...customColors, category: "Custom" })
        } else if (selectedPalette) {
            await applyTheme(selectedPalette)
        }
    }

    const activeColors = isCustomMode
        ? customColors
        : (selectedPalette ?? { secondary: Colors.secondary, ternary: Colors.ternary, foreground: Colors.foreground })

    const canApply = isCustomMode || selectedPalette !== null

    return (
        <View style={s.container}>
            <ModalHeader title="Settings" onClose={handleClose} />
            <View style={s.inner}>
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
                            onPress={() => toggleSection("notifications")}
                            right={<Chevron open={expandedSection === "notifications"} />}
                        />
                        {expandedSection === "notifications" && (
                            <View style={s.expandedPad}>
                                <NotificationsSection />
                            </View>
                        )}
                        <SettingsRow
                            icon={
                                <IconBox bg="#3A3A3C">
                                    <Feather name="watch" size={16} color="#fff" />
                                </IconBox>
                            }
                            label="Apple Watch"
                            isLast
                            onPress={() => toggleSection("watch")}
                            right={<Chevron open={expandedSection === "watch"} />}
                        />
                        {expandedSection === "watch" && (
                            <View style={s.expandedPad}>
                                <WatchSection />
                            </View>
                        )}
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
                            onPress={() => toggleSection("theme")}
                            right={
                                <>
                                    <View style={s.colorDots}>
                                        <View style={[s.colorDot, { backgroundColor: activeColors.secondary }]} />
                                        <View style={[s.colorDot, { backgroundColor: activeColors.ternary }]} />
                                        <View style={[s.colorDot, { backgroundColor: activeColors.foreground }]} />
                                    </View>
                                    <Chevron open={expandedSection === "theme"} />
                                </>
                            }
                        />
                        {expandedSection === "theme" && (
                            <View style={{ paddingHorizontal: 12, paddingTop: 6, paddingBottom: 14 }}>
                                <AnimatedSelector
                                    items={["Presets", "Custom"]}
                                    selectedItem={isCustomMode ? "Custom" : "Presets"}
                                    onItemSelect={(item) => {
                                        Feedback.trigger("selection")
                                        setIsCustomMode(item === "Custom")
                                        if (item === "Custom") setSelectedPalette(null)
                                    }}
                                    containerStyle={{
                                        width: Layout.screen.width - 68,
                                        backgroundColor: "transparent",
                                        marginBottom: 16,
                                    }}
                                    buttonWidth={(Layout.screen.width - 78) / 2}
                                    buttonStyle={{ backgroundColor: undefined }}
                                />

                                {!isCustomMode ? (
                                    <>
                                        <FlatList
                                            horizontal
                                            data={colorPalettes}
                                            keyExtractor={(p) => p.name}
                                            showsHorizontalScrollIndicator={false}
                                            contentContainerStyle={{ paddingBottom: 4 }}
                                            renderItem={({ item }) => (
                                                <Ripple
                                                    onPress={() => {
                                                        Feedback.trigger("selection")
                                                        setSelectedPalette(item)
                                                    }}
                                                    style={[
                                                        s.paletteItem,
                                                        selectedPalette?.name === item.name && s.paletteSelected,
                                                        { backgroundColor: item.primary },
                                                    ]}
                                                >
                                                    <View style={s.paletteContent}>
                                                        <Text style={s.paletteName} numberOfLines={2}>
                                                            {item.name}
                                                        </Text>
                                                        <View style={s.swatchCircles}>
                                                            {[item.secondary, item.ternary, item.foreground].map(
                                                                (c, i) => (
                                                                    <View
                                                                        key={i}
                                                                        style={[s.swatchCircle, { backgroundColor: c }]}
                                                                    />
                                                                ),
                                                            )}
                                                        </View>
                                                    </View>
                                                </Ripple>
                                            )}
                                        />
                                        {selectedPalette && (
                                            <View
                                                style={{
                                                    flexDirection: "row",
                                                    gap: 8,
                                                    alignItems: "center",
                                                    marginTop: 14,
                                                    paddingHorizontal: 2,
                                                }}
                                            >
                                                <View
                                                    style={{
                                                        width: 36,
                                                        height: 36,
                                                        borderRadius: 18,
                                                        backgroundColor: selectedPalette.primary,
                                                        borderWidth: 1.5,
                                                        borderColor: "rgba(255,255,255,0.15)",
                                                    }}
                                                />
                                                <View style={{ flex: 1 }}>
                                                    <Text
                                                        style={{
                                                            color: Colors.text_light,
                                                            fontWeight: "600",
                                                            fontSize: 14,
                                                        }}
                                                    >
                                                        {selectedPalette.name}
                                                    </Text>
                                                    <Text style={{ color: Colors.foreground_secondary, fontSize: 12 }}>
                                                        {selectedPalette.secondary} · {selectedPalette.ternary}
                                                    </Text>
                                                </View>
                                                <Feather name="check-circle" size={18} color={Colors.secondary} />
                                            </View>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <View
                                            style={{
                                                flexDirection: "row",
                                                justifyContent: "space-around",
                                                marginBottom: 18,
                                            }}
                                        >
                                            {(["primary", "secondary", "ternary", "foreground"] as const).map((key) => (
                                                <TouchableOpacity
                                                    key={key}
                                                    onPress={() => setActiveColorType(key)}
                                                    style={{ alignItems: "center", gap: 6 }}
                                                    activeOpacity={0.7}
                                                >
                                                    <View
                                                        style={{
                                                            width: 48,
                                                            height: 48,
                                                            borderRadius: 24,
                                                            backgroundColor: customColors[key],
                                                            borderWidth: activeColorType === key ? 3 : 1.5,
                                                            borderColor:
                                                                activeColorType === key
                                                                    ? Colors.secondary
                                                                    : "rgba(255,255,255,0.2)",
                                                        }}
                                                    />
                                                    <Text
                                                        style={{
                                                            color:
                                                                activeColorType === key
                                                                    ? Colors.secondary
                                                                    : Colors.text_dark,
                                                            fontSize: 10,
                                                            textTransform: "capitalize",
                                                        }}
                                                    >
                                                        {key}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                        <ColorPicker
                                            value={customColors[activeColorType]}
                                            onCompleteJS={(c) =>
                                                setCustomColors((prev) => ({ ...prev, [activeColorType]: c.hex }))
                                            }
                                            style={{ width: "100%", marginBottom: 4 }}
                                        >
                                            <Preview style={{ marginBottom: 16, height: 56, borderRadius: 20 }} />
                                            <Panel1 style={{ height: 180, borderRadius: 20, marginBottom: 14 }} />
                                            <HueSlider style={{ height: 38, borderRadius: 20, marginBottom: 10 }} />
                                            <OpacitySlider style={{ height: 38, borderRadius: 20 }} />
                                        </ColorPicker>
                                    </>
                                )}

                                <Button
                                    onPress={handleApply}
                                    disabled={!canApply}
                                    style={{ marginTop: 16, borderRadius: 16 }}
                                >
                                    {isCustomMode ? "Apply Custom Colors" : "Apply Selected Palette"}
                                </Button>
                            </View>
                        )}
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
        </View>
    )
}

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
