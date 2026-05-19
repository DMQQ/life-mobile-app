import { Card } from "@/components"
import Colors, { secondary_candidates } from "@/constants/Colors"
import moment from "moment"
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native"
import { FadeIn } from "react-native-reanimated"
import { CategoryIcon } from "../Expense/ExpenseIcon"

interface SubscriptionItemProps {
    subscription: {
        id: string
        amount: number
        dateStart: string
        dateEnd?: string | null
        description: string
        isActive: boolean
        nextBillingDate: string
        billingCycle: string
        billingDay?: number | null
        customBillingMonths?: number[] | null
        reminderDaysBeforehand?: number | null
        totalSpent?: number
        totalAmount?: number
        totalDuration?: number
        expenses?: {
            amount: number
            id: string
            date: string
            description: string
            category?: string
        }[]
    }
    index: number
    onPress: () => void
    style?: StyleProp<ViewStyle>
}

function formatBillingCycle(cycle: string) {
    const cycles: Record<string, string> = {
        daily: "Daily",
        weekly: "Weekly",
        monthly: "Monthly",
        yearly: "Yearly",
        quarterly: "Quarterly",
        custom: "Custom",
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

export default function SubscriptionItem({ subscription, index, onPress, style }: SubscriptionItemProps) {
    const daysUntilNext = moment(parseInt(subscription?.nextBillingDate || "0")).diff(moment(), "days")
    const isOverdue = daysUntilNext < 0

    const nextLabel = subscription.isActive
        ? isOverdue
            ? "Overdue"
            : parseDateToText(subscription?.nextBillingDate)
        : "Inactive"

    const nextColor = !subscription.isActive ? "#F07070" : isOverdue ? "#F07070" : secondary_candidates[0]

    return (
        <Card
            ripple
            animated
            entering={FadeIn.delay((index + 1) * 50)}
            style={[styles.container, style]}
            onPress={onPress}
        >
            <View style={styles.innerContainer}>
                <CategoryIcon style={{ padding: 0 }} type="expense" category="subscriptions" />

                <View style={styles.descContainer}>
                    <Text style={styles.title} numberOfLines={1}>
                        {subscription.description}
                    </Text>
                    <Text style={styles.meta}>
                        {formatBillingCycle(subscription.billingCycle)}
                        {"  ·  "}
                        <Text style={[styles.meta, { color: nextColor }]}>{nextLabel}</Text>
                    </Text>
                </View>

                <View style={styles.priceContainer}>
                    <Text style={styles.amount}>
                        -{subscription.amount.toFixed(2)}
                        <Text style={styles.currency}>zł</Text>
                    </Text>
                    {subscription.totalSpent != null && subscription.totalSpent > 0 && (
                        <Text style={styles.totalSpent}>
                            {subscription.totalSpent.toFixed(2)}
                            <Text style={styles.totalCurrency}> zł total</Text>
                        </Text>
                    )}
                </View>
            </View>
        </Card>
    )
}

const styles = StyleSheet.create({
    container: {},
    innerContainer: {
        flexDirection: "row",
        height: 48,
        alignItems: "center",
    },
    descContainer: {
        height: 48,
        justifyContent: "center",
        flex: 3,
        overflow: "hidden",
    },
    title: {
        color: Colors.foreground,
        fontSize: 14,
        marginLeft: 10,
        fontWeight: "bold",
        marginBottom: 3,
        textTransform: "capitalize",
    },
    meta: {
        color: "rgba(255,255,255,0.55)",
        fontSize: 10,
        marginLeft: 10,
        fontWeight: "500",
    },
    priceContainer: {
        flex: 2,
        height: 48,
        justifyContent: "center",
        alignItems: "flex-end",
    },
    amount: {
        textAlign: "right",
        color: "#F07070",
        fontSize: 16,
        fontWeight: "600",
    },
    currency: {
        fontSize: 12,
    },
    totalSpent: {
        textAlign: "right",
        color: "rgba(255,255,255,0.35)",
        fontSize: 10,
        fontWeight: "500",
        marginTop: 2,
    },
    totalCurrency: {
        fontSize: 10,
    },
})
