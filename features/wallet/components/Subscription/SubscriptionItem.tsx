import { Card } from "@/components"
import Colors, { secondary_candidates } from "@/constants/Colors"
import moment from "moment"
import { useMemo } from "react"
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
        expenses: {
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
    const cycles: { [key: string]: string } = {
        daily: "Daily",
        weekly: "Weekly",
        monthly: "Monthly",
        yearly: "Yearly",
        quarterly: "Quarterly",
    }
    return cycles[cycle.toLowerCase()] || cycle
}

function parseDateToText(date: string) {
    const providedDate = moment(parseInt(date))
    const today = moment()
    const tomorrow = moment().add(1, "days")

    if (providedDate.isSame(today, "day")) {
        return "Today"
    }
    if (providedDate.isSame(tomorrow, "day")) {
        return "Tomorrow"
    }
    if (providedDate.isAfter(today) && providedDate.diff(today, "days") <= 7) {
        return providedDate.format("dddd")
    }
    return providedDate.format("MMM DD")
}

function getSubscriptionDuration(startDate: string) {
    const start = moment(startDate)
    const now = moment()
    const duration = moment.duration(now.diff(start))

    const years = duration.years()
    const months = duration.months()
    const days = duration.days()

    if (years > 0) {
        return `${years}y ${months}m`
    } else if (months > 0) {
        return `${months}m ${days}d`
    } else if (days > 0) {
        return `${days} days`
    } else {
        return "Started today"
    }
}

export default function SubscriptionItem({ subscription, index, onPress }: SubscriptionItemProps) {
    const totalSpent = subscription.expenses.reduce((sum, expense) => sum + expense.amount, 0)
    const daysUntilNext = moment(parseInt(subscription.nextBillingDate)).diff(moment(), "days")
    const isOverdue = daysUntilNext < 0

    const expenses = useMemo(() => {
        const copy = [...subscription.expenses]

        copy.sort((a, b) => moment(b.date).diff(moment(a.date)))

        return copy
    }, [subscription.expenses])

    const subscriptionDuration = getSubscriptionDuration(expenses[expenses.length - 1]?.date || subscription.dateStart)

    return (
        <Card
            ripple
            animated
            layout={LinearTransition}
            entering={FadeIn.delay((index + 1) * 50)}
            style={[styles.container, styles.subscriptionItem]}
            onPress={() => {
                onPress()
            }}
        >
            <View style={styles.iconContainer}>
                <CategoryIcon type="expense" category="subscriptions" />
            </View>

            <View style={styles.contentContainer}>
                <View style={styles.topRow}>
                    <Text style={styles.title} numberOfLines={1}>
                        {subscription.description}
                    </Text>
                    <View style={styles.amountContainer}>
                        <Text style={styles.amount}>
                            -{subscription.amount.toFixed(2)}
                            <Text style={styles.currency}>zł</Text>
                        </Text>
                    </View>
                </View>

                <View style={styles.firstDetailsRow}>
                    <Text style={styles.details}>
                        {formatBillingCycle(subscription.billingCycle)}
                        {" • "}
                        <Text style={{ color: secondary_candidates[2] }}>Running for {subscriptionDuration}</Text>
                    </Text>
                </View>

                <View style={styles.secondDetailsRow}>
                    <Text style={styles.details}>
                        {subscription.isActive ? (
                            <>
                                <Text style={{ color: isOverdue ? "#F07070" : secondary_candidates[0] }}>
                                    {isOverdue ? "Overdue" : `Next: ${parseDateToText(subscription.nextBillingDate)}`}
                                </Text>
                            </>
                        ) : (
                            <Text style={{ color: "#F07070" }}>Inactive</Text>
                        )}
                        {subscription.expenses.length > 0 && (
                            <>
                                {" • "}
                                <Text style={{ color: secondary_candidates[1] }}>
                                    {subscription.expenses.length} payment
                                    {subscription.expenses.length !== 1 ? "s" : ""}
                                </Text>
                            </>
                        )}
                    </Text>
                </View>

                {totalSpent > 0 && (
                    <View style={styles.totalRow}>
                        <Text style={styles.totalSpent}>Total spent: {totalSpent.toFixed(2)}zł</Text>
                    </View>
                )}
            </View>
        </Card>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    subscriptionItem: {
        minHeight: 100,
        borderRadius: 20,
        flexDirection: "row",
        alignItems: "flex-start",
    },
    iconContainer: {
        marginTop: 2,
        marginRight: 16,
    },
    contentContainer: {
        flex: 1,
        padding: 5,
    },
    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 10,
    },
    title: {
        color: Colors.foreground,
        fontSize: 17,
        fontWeight: "bold",
        flex: 1,
        marginRight: 15,
        lineHeight: 22,
    },
    amountContainer: {
        alignItems: "flex-end",
    },
    amount: {
        color: "#F07070",
        fontSize: 17,
        fontWeight: "600",
    },
    currency: {
        fontSize: 15,
    },
    firstDetailsRow: {
        marginBottom: 6,
    },
    secondDetailsRow: {
        marginBottom: 6,
    },
    details: {
        color: "#9f9f9f",
        fontSize: 14,
        lineHeight: 20,
    },
    totalRow: {
        marginTop: 4,
    },
    totalSpent: {
        color: "rgba(255,255,255,0.8)",
        fontSize: 13,
        fontStyle: "italic",
    },
    inactiveIndicator: {
        marginLeft: 12,
        marginTop: 2,
    },
    inactiveText: {
        color: "#F07070",
        fontSize: 20,
        fontWeight: "bold",
    },
    expanded: {
        padding: 20,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.1)",
    },
    expandedTitle: {
        color: Colors.text_light,
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 15,
    },
    expenseItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: Colors.primary,
        borderRadius: 12,
        marginBottom: 8,
    },
    expenseLeft: {
        flex: 1,
    },
    expenseDescription: {
        color: Colors.foreground,
        fontSize: 15,
        fontWeight: "500",
        marginBottom: 4,
        lineHeight: 20,
    },
    expenseDate: {
        color: "#9f9f9f",
        fontSize: 12,
    },
    expenseAmount: {
        color: "#F07070",
        fontSize: 15,
        fontWeight: "600",
        marginLeft: 15,
    },
    moreText: {
        color: "rgba(255,255,255,0.6)",
        fontSize: 13,
        textAlign: "center",
        marginTop: 12,
        fontStyle: "italic",
    },
})
