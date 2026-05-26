import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import useUser from "@/utils/hooks/useUser"
import * as ExpoAppleWatch from "@/modules/expo-apple-watch"
import { Feather } from "@expo/vector-icons"
import { useState } from "react"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import Feedback from "react-native-haptic-feedback"
import { ToggleRow, SEPARATOR } from "./SettingsComponents"

export default function WatchSection() {
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
                <View style={s.statusRow}>
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

const s = StyleSheet.create({
    subCard: {
        backgroundColor: Colors.primary_light,
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 12,
    },
    statusRow: {
        flexDirection: "row",
        alignItems: "center",
        minHeight: 46,
        paddingHorizontal: 14,
        paddingVertical: 8,
        gap: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: SEPARATOR,
    },
    watchStatus: { color: Colors.foreground_secondary, fontSize: 13 },
    watchStatusOk: { color: Colors.secondary },
    watchActionRow: { flexDirection: "row", alignItems: "center", minHeight: 46, paddingHorizontal: 14, gap: 12 },
    watchActionLabel: { flex: 1, color: Colors.text_light, fontSize: 15 },
})
