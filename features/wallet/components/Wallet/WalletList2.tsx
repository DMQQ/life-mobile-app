import ChipButton from "@/components/ui/Button/ChipButton"
import Colors, { Sizing } from "@/constants/Colors"
import Layout from "@/constants/Layout"
import { Expense, Wallet } from "@/types"
import { gql, useQuery } from "@apollo/client"
import { AntDesign } from "@expo/vector-icons"
import { useNavigation, useRoute } from "@react-navigation/native"
import { FlashList } from "@shopify/flash-list"
import Color from "color"
import moment from "moment"
import { useCallback, useEffect, useMemo, useState } from "react"
import { NativeScrollEvent, NativeSyntheticEvent, RefreshControl, StyleSheet, Text, View } from "react-native"
import Ripple from "react-native-material-ripple"
import Animated, { FadeInDown, FadeOutDown, LinearTransition } from "react-native-reanimated"
import useGetSubscriptions from "../../hooks/useGetSubscriptions"
import { getInvalidExpenses } from "../../pages/WalletCharts"
import SubscriptionItem from "../Subscription/SubscriptionItem"
import { init, useWalletContext } from "../WalletContext"
import WalletLimits from "./Limits"
import WalletItem, { parseDateToText } from "./WalletItem"

interface Subscription {
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

interface WalletList2Props {
    wallet?: Wallet
    onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void
    refetch?: () => void
    onEndReached?: () => void
    showSubscriptions?: boolean
    showExpenses?: boolean
}

const AnimatedList = Animated.createAnimatedComponent(FlashList)

type ListItemType =
    | { type: "limits" }
    | { type: "subscription-header"; title: string; count: number; color: string }
    | { type: "subscription"; data: Subscription; index: number }
    | { type: "month-header"; data: { month: string; expenses: Expense[] }; monthIndex: number }
    | { type: "expense"; data: Expense; expenses: Expense[]; index: number; monthIndex: number }
    | { type: "date-header"; date: string; sum: [number, number] }

export default function WalletList2({
    wallet,
    onScroll,
    refetch,
    onEndReached,
    showSubscriptions = true,
    showExpenses = true,
}: WalletList2Props) {
    const route = useRoute<any>()
    const navigation = useNavigation<any>()
    const {
        data: subscriptionsData,
        loading: subscriptionsLoading,
        refetch: refetchSubscriptions,
    } = useGetSubscriptions()

    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        if (wallet?.expenses?.length === undefined) return

        if (route?.params?.expenseId && wallet?.expenses?.length > 0) {
            const expense = wallet.expenses.find((expense) => expense.id === route?.params?.expenseId)

            if (!expense) return

            navigation.setParams({ expenseId: null })

            navigation.navigate("Expense", {
                expense: expense,
            })
        }
    }, [wallet?.expenses?.length])

    const groupedSubscriptions = useMemo(() => {
        if (!subscriptionsData?.subscriptions) return { active: [], inactive: [] }

        const active = subscriptionsData.subscriptions.filter((sub: Subscription) => sub.isActive)
        const inactive = subscriptionsData.subscriptions.filter((sub: Subscription) => !sub.isActive)

        return { active, inactive } as {
            active: Subscription[]
            inactive: Subscription[]
        }
    }, [subscriptionsData?.subscriptions])

    const expenseData = useMemo(() => {
        const sorted = [] as {
            month: string
            expenses: Expense[]
        }[]

        if (!wallet?.expenses) return sorted

        for (const expense of wallet.expenses) {
            const previous = sorted[sorted.length - 1]

            if (previous && moment(previous?.expenses[0]?.date).isSame(expense.date, "month")) {
                previous.expenses.push(expense)
            } else {
                sorted.push({
                    month: expense.date,
                    expenses: [expense],
                })
            }
        }

        return sorted
    }, [wallet?.expenses])

    const calculateDaySum = useCallback((dayExpenses: Expense[]) => {
        const expenses = dayExpenses.reduce((acc, expense) => {
            if (getInvalidExpenses(expense)) return acc
            const value = expense.amount
            return acc + (isNaN(value) ? 0 : value)
        }, 0)

        const income = dayExpenses.reduce((acc, expense) => {
            if (expense.type !== "income") return acc
            const value = expense.amount
            return acc + (isNaN(value) ? 0 : value)
        }, 0)

        return [expenses, income] as [number, number]
    }, [])

    const unifiedData = useMemo(() => {
        const items: ListItemType[] = []

        // Always add limits at the top
        items.push({ type: "limits" })

        // Add subscriptions if enabled
        if (showSubscriptions) {
            if (groupedSubscriptions.active.length > 0) {
                items.push({
                    type: "subscription-header",
                    title: "Active Subscriptions",
                    count: groupedSubscriptions.active.length,
                    color: Colors.secondary,
                })
                groupedSubscriptions.active.forEach((subscription, index) => {
                    items.push({ type: "subscription", data: subscription, index })
                })
            }

            if (groupedSubscriptions.inactive.length > 0) {
                items.push({
                    type: "subscription-header",
                    title: "Inactive Subscriptions",
                    count: groupedSubscriptions.inactive.length,
                    color: "#F07070",
                })
                groupedSubscriptions.inactive.forEach((subscription, index) => {
                    items.push({
                        type: "subscription",
                        data: subscription,
                        index: index + groupedSubscriptions.active.length,
                    })
                })
            }
        }

        // Add expenses if enabled
        if (showExpenses) {
            expenseData.forEach((monthData, monthIndex) => {
                items.push({ type: "month-header", data: monthData, monthIndex })

                let currentDate = ""
                monthData.expenses.forEach((expense, expenseIndex) => {
                    const expenseDate = moment(expense.date).format("YYYY-MM-DD")

                    if (expenseDate !== currentDate) {
                        currentDate = expenseDate
                        const dayExpenses = monthData.expenses.filter((e) => moment(e.date).isSame(expense.date, "day"))
                        const sum = calculateDaySum(dayExpenses)
                        items.push({ type: "date-header", date: expense.date, sum })
                    }

                    items.push({
                        type: "expense",
                        data: expense,
                        expenses: monthData.expenses,
                        index: expenseIndex,
                        monthIndex,
                    })
                })
            })
        }

        return items
    }, [showSubscriptions, showExpenses, groupedSubscriptions, expenseData, calculateDaySum])

    const onRefresh = useCallback(async () => {
        setRefreshing(true)
        if (refetch) refetch()
        if (refetchSubscriptions) refetchSubscriptions()
        setRefreshing(false)
    }, [refetch, refetchSubscriptions])

    const renderItem = useCallback(
        ({ item }: { item: ListItemType }) => {
            switch (item.type) {
                case "limits":
                    return <WalletLimits navigation={navigation} />

                case "subscription-header":
                    return (
                        <Animated.View style={{ marginBottom: 30, marginTop: 30 }} layout={LinearTransition.delay(100)}>
                            <View style={styles.monthRow}>
                                <Text style={styles.monthText}>{item.title}</Text>
                                <View style={[styles.countBadge, { backgroundColor: item.color }]}>
                                    <Text style={styles.countText}>{item.count}</Text>
                                </View>
                            </View>
                        </Animated.View>
                    )

                case "subscription":
                    return (
                        <SubscriptionItem
                            subscription={item.data}
                            index={item.index}
                            onPress={() => {
                                navigation.navigate("Subscription", {
                                    subscriptionId: item.data.id,
                                })
                            }}
                        />
                    )

                case "month-header":
                    return <MonthExpenseHeader monthData={item.data} monthIndex={item.monthIndex} />

                case "date-header":
                    return <DateHeader date={item.date} sum={item.sum} />

                case "expense":
                    return (
                        <WalletItem
                            index={item.index}
                            handlePress={() => {
                                navigation.navigate("Expense", {
                                    expense: item.data,
                                })
                            }}
                            {...(item.data as any)}
                        />
                    )

                default:
                    return null
            }
        },
        [navigation],
    )

    if (subscriptionsLoading && showSubscriptions && !showExpenses) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading subscriptions...</Text>
            </View>
        )
    }

    if (
        showSubscriptions &&
        !showExpenses &&
        (!subscriptionsData?.subscriptions || subscriptionsData.subscriptions.length === 0)
    ) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No subscriptions found</Text>
                <Text style={styles.emptySubtext}>Add your first subscription to start tracking</Text>
            </View>
        )
    }

    console.log("Rendering WalletList2 with unifiedData length:", unifiedData.length)

    return (
        <>
            <AnimatedList
                keyboardDismissMode={"on-drag"}
                data={unifiedData}
                estimatedItemSize={80}
                renderItem={renderItem as any}
                keyExtractor={(item: any, index: number) => {
                    switch (item.type) {
                        case "limits":
                            return "limits"
                        case "subscription-header":
                            return `sub-header-${item.title}`
                        case "subscription":
                            return `sub-${item.data.id}`
                        case "month-header":
                            return `month-${item.data.month}`
                        case "date-header":
                            return `date-${item.date}`
                        case "expense":
                            return `expense-${item.data.id}`
                        default:
                            return `item-${index}`
                    }
                }}
                getItemType={(item) => item.type}
                onScroll={onScroll}
                contentContainerStyle={{ padding: 15, paddingTop: 300, paddingBottom: 120 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                onEndReached={onEndReached}
                onEndReachedThreshold={0.5}
                scrollEventThrottle={8}
                maintainVisibleContentPosition={{
                    minIndexForVisible: 0,
                    autoscrollToTopThreshold: 10,
                }}
            />
            {showExpenses && <ClearFiltersButton />}
        </>
    )
}

import Haptics from "react-native-haptic-feedback"

const ClearFiltersButton = () => {
    const { filters, dispatch } = useWalletContext()

    const [hasFilters, diffCount] = useMemo(() => {
        let isDifferent = false
        let diffCount = 0

        const flatFilters = (obj: Record<string, any>) => {
            const output = {} as Record<string, any>

            const flatten = (obj: Record<string, any>, parentKey = "") => {
                for (const key in obj) {
                    const value = obj[key]
                    const newKey = parentKey ? `${parentKey}.${key}` : key

                    if (typeof value === "object" && value !== null) {
                        flatten(value, newKey)
                    } else {
                        output[newKey] = value
                    }
                }
            }

            flatten(obj)

            return output
        }

        const flatInitFilters = flatFilters(init)
        const flatCurrentFilters = flatFilters(filters)

        for (const key in flatCurrentFilters) {
            if (flatCurrentFilters[key] !== flatInitFilters[key]) {
                isDifferent = true
                diffCount++
            }
        }

        return [isDifferent, diffCount]
    }, [filters])

    const clearFilters = () => {
        Haptics.trigger("impactLight")
        dispatch({ type: "RESET" })
    }

    if (!hasFilters) return null

    return (
        <Animated.View
            entering={FadeInDown.delay(100)}
            exiting={FadeOutDown}
            style={{
                position: "absolute",
                bottom: 100,
                width: Layout.screen.width,
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <ChipButton style={{ flexDirection: "row", gap: 10 }} onPress={clearFilters}>
                <Text style={{ color: Colors.secondary_light_2 }}>
                    {diffCount > 0 ? `Reset (${diffCount}) ${diffCount > 1 ? "filters" : "filter"}` : "Reset filters"}
                </Text>
                <AntDesign name="close" size={18} color={Colors.secondary_light_2} />
            </ChipButton>
        </Animated.View>
    )
}

const MonthExpenseHeader = ({
    monthData,
    monthIndex,
}: {
    monthData: { month: string; expenses: Expense[] }
    monthIndex: number
}) => {
    const diff = useQuery(
        gql`
            query getMonthTotal($date: String!) {
                getMonthTotal(date: $date)
            }
        `,
        { variables: { date: monthData.month } },
    )

    const amount = diff.data?.getMonthTotal || 0

    return (
        <Animated.View
            style={{ marginBottom: 30, marginTop: monthIndex === 0 ? 30 : 0 }}
            layout={LinearTransition.delay(100)}
        >
            <View style={styles.monthRow}>
                <Text style={styles.monthText}>{moment(monthData.month).format("MMMM YYYY")}</Text>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={{ color: amount > 0 ? "#66E875" : "#F07070", fontSize: 17, fontWeight: "600" }}>
                        {amount > 0 ? `+${amount.toFixed(2)}` : amount.toFixed(2)}
                        <Text style={{ color: amount > 0 ? "#66E875" : "#F07070", fontSize: 13 }}>zł</Text>
                    </Text>
                </View>
            </View>
        </Animated.View>
    )
}

const DateHeader = ({ date, sum }: { date: string; sum: [number, number] }) => {
    const {
        calendar: { setCalendarDate },
    } = useWalletContext()

    const navigation = useNavigation<any>()

    const onPress = useCallback(() => {
        setCalendarDate(moment(date).toDate())
        navigation.navigate("CreateExpense", {
            date: moment(date).format("YYYY-MM-DD"),
        })
    }, [date])

    return (
        <Ripple onPress={onPress} style={styles.dateTextContainer}>
            <Text style={styles.dateText}>{parseDateToText(date)}</Text>

            <View style={{ gap: 5, flexDirection: "row" }}>
                {sum[0] > 0 && (
                    <Text
                        style={{
                            color: sum[0] > 0 ? "#F07070" : "#66E875",
                            fontSize: 15,
                            fontWeight: "600",
                        }}
                    >
                        {sum[0] > 0 ? `-${sum[0].toFixed(2)}` : sum[0].toFixed(2)}zł
                    </Text>
                )}
                {sum[0] > 0 && sum[1] > 0 && <Text style={styles.dateText}>/</Text>}
                {sum[1] > 0 && (
                    <Text
                        style={{
                            color: sum[1] > 0 ? "#66E875" : "#F07070",
                            fontSize: 15,
                            fontWeight: "600",
                        }}
                    >
                        {sum[1] > 0 ? `+${sum[1].toFixed(2)}` : sum[1].toFixed(2)}zł
                    </Text>
                )}
            </View>
        </Ripple>
    )
}

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
        marginTop: 10,
    },
    headerText: {
        fontSize: Sizing.text,
        fontWeight: "600",
        color: Colors.text_light,
    },
    countBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        minWidth: 32,
        alignItems: "center",
        justifyContent: "center",
    },
    countText: {
        color: Colors.foreground,
        fontSize: 12,
        fontWeight: "bold",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    loadingText: {
        color: Colors.text_light,
        fontSize: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    emptyText: {
        color: Colors.text_light,
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 8,
    },
    emptySubtext: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 14,
        textAlign: "center",
    },
    monthText: {
        fontSize: 25,
        fontWeight: "700",
        color: Colors.text_light,
    },
    dateTextContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 5,
        marginBottom: 15,
        marginTop: 25,
        alignItems: "center",
    },
    dateText: {
        color: "rgba(255,255,255,0.7)",
        fontWeight: "600",
        fontSize: 15,
    },
    monthRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 30,
    },
    filtersButton: {
        zIndex: 1000,
        paddingVertical: 7.5,
        paddingHorizontal: 22.5,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: Color(Colors.secondary_light_1).darken(0.5).string(),
        backgroundColor: Color(Colors.secondary_light_1).darken(0.8).string(),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        paddingRight: 15,
        width: 160,
    },
})
