import Colors from "@/constants/Colors"
import lowOpacity from "@/utils/functions/lowOpacity"
import { BlurView } from "expo-blur"
import { useState } from "react"
import { FlatList, StyleSheet, View } from "react-native"
import Text from "@/components/ui/Text/Text"
import { CategoryIcon } from "../Expense/ExpenseIcon"
import NotificationCard from "./NotificationCard"
import { Notification } from "./useNotifications"

export { NOTIFICATIONS_QUERY, useGetNotifications } from "./useNotifications"
export { FloatingNotificationItem, FloatingNotifications } from "./FloatingNotifications"

interface WalletNotificationsProps {
    data?: { notifications: any[] } | null
    error?: any
    loading?: boolean
}

export default function WalletNotifications({ data, error, loading }: WalletNotificationsProps) {
    const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set())

    const handleDismiss = (notificationId: string) => {
        setDismissedNotifications((prev) => new Set([...prev, notificationId]))
    }

    const visibleNotifications =
        data?.notifications?.filter((notification: Notification) => !dismissedNotifications.has(notification.id)) || []

    if (loading) {
        return (
            <View style={styles.emptyState}>
                <Text size={18} weight="600" color={Colors.text_light}>
                    Loading notifications...
                </Text>
            </View>
        )
    }

    if (error) {
        return (
            <View style={styles.emptyState}>
                <Text size={18} weight="600" color={Colors.text_light} style={{ marginBottom: 8 }}>
                    Error loading notifications
                </Text>
                <Text size={14} color={Colors.text_light} opacity={0.6} align="center">
                    {error.message}
                </Text>
            </View>
        )
    }

    if (visibleNotifications.length === 0) {
        return (
            <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                    <BlurView intensity={20} tint="dark" style={styles.emptyIconBlur} />
                    <View
                        style={[
                            styles.emptyIconContent,
                            { backgroundColor: lowOpacity(Colors.secondary, 0.2), width: 70, height: 70 },
                        ]}
                    >
                        <CategoryIcon type="income" category="bell" size={32} />
                    </View>
                </View>
                <Text size={18} weight="600" color={Colors.text_light} style={{ marginBottom: 8 }}>
                    All caught up!
                </Text>
                <Text size={14} color={Colors.text_light} opacity={0.6} align="center">
                    You don't have any new notifications right now.
                </Text>
            </View>
        )
    }

    return (
        <FlatList
            data={visibleNotifications}
            renderItem={({ item, index }) => (
                <NotificationCard index={index} notification={item} onDismiss={handleDismiss} />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            style={styles.container}
        />
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 60,
    },
    emptyIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
        overflow: "hidden",
    },
    emptyIconBlur: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    emptyIconContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.2)",
    },
})
