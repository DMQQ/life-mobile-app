import { FONTS } from "@/constants/Fonts"
import { formatAmount } from "@/utils/functions/formatCurrency"
import Text from "@/components/ui/Text/Text"
import SubscriptionSkeleton from "../components/Subscription/SubscriptionSkeleton"
import { gql, useQuery } from "@apollo/client"
import moment from "moment"
import { useEffect, useState } from "react"
import { StyleSheet, View } from "react-native"
import Header from "@/components/ui/Header/Header"
import Colors from "@/constants/Colors"
import { Expense, Subscription } from "@/types"
import { parseDate } from "@/utils/functions/parseDate"
import Animated, {
    useAnimatedScrollHandler,
    useSharedValue,
    FadeIn,
    FadeInDown,
    ZoomIn,
    Easing,
} from "react-native-reanimated"
import WalletItem, { CategoryIcon } from "../components/Wallet/WalletItem"
import useSubscription from "../hooks/useSubscription"
import { ConfirmDialog, EmptyState } from "@/components"
import Section from "@/components/ui/Section"
import { CollapsibleThemedCalendar } from "@/components/ui/ThemedCalendar/ThemedCalendar"
import dayjs from "dayjs"
import { Toggle, Host } from "@expo/ui/swift-ui"
import { background } from "@expo/ui/swift-ui/modifiers"
import Background from "@/components/ui/Background"
import { CategoryUtils } from "../components/Expense/ExpenseIcon"
import DetailRow from "@/components/ui/DetailRow"

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
                    await sub.renewSubscription({
                        variables: { subscriptionId: subscription!.id },
                    })
                } else {
                    await sub.createSubscription({
                        variables: { expenseId: subscription!.id },
                    })
                }
            } else {
                await sub.cancelSubscription({
                    variables: { subscriptionId: subscription!.id },
                })
            }
            await refetch()
        } catch (e) {
            console.error("Subscription toggle failed:", e)
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

    // if (loading || !subscription) {
    //     return <SubscriptionSkeleton />
    // }

    const tintColor = CategoryUtils.getCategoryColor("subscriptions", "expense")

    const nextBillingDayjs = dayjs(parseInt(subscription?.nextBillingDate || "0"))
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
                goBack
                scrollY={scrollY}
                shadow={false}
                title={subscription?.description}
                buttons={[
                    {
                        icon: "pencil" as any,
                        onPress: () =>
                            navigation.navigate("EditSubscription", {
                                screen: "Form",
                                params: { subscription },
                            }),
                    },
                ]}
            />

            <Background tintColor={tintColor} />

            {loading || !subscription ? (
                <SubscriptionSkeleton />
            ) : (
                <Animated.ScrollView
                    keyboardDismissMode={"on-drag"}
                    onScroll={onScroll}
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingTop: 150 }}
                >
                    <View
                        style={{ width: "100%", height: 200, justifyContent: "center", alignItems: "center", gap: 7.5 }}
                    >
                        <Animated.View entering={ZoomIn.duration(350).easing(Easing.out(Easing.ease))}>
                            <CategoryIcon
                                type="expense"
                                category={"subscriptions"}
                                size={60}
                                containerStyle={{
                                    width: 100,
                                    height: 100,
                                    borderRadius: 100,
                                }}
                            />
                        </Animated.View>
                        <Animated.View entering={FadeIn.delay(80).duration(350)}>
                            <Text size={15} color={Colors.text_dark}>
                                {CategoryUtils.getCategoryName("subscription")}
                            </Text>
                        </Animated.View>
                        <Animated.View entering={FadeInDown.delay(130).duration(320).easing(Easing.out(Easing.ease))}>
                            <Text size={40} weight="800" color="#fff" mono>
                                {formatAmount(subscription?.amount)}zł
                            </Text>
                        </Animated.View>
                        <Animated.View entering={FadeIn.delay(180).duration(350)}>
                            <Text size={15} color={Colors.text_dark}>
                                {subscription?.description}
                            </Text>
                        </Animated.View>
                    </View>

                    <Animated.View
                        entering={FadeInDown.delay(100).duration(320).easing(Easing.out(Easing.ease))}
                        style={{ paddingHorizontal: 15 }}
                    >
                        <Section title="Details" tint={tintColor}>
                            <DetailRow tint={tintColor} icon="refresh-cw">
                                {formatBillingCycle(subscription.billingCycle)} Subscription
                            </DetailRow>

                            {subscription.billingCycle === "custom" && subscription.billingDay != null && (
                                <DetailRow tint={tintColor} icon="calendar">Billing day: {subscription.billingDay}</DetailRow>
                            )}

                            {subscription.billingCycle === "custom" &&
                                (subscription.customBillingMonths?.length ?? 0) > 0 && (
                                    <DetailRow tint={tintColor} style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
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
                                    </DetailRow>
                                )}

                            {subscription.reminderDaysBeforehand != null && (
                                <DetailRow tint={tintColor} icon="bell">
                                    Reminder:{" "}
                                    {subscription.reminderDaysBeforehand === 0
                                        ? "on billing day"
                                        : `${subscription.reminderDaysBeforehand}d before`}
                                </DetailRow>
                            )}

                            <DetailRow tint={tintColor} icon="calendar">Started: {parseDate(+subscription.dateStart)}</DetailRow>

                            <DetailRow tint={tintColor} icon="clock">Running for: {getSubscriptionDuration()}</DetailRow>

                            {subscription.isActive && (
                                <DetailRow tint={tintColor} icon="calendar">
                                    <Text variant="body" style={{ color: isOverdue ? "#F07070" : muted, fontSize: 16 }}>
                                        {isOverdue
                                            ? "Overdue"
                                            : `Next billing: ${parseDate(+subscription.nextBillingDate)}`}
                                    </Text>
                                </DetailRow>
                            )}

                            <DetailRow
                                tint={tintColor}
                                last
                                right={
                                    <Host matchContents modifiers={[background("clear")]}>
                                        <Toggle isOn={subscription.isActive} onIsOnChange={handleToggleChange} />
                                    </Host>
                                }
                            >
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
                                            fontFamily: FONTS.semibold,
                                        }}
                                    >
                                        {subscription.isActive ? "Active" : "Inactive"}
                                    </Text>
                                </View>
                            </DetailRow>
                        </Section>
                    </Animated.View>

                    {subscription.isActive && (
                        <Animated.View
                            entering={FadeInDown.delay(250).duration(320).easing(Easing.out(Easing.ease))}
                            style={{ paddingHorizontal: 15 }}
                        >
                            <Section title="Next Billing" tint={tintColor}>
                                <CollapsibleThemedCalendar
                                    date={calendarDate}
                                    markedDates={{ [calendarDate]: { selected: true } }}
                                />
                            </Section>
                        </Animated.View>
                    )}

                    {subscription.expenses.length > 0 && (
                        <>
                            <Animated.View
                                entering={FadeInDown.delay(400).duration(320).easing(Easing.out(Easing.ease))}
                                style={{ paddingHorizontal: 15 }}
                            >
                                <Section title="Statistics" tint={tintColor}>
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
                                                {formatAmount(totalSpent)}zł
                                            </Text>
                                            <Text variant="caption" style={styles.statLabel}>
                                                Total Spent
                                            </Text>
                                        </View>

                                        <View style={styles.statItem}>
                                            <Text variant="subheading" style={styles.statValue}>
                                                {formatAmount(avgMonthlySpend)}zł
                                            </Text>
                                            <Text variant="caption" style={styles.statLabel}>
                                                Avg Payment
                                            </Text>
                                        </View>
                                    </View>
                                </Section>
                            </Animated.View>

                            <Animated.View
                                entering={FadeInDown.delay(550).duration(320).easing(Easing.out(Easing.ease))}
                                style={{ paddingHorizontal: 15 }}
                            >
                                <Section title="Payment History" tint={tintColor}>
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
                                            containerStyle={{ backgroundColor: undefined }}
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
                            </Animated.View>
                        </>
                    )}

                    {subscription.expenses.length === 0 && (
                        <Animated.View
                            entering={FadeInDown.delay(400).duration(320).easing(Easing.out(Easing.ease))}
                            style={{ marginTop: 15 }}
                        >
                            <EmptyState
                                icon="credit-card"
                                title="No payments yet"
                                description="Payments will appear here once the subscription becomes active"
                            />
                        </Animated.View>
                    )}
                    <View style={{ height: 100 }} />
                </Animated.ScrollView>
            )}

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
        fontFamily: FONTS.bold,
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
