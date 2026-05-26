import Button from "@/components/ui/Button/Button"
import Colors from "@/constants/Colors"
import { gql, useMutation, useQuery } from "@apollo/client"
import { useEffect, useState } from "react"
import { StyleSheet, View } from "react-native"
import Feedback from "react-native-haptic-feedback"
import { NOTIFICATION_TYPES } from "../EnabledNotifications"
import { ToggleRow, CARD_BG } from "./SettingsComponents"

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

export default function NotificationsSection() {
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

const s = StyleSheet.create({
    subCard: {
        backgroundColor: Colors.primary_light,
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 12,
    },
    saveBtn: { marginTop: 4 },
})
