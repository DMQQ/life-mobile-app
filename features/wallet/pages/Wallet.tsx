import Header, { HeaderItem } from "@/components/ui/Header/Header"
import Colors from "@/constants/Colors"
import Color from "color"
import useTrackScroll from "@/utils/hooks/ui/useTrackScroll"
import { Feather } from "@expo/vector-icons"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"
import Haptic from "react-native-haptic-feedback"
import Animated, { FadeOut } from "react-native-reanimated"
import InitializeWallet from "../components/Wallet/InitializeWallet"
import WalletLoader from "../components/Wallet/WalletLoader"
import { useWalletContext } from "../components/WalletContext"
import useWalletOverview from "../hooks/useWalletOverview"
import { router, useLocalSearchParams } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { Expense, MonthlyExpenses, Subscription } from "@/types"
import SubscriptionItem from "../components/Subscription/SubscriptionItem"
import Background from "@/components/ui/Background"
import CategoryBreakdown from "../components/Wallet/CategoryBreakdown"
import SubAccountCards from "../components/Wallet/SubAccountCards"
import YearlySpendingsChart from "../components/Wallet/YearlySpendingsChart"
import WalletItem from "../components/Wallet/WalletItem"
import GroupSelector from "@/components/ui/GroupSelector"
import Section from "@/components/ui/Section"
import Text from "@/components/ui/Text/Text"
import dayjs from "dayjs"
import GlassView from "@/components/ui/GlassView"

const TABS = [
    { label: "Accounts", value: "accounts" as string },
    { label: "Spendings", value: "spendings" as string },
]

export default function WalletScreen() {
    const { data, loading, error } = useWalletOverview()
    const { dispatch, filters } = useWalletContext()
    const [scrollY, onScroll] = useTrackScroll({ screenName: "WalletScreens" })
    const [tab, setTab] = useState("accounts")
    const { expenseId } = useLocalSearchParams<{ expenseId?: string }>()

    useEffect(() => {
        if (expenseId && data?.wallet) {
            const found = (data.wallet.expenses2 as MonthlyExpenses[])
                .flatMap((m) => m.expenses)
                .find((e) => (e as Expense).id === expenseId) as Expense
            router.setParams({ expenseId: undefined })
            router.push({
                pathname: "/(tabs)/wallet/expense/[id]",
                params: { id: expenseId, expense: found },
            })
        }
    }, [expenseId])

    const balance = loading && data?.wallet?.balance === undefined ? " ..." : (data?.wallet?.balance || 0).toFixed(2)

    const handleShowEditSheet = useCallback(() => {
        Haptic.trigger("impactMedium")
        router.push("/(tabs)/wallet/edit-balance")
    }, [])

    const recentExpenses = useMemo(
        () => (data?.wallet?.expenses2 ?? []).flatMap((m) => m.expenses as unknown as Expense[]).slice(0, 6),
        [data?.wallet?.expenses2],
    )

    const upcomingSubscriptions = useMemo(() => {
        const now = dayjs()
        const weekFromNow = now.add(7, "day")
        return ((data?.subscriptions ?? []) as Subscription[])
            .filter((s) => {
                if (!s.isActive) return false
                const billingDate = dayjs(parseInt(s.nextBillingDate))
                return billingDate.isAfter(now) && billingDate.isBefore(weekFromNow)
            })
            .sort((a, b) => parseInt(a.nextBillingDate) - parseInt(b.nextBillingDate))
    }, [data?.subscriptions])

    const selectedMonth = dayjs(filters.date.from).get("month")

    const buttons = useMemo(
        () =>
            [
                {
                    icon: <Feather name="more-vertical" size={20} color={Colors.foreground} />,
                    onPress: () => {},
                    contextMenu: {
                        items: [
                            {
                                title: "Limits",
                                systemImage: "gauge",
                                onPress: () => router.push("/(tabs)/wallet/spending-limits"),
                            },
                            {
                                title: "Edit Balance",
                                systemImage: "pencil.and.outline",
                                onPress: handleShowEditSheet,
                            },
                            {
                                title: "Filters",
                                systemImage: "camera.filters",
                                onPress: () => router.push("/(tabs)/wallet/filters"),
                            },
                            {
                                title: "Correction Rules",
                                systemImage: "arrow.left.arrow.right",
                                onPress: () => router.push("/(tabs)/wallet/correction-maps"),
                            },
                        ],
                    },
                },
                {
                    onPress: () => router.push("/(tabs)/wallet/charts"),
                    icon: <Feather name="bar-chart-2" size={20} color={Colors.foreground} />,
                },
                {
                    position: "right",
                    standalone: true,
                    icon: <Feather name="plus" size={20} color={Colors.foreground} />,
                    contextMenu: {
                        items: [
                            {
                                title: "Add Expense",
                                systemImage: "arrow.up.right",
                                onPress: () => router.push("/(tabs)/wallet/create-expense"),
                            },
                            {
                                title: "Add Subscription",
                                systemImage: "repeat",
                                onPress: () => router.push("/(tabs)/wallet/subscription/[id]/edit"),
                            },
                        ],
                    },
                },
            ] as HeaderItem[],
        [handleShowEditSheet],
    )

    const header = useMemo(
        () => (
            <Header
                scrollY={scrollY}
                animated={true}
                buttons={buttons}
                goBack={false}
                animatedValue={parseFloat(balance)}
                animatedValueLoading={loading && data?.wallet?.balance === undefined}
                animatedValueFormat={(value) => `${value.toFixed(2)}zł`}
                animatedSubtitle="Total balance across all accounts"
                onAnimatedTitleLongPress={handleShowEditSheet}
            />
        ),
        [balance, loading, buttons],
    )

    if (
        (Array.isArray(error?.cause?.extensions)
            ? (error as any)?.cause?.extensions?.[0]?.response?.statusCode
            : (error as any)?.cause?.extensions?.response?.statusCode) === 404
    )
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <InitializeWallet />
            </SafeAreaView>
        )

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Background />
            {loading && (
                <Animated.View
                    exiting={FadeOut.duration(250).delay(250)}
                    style={[StyleSheet.absoluteFill, styles.overlay]}
                >
                    <WalletLoader />
                </Animated.View>
            )}
            {header}
            <Animated.ScrollView
                onScroll={onScroll}
                scrollEventThrottle={16}
                contentContainerStyle={styles.contentContainer}
            >
                <View style={styles.tabSection}>
                    <View style={styles.tabRow}>
                        <Text style={styles.tabTitle}>{tab === "accounts" ? "Accounts" : "Spendings"}</Text>
                        <View style={styles.tabSelectorWrap}>
                            <GroupSelector size="small" options={TABS} value={tab} onChange={setTab} />
                        </View>
                    </View>
                    {tab === "accounts" ? (
                        <SubAccountCards />
                    ) : (
                        <YearlySpendingsChart
                            selectedBar={selectedMonth}
                            onBarPress={(monthIndex) => {
                                if (monthIndex === selectedMonth) {
                                    dispatch({ type: "RESET" })
                                    return
                                }
                                const month = dayjs().set("month", monthIndex)
                                dispatch({
                                    type: "SET_DATE_MIN",
                                    payload: month.startOf("month").format("YYYY-MM-DD"),
                                })
                                dispatch({
                                    type: "SET_DATE_MAX",
                                    payload: month.endOf("month").format("YYYY-MM-DD"),
                                })
                            }}
                        />
                    )}
                </View>

                <View style={styles.quickNav}>
                    <GlassView style={styles.quickNavCard}>
                        <Pressable
                            onPress={() => {
                                Haptic.trigger("impactLight")
                                router.push("/(tabs)/wallet/expenses-list")
                            }}
                        >
                            <View style={styles.quickNavIconWrap}>
                                <Feather name="list" size={20} color={Colors.secondary} />
                            </View>
                            <Text style={styles.quickNavTitle}>Expenses</Text>
                            <Text style={styles.quickNavSub}>All transactions</Text>
                        </Pressable>
                    </GlassView>
                    <GlassView style={styles.quickNavCard}>
                        <Pressable
                            onPress={() => {
                                Haptic.trigger("impactLight")
                                router.push("/(tabs)/wallet/subscriptions-list")
                            }}
                        >
                            <View style={styles.quickNavIconWrap}>
                                <Feather name="repeat" size={20} color={Colors.secondary} />
                            </View>
                            <Text style={styles.quickNavTitle}>Subscriptions</Text>
                            <Text style={styles.quickNavSub}>Recurring payments</Text>
                        </Pressable>
                    </GlassView>
                </View>

                {upcomingSubscriptions.length > 0 && (
                    <Section
                        title="Upcoming"
                        headerRight={
                            <Pressable onPress={() => router.push("/(tabs)/wallet/subscriptions-list")} hitSlop={8}>
                                <Text style={styles.seeAll}>See all</Text>
                            </Pressable>
                        }
                    >
                        {upcomingSubscriptions.map((sub, index) => (
                            <SubscriptionItem
                                key={sub.id}
                                subscription={sub as any}
                                index={index}
                                onPress={() => router.push({ pathname: "/(tabs)/wallet/subscription/[id]", params: { id: sub.id } })}
                                style={{
                                    borderWidth: 0,
                                    marginBottom: 0,
                                    borderRadius: 0,
                                    borderBottomWidth: upcomingSubscriptions.length - 1 === index ? 0 : 1,
                                    marginTop: 0,
                                }}
                            />
                        ))}
                    </Section>
                )}

                {recentExpenses.length > 0 && (
                    <Section
                        title="Recent"
                        headerRight={
                            <Pressable onPress={() => router.push("/(tabs)/wallet/expenses-list")} hitSlop={8}>
                                <Text style={styles.seeAll}>See all</Text>
                            </Pressable>
                        }
                    >
                        {recentExpenses.map((expense, index) => (
                            <WalletItem
                                key={expense.id}
                                index={index}
                                handlePress={() => router.push({ pathname: "/(tabs)/wallet/expense/[id]", params: { id: expense.id, expense } })}
                                {...(expense as any)}
                                animatedStyle={{
                                    borderWidth: 0,
                                    marginBottom: 0,
                                    borderRadius: 0,
                                    borderBottomWidth: recentExpenses.length - 1 === index ? 0 : 1,
                                    marginTop: 0,
                                }}
                            />
                        ))}
                    </Section>
                )}
            </Animated.ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    overlay: {
        backgroundColor: Colors.primary,
        zIndex: 1000,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 125,
    },
    contentContainer: {
        padding: 15,
        paddingTop: 230,
        paddingBottom: 60,
    },
    tabSection: {
        gap: 15,
    },
    tabRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    tabTitle: {
        fontWeight: "600",
        fontSize: 22.5,
        color: Colors.foreground,
    },
    tabSelectorWrap: {
        width: "50%",
    },
    seeAll: {
        fontSize: 13,
        color: Colors.secondary,
        fontWeight: "600",
        marginRight: 10,
    },
    quickNav: {
        flexDirection: "row",
        gap: 15,
        marginTop: 25,
    },
    quickNavCard: {
        width: "48%",
        borderRadius: 20,
        padding: 15,
        gap: 15,
    },
    quickNavIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: Color(Colors.secondary).alpha(0.12).string(),
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 4,
    },
    quickNavTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: Colors.foreground,
        marginTop: 5,
    },
    quickNavSub: {
        fontSize: 12,
        color: Colors.foreground_secondary,
        fontWeight: "500",
        marginTop: 5,
    },
})
