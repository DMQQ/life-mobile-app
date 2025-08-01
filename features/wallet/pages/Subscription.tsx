import Text from "@/components/ui/Text/Text"
import { gql, useQuery } from "@apollo/client"
import { AntDesign, Feather, MaterialIcons } from "@expo/vector-icons"
import moment from "moment"
import React, { useEffect, useState } from "react"
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native"
import Ripple from "react-native-material-ripple"

import Header from "@/components/ui/Header/Header"
import Colors from "@/constants/Colors"
import { Expense, Subscription } from "@/types"
import lowOpacity from "@/utils/functions/lowOpacity"
import { parseDate } from "@/utils/functions/parseDate"
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
} from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import WalletItem, { CategoryIcon } from "../components/Wallet/WalletItem"
import useSubscription from "../hooks/useSubscription"
import getModalMarginTop from "../utils/modalMarginTop"

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

    useEffect(() => {
        if (data?.subscription) {
            setSubscription(data.subscription)
        }
    }, [data?.subscription])

    const formatBillingCycle = (cycle: Pick<Subscription, "billingCycle">["billingCycle"]) => {
        const cycles = {
            daily: "Daily",
            weekly: "Weekly",
            monthly: "Monthly",
            yearly: "Yearly",
        }
        return cycles[cycle] || cycle
    }

    const getSubscriptionDuration = () => {
        const start = moment(subscription?.dateStart ? new Date(+subscription?.dateStart) : new Date())
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
        }
        return "Started today"
    }

    const totalSpent = subscription?.expenses.reduce((sum, expense) => sum + expense.amount, 0) || 0
    const avgMonthlySpend =
        (subscription?.expenses?.length || 0) > 0 ? totalSpent / (subscription?.expenses?.length || 0) : 0
    const daysUntilNext = moment(parseInt(subscription?.nextBillingDate || "0")).diff(moment(), "days")
    const isOverdue = daysUntilNext < 0

    const sortedExpenses = [...(subscription?.expenses || [])].sort((a, b) => moment(b.date).diff(moment(a.date)))

    const sub = useSubscription()
    const isSubscriptionLoading = sub.createSubscriptionState.loading || sub.cancelSubscriptionState.loading

    const hasSubscription = !!subscription?.id

    const isSubscriptionActive = hasSubscription && subscription?.isActive

    const handleSubscriptionAction = () => {
        const actionTitle = hasSubscription
            ? isSubscriptionActive
                ? "Disable Subscription"
                : "Enable Subscription"
            : "Create Monthly Subscription"

        Alert.alert(actionTitle, `Are you sure you want to ${actionTitle.toLowerCase()}?`, [
            {
                onPress: async () => {
                    try {
                        if (isSubscriptionActive && subscription?.id) {
                            const result = await sub.cancelSubscription({
                                variables: { subscriptionId: subscription.id },
                            })

                            if (result.data?.cancelSubscription) {
                                setSubscription(result.data.cancelSubscription)
                                refetch()
                            }
                        } else {
                            const result = await sub.createSubscription({
                                variables: { expenseId: subscription?.id },
                            })

                            if (result.data?.createSubscription) {
                                setSubscription(result.data.createSubscription)
                                refetch()
                            }
                        }
                    } catch (error) {
                        Alert.alert("Error", "Failed to update subscription. Please try again.")
                    }
                },
                text: "Yes",
            },
            {
                onPress: () => {},
                text: "Cancel",
            },
        ])
    }

    const handleExpensePress = (expense: Expense) => {
        navigation.navigate("Expense", { expense })
    }

    const scrollY = useSharedValue(0)
    const insets = useSafeAreaInsets()

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
                        onPress: () => {},
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

                        <View style={styles.row}>
                            <MaterialIcons
                                name={subscription.isActive ? "play-circle-filled" : "pause-circle-filled"}
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
                            <AntDesign
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
                            <MaterialIcons
                                name="schedule"
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
                                <MaterialIcons
                                    name="event"
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
                                onPress={handleSubscriptionAction}
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
                                        {subscription.isActive ? "Disable Subscription" : "Enable Subscription"}
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
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No payments yet</Text>
                        <Text style={styles.emptySubtext}>
                            Payments will appear here once the subscription becomes active
                        </Text>
                    </View>
                )}
                <View style={{ height: 250, width: 100 }} />
            </Animated.ScrollView>
        </View>
    )
}

const AnimatedSubscriptionHeader = ({
    scrollY,
    subscription,
}: {
    scrollY: Animated.SharedValue<number>
    subscription: Subscription
}) => {
    console.log(JSON.stringify(subscription, null, 2))

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
    emptyContainer: {
        alignItems: "center",
        padding: 40,
    },
    emptyText: {
        color: Colors.foreground,
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 8,
    },
    emptySubtext: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 14,
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
