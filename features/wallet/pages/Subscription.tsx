import Text from "@/components/ui/Text/Text"
import SubscriptionSkeleton from "../components/Subscription/SubscriptionSkeleton"
import { gql, useQuery } from "@apollo/client"
import { Feather } from "@expo/vector-icons"
import moment from "moment"
import { useEffect, useState } from "react"
import { StyleSheet, View } from "react-native"

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
import WalletItem from "../components/Wallet/WalletItem"
import useSubscription from "../hooks/useSubscription"
import getModalMarginTop from "../utils/modalMarginTop"
import { ConfirmDialog, EmptyState } from "@/components"
import Section from "@/components/ui/Section"
import { CollapsibleThemedCalendar } from "@/components/ui/ThemedCalendar/ThemedCalendar"
import dayjs from "dayjs"
import { Toggle, Host } from "@expo/ui/swift-ui"
import { background } from "@expo/ui/swift-ui/modifiers"
import Color from "color"

const muted = Colors.foreground_secondary

interface SubscriptionDetailsProps {
    route: { params: { subscriptionId: string } }
    navigation: any
}

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
    const [pendingToggle, setPendingToggle] = useState<boolean | null>(null)

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

    const handleToggleChange = (isOn: boolean) => {
        setPendingToggle(isOn)
        setConfirmAction(true)
    }

    const handleSubscriptionConfirm = async () => {
        try {
            if (pendingToggle) {
                if (hasSubscription && !isSubscriptionActive) {
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
            } else {
                const result = await sub.cancelSubscription({
                    variables: { subscriptionId: subscription!.id },
                })
                if (result.data?.cancelSubscription) {
                    setSubscription(result.data.cancelSubscription.subscription as Subscription)
                    refetch()
                }
            }
        } catch {
        } finally {
            setConfirmAction(false)
            setPendingToggle(null)
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
        return <SubscriptionSkeleton />
    }

    const nextBillingDayjs = dayjs(parseInt(subscription.nextBillingDate || "0"))
    const calendarDate = nextBillingDayjs.isValid()
        ? nextBillingDayjs.format("YYYY-MM-DD")
        : dayjs().format("YYYY-MM-DD")

    const confirmTitle = pendingToggle
        ? hasSubscription && !isSubscriptionActive
            ? "Renew Subscription"
            : "Create Subscription"
        : "Disable Subscription"

    const confirmDescription = pendingToggle
        ? "Are you sure you want to enable this subscription?"
        : "Are you sure you want to disable this subscription?"

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
                        icon: "pencil",
                        onPress: () => navigation.navigate("EditSubscription", { subscription }),
                    },
                ]}
                initialTitleFontSize={subscription?.description?.length > 25 ? 40 : 50}
                animatedSubtitle={`Amount: ${subscription.amount.toFixed(2)}zł`}
                subtitleStyles={{ fontSize: 25, color: muted, marginTop: 10, fontWeight: "400" }}
            />

            <Animated.ScrollView
                keyboardDismissMode={"on-drag"}
                onScroll={onScroll}
                style={{ flex: 1, paddingTop: getModalMarginTop(subscription.description) }}
            >
                <View style={{ paddingHorizontal: 15 }}>
                    <Section title="Details">
                        <View style={styles.detailRow}>
                            <Feather name="refresh-cw" size={20} color={muted} style={styles.icon} />
                            <Text style={styles.detailText}>
                                {formatBillingCycle(subscription.billingCycle)} Subscription
                            </Text>
                        </View>

                        {subscription.billingCycle === "custom" && subscription.billingDay != null && (
                            <View style={styles.detailRow}>
                                <Feather name="calendar" size={20} color={muted} style={styles.icon} />
                                <Text style={styles.detailText}>Billing day: {subscription.billingDay}</Text>
                            </View>
                        )}

                        {subscription.billingCycle === "custom" &&
                            (subscription.customBillingMonths?.length ?? 0) > 0 && (
                                <View
                                    style={[
                                        styles.detailRow,
                                        { flexDirection: "column", alignItems: "flex-start", gap: 8 },
                                    ]}
                                >
                                    <Text style={styles.detailText}>Active months:</Text>
                                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                                        {subscription.customBillingMonths!.map((m) => (
                                            <View key={m} style={styles.monthChip}>
                                                <Text variant="caption" style={{ color: Colors.secondary }}>
                                                    {MONTH_NAMES[m - 1]}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}

                        {subscription.reminderDaysBeforehand != null && (
                            <View style={styles.detailRow}>
                                <Feather name="bell" size={20} color={muted} style={styles.icon} />
                                <Text style={styles.detailText}>
                                    Reminder:{" "}
                                    {subscription.reminderDaysBeforehand === 0
                                        ? "on billing day"
                                        : `${subscription.reminderDaysBeforehand}d before`}
                                </Text>
                            </View>
                        )}

                        <View style={styles.detailRow}>
                            <Feather name="calendar" size={20} color={muted} style={styles.icon} />
                            <Text style={styles.detailText}>Started: {parseDate(+subscription.dateStart)}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Feather name="clock" size={20} color={muted} style={styles.icon} />
                            <Text style={styles.detailText}>Running for: {getSubscriptionDuration()}</Text>
                        </View>

                        {subscription.isActive && (
                            <View style={styles.detailRow}>
                                <Feather name="calendar" size={20} color={muted} style={styles.icon} />
                                <Text style={[styles.detailText, { color: isOverdue ? "#F07070" : muted }]}>
                                    {isOverdue
                                        ? "Overdue"
                                        : `Next billing: ${parseDate(+subscription.nextBillingDate)}`}
                                </Text>
                            </View>
                        )}

                        <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                            <View style={styles.statusChip}>
                                <View
                                    style={[
                                        styles.statusDot,
                                        { backgroundColor: subscription.isActive ? "#66E875" : Colors.text_dark },
                                    ]}
                                />
                                <Text
                                    variant="caption"
                                    style={{
                                        color: subscription.isActive ? "#66E875" : Colors.text_dark,
                                        fontWeight: "600",
                                    }}
                                >
                                    {subscription.isActive ? "Active" : "Inactive"}
                                </Text>
                            </View>

                            <View style={{ width: 150 }}>
                                <Host modifiers={[background("clear")]}>
                                    <Toggle isOn={subscription.isActive} onIsOnChange={handleToggleChange} />
                                </Host>
                            </View>
                        </View>
                    </Section>
                </View>

                {subscription.isActive && (
                    <View style={{ paddingHorizontal: 15 }}>
                        <Section title="Next Billing">
                            <CollapsibleThemedCalendar
                                date={calendarDate}
                                markedDates={{ [calendarDate]: { selected: true } }}
                            />
                        </Section>
                    </View>
                )}

                {subscription.expenses.length > 0 && (
                    <>
                        <View style={{ paddingHorizontal: 15 }}>
                            <Section title="Statistics">
                                <View style={styles.statsContainer}>
                                    <View style={styles.statItem}>
                                        <Text variant="subheading" style={styles.statValue}>
                                            {subscription.expenses.length}
                                        </Text>
                                        <Text variant="caption" style={styles.statLabel}>
                                            Total Payments
                                        </Text>
                                    </View>

                                    <View style={styles.statItem}>
                                        <Text variant="subheading" style={styles.statValue}>
                                            {totalSpent.toFixed(2)}zł
                                        </Text>
                                        <Text variant="caption" style={styles.statLabel}>
                                            Total Spent
                                        </Text>
                                    </View>

                                    <View style={styles.statItem}>
                                        <Text variant="subheading" style={styles.statValue}>
                                            {avgMonthlySpend.toFixed(2)}zł
                                        </Text>
                                        <Text variant="caption" style={styles.statLabel}>
                                            Avg Payment
                                        </Text>
                                    </View>
                                </View>
                            </Section>
                        </View>

                        <View style={{ paddingHorizontal: 15 }}>
                            <Section title="Payment History">
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
                                        animatedStyle={{
                                            marginBottom: 0,
                                            borderWidth: 0,
                                            borderBottomWidth: 1,
                                        }}
                                    />
                                ))}

                                {subscription.expenses.length > 10 && (
                                    <View style={styles.morePaymentsContainer}>
                                        <Text variant="caption" style={styles.morePaymentsText}>
                                            +{subscription.expenses.length - 10} more payments
                                        </Text>
                                    </View>
                                )}
                            </Section>
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
                <View style={{ height: 100 }} />
            </Animated.ScrollView>

            <ConfirmDialog
                isVisible={confirmAction}
                onDismiss={() => {
                    setConfirmAction(false)
                    setPendingToggle(null)
                }}
                onConfirm={handleSubscriptionConfirm}
                title={confirmTitle}
                description={confirmDescription}
                destructive={!pendingToggle}
                loading={isSubscriptionLoading}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 15,
        borderBottomWidth: 1,
        borderColor: Colors.borderColor,
    },
    icon: {
        paddingHorizontal: 7.5,
        padding: 2.5,
    },
    detailText: {
        color: muted,
        fontSize: 16,
    },
    monthChip: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 100,
        backgroundColor: Colors.secondary + "33",
    },
    statusChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 100,
        backgroundColor: "rgba(255,255,255,0.07)",
    },
    statusDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
    },
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        borderRadius: 20,
        padding: 20,
    },
    statItem: {
        alignItems: "center",
        flex: 1,
    },
    statValue: {
        color: Colors.foreground,
        fontWeight: "bold",
        marginBottom: 5,
    },
    statLabel: {
        color: muted,
        textAlign: "center",
    },
    morePaymentsContainer: {
        alignItems: "center",
        paddingVertical: 15,
    },
    morePaymentsText: {
        color: muted,
        fontStyle: "italic",
    },
})
