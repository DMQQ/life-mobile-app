import Header, { HeaderItem } from "@/components/ui/Header/Header"
import Colors from "@/constants/Colors"
import Color from "color"
import useTrackScroll from "@/utils/hooks/ui/useTrackScroll"
import { Feather } from "@expo/vector-icons"
import { useCallback, useEffect, useMemo, useState } from "react"
import { SFSymbol } from "expo-symbols"
import { Pressable, StyleSheet, View } from "react-native"
import Haptic from "react-native-haptic-feedback"
import Animated, { FadeOut } from "react-native-reanimated"
import InitializeWallet from "../components/Wallet/InitializeWallet"
import WalletLoader from "../components/Wallet/WalletLoader"
import { useWalletContext } from "../components/WalletContext"
import useWalletOverview from "../hooks/useWalletOverview"
import { WalletScreens } from "../Main"
import { SafeAreaView } from "react-native-safe-area-context"
import { Expense, MonthlyExpenses, Subscription } from "@/types"
import SubscriptionItem from "../components/Subscription/SubscriptionItem"
import Background from "@/components/ui/Background"
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

export default function WalletScreen({ navigation, route }: WalletScreens<"Wallet">) {
    const { data, loading, error } = useWalletOverview()
    const { dispatch, filters } = useWalletContext()
    const [scrollY, onScroll] = useTrackScroll({ screenName: "WalletScreens" })
    const [tab, setTab] = useState("accounts")

    const balance = loading && data?.wallet?.balance === undefined ? " ..." : (data?.wallet?.balance || 0).toFixed(2)

    const handleShowEditSheet = useCallback(() => {
        Haptic.trigger("impactMedium")
        navigation.navigate("EditBalance")
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

    const selectedMonth = filters.date.from ? dayjs(filters.date.from).get("month") : dayjs().get("month")

    const buttons = useMemo(
        () =>
            [
                {
                    icon: "ellipsis" as SFSymbol,
                    contextMenu: {
                        items: [
                            {
                                title: "Limits",
                                systemImage: "gauge",
                                onPress: () => navigation.navigate("SpendingLimits"),
                            },
                            {
                                title: "Edit Balance",
                                systemImage: "pencil.and.outline",
                                onPress: handleShowEditSheet,
                            },
                            {
                                title: "Filters",
                                systemImage: "camera.filters",
                                onPress: () => navigation.navigate("Filters"),
                            },
                            {
                                title: "Correction Rules",
                                systemImage: "arrow.left.arrow.right",
                                onPress: () => navigation.navigate("CorrectionMaps"),
                            },
                        ],
                    },
                },
                {
                    onPress: () => navigation.navigate("Charts"),
                    icon: "chart.bar.xaxis" as SFSymbol,
                },
                {
                    icon: "plus" as SFSymbol,
                    contextMenu: {
                        items: [
                            {
                                title: "Add Expense",
                                systemImage: "arrow.up.right",
                                onPress: () => navigation.navigate("CreateExpense"),
                            },
                            {
                                title: "Add Subscription",
                                systemImage: "repeat",
                                onPress: () => navigation.navigate("EditSubscription"),
                            },
                        ],
                    },
                },
            ] as HeaderItem[],
        [handleShowEditSheet, navigation],
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
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
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
                    <View style={styles.quickNavCard}>
                        <Pressable
                            onPress={() => {
                                Haptic.trigger("impactLight")
                                navigation.navigate("ExpensesList")
                            }}
                        >
                            <View style={styles.quickNavIconWrap}>
                                <Feather name="list" size={20} color={Colors.secondary} />
                            </View>
                            <Text style={styles.quickNavTitle}>Expenses</Text>
                            <Text style={styles.quickNavSub}>All transactions</Text>
                        </Pressable>
                    </View>
                    <View style={styles.quickNavCard}>
                        <Pressable
                            onPress={() => {
                                Haptic.trigger("impactLight")
                                navigation.navigate("SubscriptionsList")
                            }}
                        >
                            <View style={styles.quickNavIconWrap}>
                                <Feather name="repeat" size={20} color={Colors.secondary} />
                            </View>
                            <Text style={styles.quickNavTitle}>Subscriptions</Text>
                            <Text style={styles.quickNavSub}>Recurring payments</Text>
                        </Pressable>
                    </View>
                </View>

                {upcomingSubscriptions.length > 0 && (
                    <Section
                        title="Upcoming"
                        headerRight={
                            <Pressable onPress={() => navigation.navigate("SubscriptionsList")} hitSlop={8}>
                                <Text style={styles.seeAll}>See all</Text>
                            </Pressable>
                        }
                    >
                        {upcomingSubscriptions.map((sub, index) => (
                            <SubscriptionItem
                                key={sub.id}
                                subscription={sub as any}
                                index={index}
                                onPress={() => navigation.navigate("Subscription", { subscriptionId: sub.id })}
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
                            <Pressable onPress={() => navigation.navigate("ExpensesList")} hitSlop={8}>
                                <Text style={styles.seeAll}>See all</Text>
                            </Pressable>
                        }
                    >
                        {recentExpenses.map((expense, index) => (
                            <WalletItem
                                key={expense.id}
                                index={index}
                                handlePress={() => navigation.navigate("Expense", { expense })}
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
        paddingTop: 200,
        paddingBottom: 100,
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
        flex: 1,
        borderRadius: 20,
        padding: 15,
        gap: 15,
        backgroundColor: Colors.primary_lighter,
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
