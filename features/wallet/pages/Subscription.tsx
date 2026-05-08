import Text from "@/components/ui/Text/Text"
import { gql, useQuery } from "@apollo/client"
import { Feather } from "@expo/vector-icons"
import moment from "moment"
import React, { useEffect, useState } from "react"
import { ActivityIndicator, StyleSheet, View } from "react-native"
import Ripple from "react-native-material-ripple"

import Header from "@/components/ui/Header/Header"
import Colors from "@/constants/Colors"
import { Expense, Subscription } from "@/types"
import lowOpacity from "@/utils/functions/lowOpacity"
import { parseDate } from "@/utils/functions/parseDate"
import Animated, {
    Extrapolation,
    interpolate,
    SharedValue,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
} from "react-native-reanimated"
import WalletItem, { CategoryIcon } from "../components/Wallet/WalletItem"
import useSubscription from "../hooks/useSubscription"
import getModalMarginTop from "../utils/modalMarginTop"
import { ConfirmDialog, EmptyState } from "@/components"

interface SubscriptionDetailsProps {
    route: { params: { subscriptionId: string } }
    navigation: any
}

const Txt = ({
    children,
    size,
    color = Colors.secondary,
}: {
    children: React.ReactNode
    size: number
    color?: string
}) => (
    <Text
        variant={size >= 24 ? "subheading" : size >= 20 ? "subtitle" : "body"}
        style={{
            color,
            fontSize: size,
            fontWeight: "bold",
            lineHeight: size + 7.5,
        }}
    >
        {children}
    </Text>
)

const SUBSCRIPTION_QUERY = gql`
    query Subscription($id: String!) {
        subscription(id: $id) {
            id
            amount
            dateStart
            dateEnd
            description
            isActive
            nextBillingDate
            billingCycle
            billingDay
            customBillingMonths
            reminderDaysBeforehand
            expenses {
                id
                amount
                date
                description
                category
                balanceBeforeInteraction
                note
            }
        }
    }
`

export default function SubscriptionDetails({ route, navigation }: SubscriptionDetailsProps) {
    const { subscriptionId } = route.params

    const { data, loading, error, refetch } = useQuery(SUBSCRIPTION_QUERY, {
        variables: { id: subscriptionId },
    })

    const [subscription, setSubscription] = useState<Subscription | null>(null)
    const [confirmAction, setConfirmAction] = useState(false)

    useEffect(() => {
        if (data?.subscription) {
            setSubscription(data.subscription as Subscription)
        }
    }, [data?.subscription])

    const formatBillingCycle = (cycle: Pick<Subscription, "billingCycle">["billingCycle"]) => {
        const cycles = {
            daily: "Daily",
            weekly: "Weekly",
            monthly: "Monthly",
            yearly: "Yearly",
            custom: "Custom",
        }
        return cycles[cycle] || cycle
    }

    const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    const getSubscriptionDuration = () => {
        const start = moment(subscription?.dateStart ? new Date(+subscription?.dateStart) : new Date())
        const now = moment()
        const duration = moment.duration(now.diff(start))

        const years = duration.years()
        const months = duration.months()
        const days = duration.days()

        if (years > 0) return `${years}y ${months}m`
        if (months > 0) return `${months}m ${days}d`
        if (days > 0) return `${days} days`
        return "Started today"
    }

    const totalSpent = subscription?.expenses.reduce((sum, expense) => sum + expense.amount, 0) || 0
    const avgMonthlySpend =
        (subscription?.expenses?.length || 0) > 0 ? totalSpent / (subscription?.expenses?.length || 0) : 0
    const daysUntilNext = moment(parseInt(subscription?.nextBillingDate || "0")).diff(moment(), "days")
    const isOverdue = daysUntilNext < 0

    const sortedExpenses = [...(subscription?.expenses || [])].sort((a, b) => moment(b.date).diff(moment(a.date)))

    const sub = useSubscription()
    const isSubscriptionLoading =
        sub.createSubscriptionState.loading || sub.cancelSubscriptionState.loading || sub.renewSubscriptionState.loading

    const hasSubscription = !!subscription?.id
    const isSubscriptionActive = hasSubscription && subscription?.isActive

    const handleSubscriptionConfirm = async () => {
        try {
            if (isSubscriptionActive && subscription?.id) {
                const result = await sub.cancelSubscription({
                    variables: { subscriptionId: subscription.id },
                })
                if (result.data?.cancelSubscription) {
                    setSubscription(result.data.cancelSubscription.subscription as Subscription)
                    refetch()
                }
            } else if (hasSubscription && !isSubscriptionActive) {
                const result = await sub.renewSubscription({
                    variables: { subscriptionId: subscription!.id },
                })
                if (result.data?.renewSubscription) {
                    setSubscription(result.data.renewSubscription.subscription as Subscription)
                    refetch()
                }
            } else {
                const result = await sub.createSubscription({
                    variables: { expenseId: subscription!.id },
                })
                if (result.data?.createSubscription) {
                    setSubscription(result.data.createSubscription.subscription as Subscription)
                    refetch()
                }
            }
        } catch {
        } finally {
            setConfirmAction(false)
        }
    }

    const handleExpensePress = (expense: Expense) => {
        navigation.navigate("Expense", { expense })
    }

    const scrollY = useSharedValue(0)

    const onScroll = useAnimatedScrollHandler({
        onScroll: (ev) => {
            scrollY.value = ev.contentOffset.y
        },
    })

    if (loading || !subscription) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.secondary} />
            </View>
        )
    }

    return (
        <View style={{ flex: 1 }}>
            <Header
                animated
                animatedTitle={subscription.description}
                initialHeight={60}
                titleAnimatedStyle={{ flexWrap: "nowrap" }}
                scrollY={scrollY}
                buttons={[
                    {
                        icon: <Feather name="edit-2" size={20} color={Colors.foreground} />,
                        onPress: () => navigation.navigate("EditSubscription", { subscription }),
                    },
                ]}
                initialTitleFontSize={subscription?.description?.length > 25 ? 40 : 50}
                animatedSubtitle={`Amount: ${subscription.amount.toFixed(2)}zł`}
                subtitleStyles={{ fontSize: 25, color: Colors.secondary_light_2, marginTop: 10, fontWeight: "600" }}
                renderAnimatedItem={({ scrollY }) => (
                    <AnimatedSubscriptionHeader scrollY={scrollY!} subscription={subscription} />
                )}
            />

            <Animated.ScrollView
                keyboardDismissMode={"on-drag"}
                onScroll={onScroll}
                style={{ flex: 1, paddingTop: getModalMarginTop(subscription.description) }}
            >
                <View style={{ marginBottom: 30, paddingHorizontal: 15 }}>
                    <View style={{ borderRadius: 15, backgroundColor: Colors.primary_light }}>
                        <View style={[styles.row, { paddingVertical: 0, paddingLeft: 5 }]}>
                            <CategoryIcon type="expense" category="subscriptions" />
                            <Text variant="body" style={{ color: Colors.secondary_light_2 }}>
                                {formatBillingCycle(subscription.billingCycle)} Subscription
                            </Text>
                        </View>

                        {subscription.billingCycle === "custom" && subscription.billingDay != null && (
                            <View style={styles.row}>
                                <Feather
                                    name="calendar"
                                    size={24}
                                    color={Colors.ternary}
                                    style={{ paddingHorizontal: 7.5, padding: 2.5 }}
                                />
                                <Text variant="body" style={{ color: Colors.secondary_light_2 }}>
                                    Billing day: {subscription.billingDay}
                                </Text>
                            </View>
                        )}

                        {subscription.billingCycle === "custom" && (subscription.customBillingMonths?.length ?? 0) > 0 && (
                            <View style={[styles.row, { flexDirection: "column", alignItems: "flex-start", gap: 8 }]}>
                                <Text variant="body" style={{ color: Colors.secondary_light_2 }}>
                                    Active months:
                                </Text>
                                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                                    {subscription.customBillingMonths!.map((m) => (
                                        <View
                                            key={m}
                                            style={{
                                                paddingHorizontal: 10,
                                                paddingVertical: 4,
                                                borderRadius: 20,
                                                backgroundColor: Colors.secondary + "33",
                                            }}
                                        >
                                            <Text variant="body" style={{ color: Colors.secondary, fontSize: 12 }}>
                                                {MONTH_NAMES[m - 1]}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {subscription.reminderDaysBeforehand != null && (
                            <View style={styles.row}>
                                <Feather
                                    name="bell"
                                    size={24}
                                    color={Colors.ternary}
                                    style={{ paddingHorizontal: 7.5, padding: 2.5 }}
                                />
                                <Text variant="body" style={{ color: Colors.secondary_light_2 }}>
                                    Reminder:{" "}
                                    {subscription.reminderDaysBeforehand === 0
                                        ? "on billing day"
                                        : `${subscription.reminderDaysBeforehand}d before`}
                                </Text>
                            </View>
                        )}

                        <View style={styles.row}>
                            <Feather
                                name={subscription.isActive ? "play-circle" : "pause-circle"}
                                size={24}
                                color={Colors.ternary}
                                style={{ paddingHorizontal: 7.5, padding: 2.5 }}
                            />
                            <Text variant="body" style={{ color: Colors.secondary_light_2 }}>
                                Status:{" "}
                                <View
                                    style={{
                                        padding: 2.5,
                                        paddingHorizontal: 7.5,
                                        backgroundColor: subscription.isActive ? "green" : Colors.error,
                                        borderRadius: 10,
                                        marginTop: -3.5,
                                        alignItems: "center",
                                    }}
                                >
                                    <Text
                                        variant="body"
                                        style={{ color: Colors.foreground, textTransform: "uppercase" }}
                                    >
                                        {subscription.isActive ? " Active" : " Inactive"}
                                    </Text>
                                </View>
                            </Text>
                        </View>

                        <View style={styles.row}>
                            <Feather
                                name="calendar"
                                size={24}
                                color={Colors.ternary}
                                style={{ paddingHorizontal: 7.5, padding: 2.5 }}
                            />
                            <Text variant="body" style={{ color: Colors.secondary_light_2 }}>
                                Started: {parseDate(+subscription.dateStart)}
                            </Text>
                        </View>

                        <View style={styles.row}>
                            <Feather
                                name="clock"
                                size={24}
                                color={Colors.ternary}
                                style={{ paddingHorizontal: 7.5, padding: 2.5 }}
                            />
                            <Text variant="body" style={{ color: Colors.secondary_light_2 }}>
                                Running for: {getSubscriptionDuration()}
                            </Text>
                        </View>

                        {subscription.isActive && (
                            <View style={styles.row}>
                                <Feather
                                    name="calendar"
                                    size={24}
                                    color={Colors.ternary}
                                    style={{ paddingHorizontal: 7.5, padding: 2.5 }}
                                />
                                <Text
                                    variant="body"
                                    style={{
                                        color: isOverdue ? "#F07070" : Colors.secondary_light_2,
                                    }}
                                >
                                    {isOverdue
                                        ? "Overdue"
                                        : `Next billing: ${parseDate(+subscription.nextBillingDate)}`}
                                </Text>
                            </View>
                        )}

                        <View style={{ padding: 15 }}>
                            <Ripple
                                onPress={() => setConfirmAction(true)}
                                disabled={isSubscriptionLoading}
                                style={[
                                    styles.row,
                                    {
                                        marginTop: 10,
                                        justifyContent: "center",
                                        backgroundColor: subscription.isActive
                                            ? "rgba(255,59,48,0.2)"
                                            : "rgba(52,199,89,0.2)",
                                        borderRadius: 10,
                                        paddingVertical: 10,
                                        paddingHorizontal: 15,
                                        borderWidth: 1,
                                        borderColor: subscription.isActive
                                            ? "rgba(255,59,48,0.5)"
                                            : "rgba(52,199,89,0.5)",
                                    },
                                ]}
                            >
                                {isSubscriptionLoading ? (
                                    <ActivityIndicator size="small" color={Colors.foreground} />
                                ) : (
                                    <Text
                                        variant="body"
                                        style={{
                                            color: subscription.isActive
                                                ? "rgba(255,59,48,0.9)"
                                                : "rgba(52,199,89,0.9)",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        {subscription.isActive ? "Disable Subscription" : "Renew Subscription"}
                                    </Text>
                                )}
                            </Ripple>
                        </View>
                    </View>
                </View>

                {subscription.expenses.length > 0 && (
                    <>
                        <View style={{ paddingHorizontal: 15, marginBottom: 25 }}>
                            <Txt size={20} color={Colors.text_light}>
                                Statistics
                            </Txt>

                            <View style={[styles.statsContainer, { marginTop: 15 }]}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statValue}>{subscription.expenses.length}</Text>
                                    <Text style={styles.statLabel}>Total Payments</Text>
                                </View>

                                <View style={styles.statItem}>
                                    <Text style={styles.statValue}>{totalSpent.toFixed(2)}zł</Text>
                                    <Text style={styles.statLabel}>Total Spent</Text>
                                </View>

                                <View style={styles.statItem}>
                                    <Text style={styles.statValue}>{avgMonthlySpend.toFixed(2)}zł</Text>
                                    <Text style={styles.statLabel}>Avg Payment</Text>
                                </View>
                            </View>
                        </View>

                        <View style={{ paddingHorizontal: 15, marginBottom: 25 }}>
                            <Txt size={20} color={Colors.text_light}>
                                Payment History
                            </Txt>

                            <View style={{ marginTop: 15 }}>
                                {sortedExpenses.slice(0, 10).map((expense: any) => (
                                    <WalletItem
                                        key={expense.id}
                                        {...expense}
                                        handlePress={() =>
                                            handleExpensePress({
                                                ...expense,
                                                type: "expense",
                                            })
                                        }
                                        type="expense"
                                    />
                                ))}

                                {subscription.expenses.length > 10 && (
                                    <View style={styles.morePaymentsContainer}>
                                        <Text style={styles.morePaymentsText}>
                                            +{subscription.expenses.length - 10} more payments
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </>
                )}

                {subscription.expenses.length === 0 && (
                    <EmptyState
                        icon="credit-card"
                        title="No payments yet"
                        description="Payments will appear here once the subscription becomes active"
                    />
                )}
                <View style={{ height: 350, width: 100 }} />
            </Animated.ScrollView>

            <ConfirmDialog
                isVisible={confirmAction}
                onDismiss={() => setConfirmAction(false)}
                onConfirm={handleSubscriptionConfirm}
                title={isSubscriptionActive ? "Disable Subscription" : "Renew Subscription"}
                description={`Are you sure you want to ${isSubscriptionActive ? "disable" : "renew"} this subscription?`}
                destructive={isSubscriptionActive}
                loading={isSubscriptionLoading}
            />
        </View>
    )
}

const AnimatedSubscriptionHeader = ({
    scrollY,
    subscription,
}: {
    scrollY: SharedValue<number>
    subscription: Subscription
}) => {
    return (
        <Animated.View
            style={[
                useAnimatedStyle(() => {
                    const scrollValue = scrollY?.value ?? 0

                    return {
                        opacity: interpolate(scrollValue, [0, 130, 150, 160], [0, 0, 0.75, 1], Extrapolation.CLAMP),
                        transform: [
                            {
                                translateY: interpolate(scrollValue, [0, 160], [-25, 0], Extrapolation.CLAMP),
                            },
                            { scale: interpolate(scrollValue, [0, 160], [0.5, 1], Extrapolation.CLAMP) },
                        ],
                    }
                }, [scrollY]),
                { paddingHorizontal: 15, paddingLeft: 10 },
            ]}
        >
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingBottom: 15,
                    paddingHorizontal: 5,
                }}
            >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <View
                        style={{
                            backgroundColor: lowOpacity(subscription.isActive ? Colors.secondary : Colors.error, 0.2),
                            paddingHorizontal: 15,
                            paddingVertical: 5,
                            borderRadius: 100,
                            flexDirection: "row",
                        }}
                    >
                        <Text
                            style={{
                                color: subscription.isActive ? Colors.secondary : Colors.error,
                                fontSize: 16,
                                letterSpacing: 0.5,
                                fontWeight: "600",
                            }}
                        >
                            {subscription.isActive ? "Active" : "Inactive"}
                        </Text>
                    </View>
                    <Text
                        style={{
                            color: Colors.foreground_disabled,
                            fontSize: 16,
                        }}
                    >
                        Due on{" "}
                        {moment(parseInt(subscription.nextBillingDate || "0")).diff(moment(), "days") < 0
                            ? "Overdue"
                            : moment(parseInt(subscription.nextBillingDate || "0")).format("DD.MM.YYYY")}
                    </Text>
                </View>
                <Text
                    style={{
                        color: "#F07070",
                        fontSize: 18,
                        fontWeight: 600,
                    }}
                >
                    -{subscription?.amount.toFixed(2)}zł
                </Text>
            </View>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.primary,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 15,
        borderRadius: 15,
        backgroundColor: Colors.primary_light,
        marginTop: 10,
    },
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: Colors.primary_light,
        borderRadius: 15,
        padding: 20,
    },
    statItem: {
        alignItems: "center",
        flex: 1,
    },
    statValue: {
        color: Colors.foreground,
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5,
    },
    statLabel: {
        color: Colors.secondary_light_2,
        fontSize: 12,
        textAlign: "center",
    },
    morePaymentsContainer: {
        alignItems: "center",
        paddingVertical: 15,
    },
    morePaymentsText: {
        color: "rgba(255,255,255,0.6)",
        fontSize: 14,
        fontStyle: "italic",
    },
})
