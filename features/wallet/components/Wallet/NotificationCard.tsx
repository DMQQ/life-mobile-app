import { FONTS } from "@/constants/Fonts"
import Colors from "@/constants/Colors"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import Text from "@/components/ui/Text/Text"
import { CategoryIcon } from "../Expense/ExpenseIcon"
import { formatTimeAgo, Notification, useReadNotification } from "./useNotifications"
import { Card } from "@/components"

export default function NotificationCard({
    notification,
    onDismiss,
}: {
    notification: Notification
    onDismiss: (id: string) => void
    index: number
}) {
    const { handleDismiss, handlePress } = useReadNotification(notification, onDismiss)

    return (
        <Card style={styles.notificationCard} onPress={handlePress} disabled={notification.read}>
            <View>
                <View style={styles.headerRow}>
                    <View style={styles.iconContainer}>
                        <CategoryIcon type="expense" category="bell" size={20} />
                    </View>

                    <View style={styles.contentContainer}>
                        <Text
                            size={16}
                            weight="600"
                            color={Colors.text_light}
                            lineHeight={20}
                            numberOfLines={2}
                            style={{ marginBottom: 4 }}
                        >
                            {notification.message.title}
                        </Text>
                    </View>
                </View>

                <Text size={14} color={Colors.text_light} lineHeight={18} opacity={0.85} style={{ marginBottom: 10 }}>
                    {notification.message.body}
                </Text>

                <View style={[styles.footerRow]}>
                    <Text size={12} weight="500" color={Colors.secondary_light_1}>
                        {`${notification.read ? "" : "Not read, "} ${formatTimeAgo(notification.sendAt)}`.trim()}
                    </Text>
                </View>
            </View>
            <TouchableOpacity
                style={styles.dismissButton}
                onPress={handleDismiss}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                activeOpacity={0.7}
            >
                <Text size={16} weight="bold" color={Colors.text_light} lineHeight={16}>
                    ×
                </Text>
            </TouchableOpacity>
        </Card>
    )
}

const styles = StyleSheet.create({
    notificationCard: {
        borderRadius: 16,
        marginBottom: 12,
    },
    blurContainer: {
        flex: 1,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
        gap: 5,
    },
    iconContainer: {
        marginRight: 14,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
    },
    contentContainer: {
        flex: 1,
        minHeight: 0,
    },
    footerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 2,
    },
    typeTag: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        backgroundColor: "rgba(255, 255, 255, 0.15)",
    },
    typeTagText: {
        fontSize: 11,
        fontFamily: FONTS.semibold,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        color: Colors.text_light,
        opacity: 0.8,
    },
    dismissButton: {
        position: "absolute",
        right: 8,
        top: 8,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
        opacity: 0.8,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
})
