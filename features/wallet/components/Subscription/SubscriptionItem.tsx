import { Card } from "@/components"
import Colors, { secondary_candidates } from "@/constants/Colors"
import moment from "moment"
import { StyleSheet, Text, View } from "react-native"
import { FadeIn, LinearTransition } from "react-native-reanimated"
import { CategoryIcon } from "../Expense/ExpenseIcon"

interface SubscriptionItemProps {
    subscription: {
        id: string
        amount: number
        dateStart: string
        dateEnd: string
        description: string
        isActive: boolean
        nextBillingDate: string
        billingCycle: string
        totalSpent?: number
        totalAmount?: number
        totalDuration?: number
        expenses?: {
            amount: number
            id: string
            date: string
            description: string
            category: string
        }[]
    }
    index: number
    onPress: () => void
}

function formatBillingCycle(cycle: string) {
    const cycles: Record<string, string> = {
        daily: "Daily",
        weekly: "Weekly",
        monthly: "Monthly",
        yearly: "Yearly",
        quarterly: "Quarterly",
    }
    return cycles[cycle.toLowerCase()] || cycle
}

function parseDateToText(date: string) {
    const d = moment(parseInt(date))
    const today = moment()
    if (d.isSame(today, "day")) return "Today"
    if (d.isSame(today.clone().add(1, "day"), "day")) return "Tomorrow"
    if (d.isAfter(today) && d.diff(today, "days") <= 7) return d.format("dddd")
    return d.format("MMM DD")
}

function formatDuration(days: number) {
    if (days >= 365) return `${Math.floor(days / 365)}y ${Math.floor((days % 365) / 30)}m`
    if (days >= 30) return `${Math.floor(days / 30)}m ${days % 30}d`
    if (days > 0) return `${days}d`
    return "Today"
}

export default function SubscriptionItem({ subscription, index, onPress }: SubscriptionItemProps) {
    const daysUntilNext = moment(parseInt(subscription.nextBillingDate)).diff(moment(), "days")
    const isOverdue = daysUntilNext < 0

    const nextLabel = subscription.isActive
        ? isOverdue
            ? "Overdue"
            : parseDateToText(subscription.nextBillingDate)
        : "Inactive"

    const nextColor = !subscription.isActive ? "#F07070" : isOverdue ? "#F07070" : secondary_candidates[0]

    return (
        <Card
            ripple
            animated
            layout={LinearTransition}
            entering={FadeIn.delay((index + 1) * 50)}
            style={styles.card}
            onPress={onPress}
        >
            <View style={styles.row}>
                <CategoryIcon type="expense" category="subscriptions" />

                <View style={styles.body}>
                    <View style={styles.topRow}>
                        <Text style={styles.name} numberOfLines={1}>
                            {subscription.description}
                        </Text>
                        <Text style={styles.amount}>
                            -{subscription.amount.toFixed(2)}
                            <Text style={styles.currency}> zł</Text>
                        </Text>
                    </View>

                    <View style={styles.chips}>
                        <Chip
                            label={formatBillingCycle(subscription.billingCycle)}
                            color="rgba(255,255,255,0.08)"
                            textColor="rgba(255,255,255,0.5)"
                        />
                        <Chip label={nextLabel} color={nextColor + "22"} textColor={nextColor} />
                        {subscription.totalDuration != null && (
                            <Chip
                                label={formatDuration(subscription.totalDuration)}
                                color="rgba(255,255,255,0.05)"
                                textColor="rgba(255,255,255,0.35)"
                            />
                        )}
                        {subscription.totalSpent != null && subscription.totalSpent > 0 && (
                            <Chip
                                label={`Spent: ${subscription.totalSpent.toFixed(2)} zł`}
                                color={secondary_candidates[1] + "22"}
                                textColor={secondary_candidates[1]}
                            />
                        )}

                        {subscription.totalAmount != null && subscription.amount > 0 && (
                            <Chip
                                label={`${Math.round(subscription.totalAmount / subscription.amount)}x`}
                                color="rgba(255,255,255,0.05)"
                                textColor="rgba(255,255,255,0.35)"
                            />
                        )}
                    </View>
                </View>
            </View>
        </Card>
    )
}

function Chip({ label, color, textColor }: { label: string; color: string; textColor: string }) {
    return (
        <View style={[styles.chip, { backgroundColor: color }]}>
            <Text style={[styles.chipText, { color: textColor }]}>{label}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        marginBottom: 15,
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    row: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    iconWrap: {},
    body: {
        flex: 1,
        gap: 8,
    },
    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 8,
    },
    name: {
        flex: 1,
        fontSize: 16,
        fontWeight: "700",
        color: Colors.text_light,
    },
    amount: {
        fontSize: 16,
        fontWeight: "700",
        color: "#F07070",
    },
    currency: {
        fontSize: 13,
        fontWeight: "500",
    },
    chips: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
    },
    chip: {
        paddingHorizontal: 9,
        paddingVertical: 4,
        borderRadius: 20,
    },
    chipText: {
        fontSize: 12,
        fontWeight: "600",
    },
})
