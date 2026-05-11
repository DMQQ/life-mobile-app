import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import moment from "moment"
import Colors from "@/constants/Colors"
import ContextMenu from "react-native-context-menu-view"
import GlassView from "@/components/ui/GlassView"
import { AntDesign } from "@expo/vector-icons"

interface SubscriptionSectionProps {
    hasSubscription: boolean
    isSubscriptionActive: boolean
    selected: any
}

export default function SubscriptionSection({
    hasSubscription,
    isSubscriptionActive,
    selected,
}: SubscriptionSectionProps) {
    if (!hasSubscription) {
        return (
            <View style={styles.card}>
                <Text style={{ color: Colors.text_dark, fontSize: 14, fontStyle: "italic", textAlign: "center" }}>
                    No subscription details available for this expense.
                </Text>
            </View>
        )
    }

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                {hasSubscription && (
                    <View
                        style={[
                            styles.statusPill,
                            {
                                backgroundColor: isSubscriptionActive
                                    ? "rgba(102,232,117,0.15)"
                                    : "rgba(255,255,255,0.07)",
                            },
                        ]}
                    >
                        <View
                            style={[
                                styles.statusDot,
                                { backgroundColor: isSubscriptionActive ? "#66E875" : Colors.text_dark },
                            ]}
                        />
                        <Text
                            style={[
                                styles.statusPillText,
                                { color: isSubscriptionActive ? "#66E875" : Colors.text_dark },
                            ]}
                        >
                            {isSubscriptionActive ? "Active" : "Inactive"}
                        </Text>
                    </View>
                )}
            </View>

            {hasSubscription && (
                <View style={styles.cardDates}>
                    <View style={styles.dateRow}>
                        <Text style={styles.dateLabel}>{isSubscriptionActive ? "Next payment" : "Last payment"}</Text>
                        <Text style={styles.dateValue}>
                            {selected.subscription?.nextBillingDate
                                ? moment(+selected.subscription.nextBillingDate).format("MMM D, YYYY")
                                : "—"}
                        </Text>
                    </View>
                    <View style={styles.dateRow}>
                        <Text style={styles.dateLabel}>{isSubscriptionActive ? "Active since" : "Created on"}</Text>
                        <Text style={styles.dateValue}>
                            {moment(+selected.subscription.dateStart).format("MMM D, YYYY")}
                        </Text>
                    </View>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 15,
        padding: 15,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 4,
    },
    cardTitle: {
        color: Colors.foreground,
        fontSize: 16,
        fontWeight: "600",
    },
    statusPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 100,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusPillText: {
        fontSize: 12,
        fontWeight: "600",
    },
    cardDates: {
        marginTop: 12,
        gap: 8,
    },
    dateRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    dateLabel: {
        color: Colors.text_dark,
        fontSize: 13,
        fontWeight: "500",
    },
    dateValue: {
        color: Colors.foreground_secondary,
        fontSize: 13,
        fontWeight: "500",
    },
    contextMenuTrigger: {
        borderRadius: 10,
        padding: 15,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
    },
    contextMenuTriggerText: {
        color: Colors.foreground,
        fontSize: 14,
        fontWeight: "500",
    },
})
