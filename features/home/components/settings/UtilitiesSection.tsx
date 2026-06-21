import Text from "@/components/ui/Text/Text"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import Colors from "@/constants/Colors"
import { Feather } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as BackgroundTask from "expo-background-task"
import * as Location from "expo-location"
import * as TaskManager from "expo-task-manager"
import { getAllGeofences } from "@/features/timeline/utils/geofenceStorage"
import { GEOFENCE_TASK } from "@/features/timeline/utils/geofenceTask"
import { WIDGET_BG_FETCH_TASK } from "@/utils/widget/widgetBackgroundFetch"
import Color from "color"
import React, { useCallback, useEffect, useState } from "react"
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native"
import Feedback from "react-native-haptic-feedback"
import { Card, CARD_BG, SectionLabel } from "./SettingsComponents"

type ActionState = "idle" | "loading" | "done" | "error"

type PendingAction = {
    title: string
    description: string
    onConfirm: () => Promise<void>
} | null

type TaskStatus = {
    geofence: boolean
    widgetFetch: boolean
    geofenceCount: number
}

function ActionRow({
    icon,
    label,
    subtitle,
    onPress,
    state,
    isLast,
    iconBg,
}: {
    icon: string
    label: string
    subtitle?: string
    onPress: () => void
    state: ActionState
    isLast?: boolean
    iconBg: string
}) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.65}
            style={[s.row, !isLast && s.rowBorder]}
            disabled={state === "loading"}
        >
            <View style={[s.iconBox, { backgroundColor: iconBg }]}>
                <Feather name={icon as any} size={16} color="#fff" />
            </View>
            <View style={s.rowText}>
                <Text variant="body" style={s.rowLabel}>
                    {label}
                </Text>
                {subtitle ? (
                    <Text variant="caption" style={s.rowSub}>
                        {subtitle}
                    </Text>
                ) : null}
            </View>
            {state === "loading" ? (
                <ActivityIndicator size="small" color={Colors.foreground_secondary} />
            ) : state === "done" ? (
                <Feather name="check" size={16} color={Colors.secondary} />
            ) : state === "error" ? (
                <Feather name="alert-circle" size={16} color={Colors.danger} />
            ) : (
                <Feather name="chevron-right" size={16} color={Colors.text_dark} />
            )}
        </TouchableOpacity>
    )
}

export default function UtilitiesSection() {
    const [taskStatus, setTaskStatus] = useState<TaskStatus>({
        geofence: false,
        widgetFetch: false,
        geofenceCount: 0,
    })
    const [rowStates, setRowStates] = useState<Record<string, ActionState>>({})
    const [pending, setPending] = useState<PendingAction>(null)
    const [confirmLoading, setConfirmLoading] = useState(false)

    const refreshStatus = useCallback(async () => {
        const [geofence, widgetFetch, geofences] = await Promise.all([
            TaskManager.isTaskRegisteredAsync(GEOFENCE_TASK).catch(() => false),
            TaskManager.isTaskRegisteredAsync(WIDGET_BG_FETCH_TASK).catch(() => false),
            getAllGeofences().catch(() => []),
        ])
        setTaskStatus({ geofence, widgetFetch, geofenceCount: geofences.length })
    }, [])

    useEffect(() => {
        refreshStatus()
    }, [refreshStatus])

    const setRowState = (key: string, state: ActionState) =>
        setRowStates((prev) => ({ ...prev, [key]: state }))

    const prompt = (title: string, description: string, onConfirm: () => Promise<void>) => {
        Feedback.trigger("impactLight")
        setPending({ title, description, onConfirm })
    }

    const handleConfirm = async () => {
        if (!pending) return
        setConfirmLoading(true)
        try {
            await pending.onConfirm()
        } finally {
            setConfirmLoading(false)
            setPending(null)
            await refreshStatus()
        }
    }

    const stopGeofencing = async () => {
        const key = "geofence_task"
        setRowState(key, "loading")
        try {
            const running = await Location.hasStartedGeofencingAsync(GEOFENCE_TASK)
            if (running) await Location.stopGeofencingAsync(GEOFENCE_TASK)
            await AsyncStorage.removeItem("timeline_geofences_v1")
            setRowState(key, "done")
        } catch {
            setRowState(key, "error")
        }
    }

    const stopWidgetFetch = async () => {
        const key = "widget_fetch"
        setRowState(key, "loading")
        try {
            const registered = await TaskManager.isTaskRegisteredAsync(WIDGET_BG_FETCH_TASK)
            if (registered) await BackgroundTask.unregisterTaskAsync(WIDGET_BG_FETCH_TASK)
            setRowState(key, "done")
        } catch {
            setRowState(key, "error")
        }
    }

    const clearWidgetConfig = async () => {
        const key = "widget_config"
        setRowState(key, "loading")
        try {
            await AsyncStorage.removeItem("home_widgets_config_v2")
            setRowState(key, "done")
        } catch {
            setRowState(key, "error")
        }
    }

    const clearAllStorage = async () => {
        const key = "clear_all"
        setRowState(key, "loading")
        try {
            let keys = await AsyncStorage.getAllKeys()
            keys = keys.filter((k) => !k.startsWith("color_scheme"))
            await AsyncStorage.multiRemove(keys)
            setRowState(key, "done")
        } catch {
            setRowState(key, "error")
        }
    }

    return (
        <>
            <SectionLabel title="Background Tasks" />
            <Card>
                <ActionRow
                    icon="map-pin"
                    label="Stop Geofencing"
                    subtitle={
                        taskStatus.geofence
                            ? `Active · ${taskStatus.geofenceCount} geofence${taskStatus.geofenceCount !== 1 ? "s" : ""}`
                            : "Not running"
                    }
                    iconBg={taskStatus.geofence ? Colors.danger : Colors.text_dark}
                    state={rowStates["geofence_task"] ?? "idle"}
                    onPress={() =>
                        prompt(
                            "Stop Geofencing",
                            "This will stop the geofencing task and remove all saved geofence records.",
                            stopGeofencing,
                        )
                    }
                />
                <ActionRow
                    icon="refresh-cw"
                    label="Remove Widget Background Fetch"
                    subtitle={taskStatus.widgetFetch ? "Registered" : "Not registered"}
                    iconBg={taskStatus.widgetFetch ? "#3A7BD5" : Colors.text_dark}
                    state={rowStates["widget_fetch"] ?? "idle"}
                    isLast
                    onPress={() =>
                        prompt(
                            "Remove Widget Fetch",
                            "Unregisters the background fetch task that keeps widgets in sync.",
                            stopWidgetFetch,
                        )
                    }
                />
            </Card>

            <View style={s.gap} />
            <SectionLabel title="Storage" />
            <Card>
                <ActionRow
                    icon="layout"
                    label="Reset Home Widget Config"
                    subtitle="Restores default widget layout"
                    iconBg={Colors.ternary}
                    state={rowStates["widget_config"] ?? "idle"}
                    onPress={() =>
                        prompt(
                            "Reset Widget Config",
                            "Clears the saved home widget layout and restores defaults.",
                            clearWidgetConfig,
                        )
                    }
                />
                <ActionRow
                    icon="trash-2"
                    label="Clear All App Storage"
                    subtitle="Removes all cached data (keeps theme)"
                    iconBg={Colors.danger}
                    state={rowStates["clear_all"] ?? "idle"}
                    isLast
                    onPress={() =>
                        prompt(
                            "Clear All Storage",
                            "Removes all AsyncStorage data except your color theme. This cannot be undone.",
                            clearAllStorage,
                        )
                    }
                />
            </Card>

            <ConfirmDialog
                isVisible={!!pending}
                onDismiss={() => setPending(null)}
                onConfirm={handleConfirm}
                title={pending?.title ?? ""}
                description={pending?.description}
                confirmLabel="Proceed"
                destructive
                loading={confirmLoading}
            />
        </>
    )
}

const s = StyleSheet.create({
    gap: { marginTop: 30 },
    row: {
        flexDirection: "row",
        alignItems: "center",
        minHeight: 54,
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 12,
    },
    rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(255,255,255,0.08)" },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    rowText: { flex: 1 },
    rowLabel: { color: Colors.text_light },
    rowSub: { color: Colors.foreground_secondary, marginTop: 2 },
})
