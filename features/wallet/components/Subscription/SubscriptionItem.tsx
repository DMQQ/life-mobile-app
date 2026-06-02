import { Card } from "@/components"
import Colors, { secondary_candidates } from "@/constants/Colors"
import moment from "moment"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import Text from "@/components/ui/Text/Text"
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
                    <Text
                        size={14}
                        weight="bold"
                        color={Colors.foreground}
                        style={{ marginLeft: 10, marginBottom: 3 }}
                        numberOfLines={1}
                    >
                        {subscription.description}
                    </Text>
                    <Text size={10} weight="500" color="rgba(255,255,255,0.55)" style={{ marginLeft: 10 }}>
                        {formatBillingCycle(subscription.billingCycle)}
                        {"  ·  "}
                        <Text size={10} weight="500" color={nextColor}>
                            {nextLabel}
                        </Text>
                    </Text>
                </View>

                <View style={styles.priceContainer}>
                    <Text size={16} weight="600" color="#F07070" align="right" mono>
                        -{subscription.amount.toFixed(2)}
                        <Text size={12} color="#F07070">
                            zł
                        </Text>
                    </Text>
                    {subscription.totalSpent != null && subscription.totalSpent > 0 && (
                        <Text
                            size={10}
                            weight="500"
                            color="rgba(255,255,255,0.35)"
                            align="right"
                            style={{ marginTop: 2 }}
                        >
                            {subscription.totalSpent.toFixed(2)}
                            <Text size={10} color="rgba(255,255,255,0.35)">
                                {" "}
                                zł total
                            </Text>
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
    priceContainer: {
        flex: 2,
        height: 48,
        justifyContent: "center",
        alignItems: "flex-end",
    },
})
