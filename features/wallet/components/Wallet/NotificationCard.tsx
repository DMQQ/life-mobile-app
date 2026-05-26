import GlassView from "@/components/ui/GlassView"
import Colors from "@/constants/Colors"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Ripple from "react-native-material-ripple"
import { CategoryIcon } from "../Expense/ExpenseIcon"
import { formatTimeAgo, Notification, useReadNotification } from "./useNotifications"

export default function NotificationCard({
    notification,
    onDismiss,
    index,
}: {
    notification: Notification
    onDismiss: (id: string) => void
    index: number
}) {
    const { handleDismiss, handlePress } = useReadNotification(notification, onDismiss)

    return (
        <View style={styles.notificationCard}>
            <GlassView style={styles.blurContainer}>
                <Ripple
                    disabled={notification.read}
                    onPress={handlePress}
                    rippleColor="rgba(255, 255, 255, 0.1)"
                    rippleDuration={300}
                >
                    <View style={styles.notificationContent}>
                        <View style={styles.headerRow}>
                            <View style={styles.iconContainer}>
                                <CategoryIcon type="expense" category="bell" size={20} />
                            </View>

                            <View style={styles.contentContainer}>
                                <Text style={styles.title} numberOfLines={2}>
                                    {notification.message.title}
                                </Text>
                            </View>
                        </View>

                        <Text style={styles.body}>{notification.message.body}</Text>

                        <View style={[styles.footerRow]}>
                            <Text style={styles.timestamp}>
                                {`${notification.read ? "" : "Not read, "} ${formatTimeAgo(notification.sendAt)}`.trim()}
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={styles.dismissButton}
                            onPress={handleDismiss}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.dismissText}>×</Text>
                        </TouchableOpacity>
                    </View>
                </Ripple>
            </GlassView>
        </View>
    )
}

const styles = StyleSheet.create({
    notificationCard: {
        borderRadius: 16,
        marginBottom: 12,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    blurContainer: {
        flex: 1,
        borderRadius: 20,
    },
    notificationContent: {
        padding: 20,
        paddingRight: 50,
        backgroundColor: "rgba(0, 0, 0, 0.2)",
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
    title: {
        color: Colors.text_light,
        fontSize: 16,
        fontWeight: "600",
        lineHeight: 20,
        marginBottom: 4,
    },
    body: {
        color: Colors.text_light,
        fontSize: 14,
        lineHeight: 18,
        opacity: 0.85,
        marginBottom: 10,
    },
    footerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 2,
    },
    timestamp: {
        color: Colors.secondary_light_1,
        fontSize: 12,
        fontWeight: "500",
    },
    typeTag: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        backgroundColor: "rgba(255, 255, 255, 0.15)",
    },
    typeTagText: {
        fontSize: 11,
        fontWeight: "600",
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
    dismissText: {
        color: Colors.text_light,
        fontSize: 16,
        fontWeight: "bold",
        lineHeight: 16,
    },
})
