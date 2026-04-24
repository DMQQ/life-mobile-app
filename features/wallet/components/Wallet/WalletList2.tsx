import Colors, { Sizing } from "@/constants/Colors"
import Layout from "@/constants/Layout"
import { Expense, MonthlyExpenses, Wallet } from "@/types"
import { gql, useQuery } from "@apollo/client"
import { AntDesign } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import Color from "color"
import moment from "moment"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
    NativeScrollEvent,
    NativeSyntheticEvent,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
    VirtualizedList,
} from "react-native"
import Ripple from "react-native-material-ripple"
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import { ListRenderItem } from "@shopify/flash-list"
import useGetSubscriptions from "../../hooks/useGetSubscriptions"
import { getInvalidExpenses } from "../../pages/WalletCharts"
import SubscriptionItem from "../Subscription/SubscriptionItem"
import { init, useWalletContext } from "../WalletContext"
import WalletLimits from "./Limits"
import WalletItem, { parseDateToText } from "./WalletItem"

const AnimatedList = Animated.createAnimatedComponent(VirtualizedList)

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

type ListItemType =
    | { type: "limits" }
    | { type: "subscription-header"; title: string; count: number; color: string }
    | { type: "subscription"; data: Subscription; index: number }
    | { type: "month"; data: MonthlyExpenses; monthIndex: number }
    | { type: "cards" }

const keyExtractor = (item: ListItemType, index: number) => {
    switch (item.type) {
        case "limits":
            return "limits"
        case "subscription-header":
            return `sub-header-${item.title}`
        case "subscription":
            return `sub-${item.data.id}`
        case "month":
            return `month-${item.data.month}`
        default:
            return `item-${index}`
    }
}

const getItem = (data: ListItemType[], index: number) => data[index]
const getItemCount = (data: ListItemType[]) => data.length

export default function WalletList2({
    wallet,
    onScroll,
    refetch,
    onEndReached,
    showSubscriptions = true,
    showExpenses = true,
}: WalletList2Props) {
    const navigation = useNavigation<any>()
    const { data: subscriptionsData, refetch: refetchSubscriptions } = useGetSubscriptions()
    const [refreshing, setRefreshing] = useState(false)

    const groupedSubscriptions = useMemo(() => {
        if (!subscriptionsData?.subscriptions) return { active: [], inactive: [] }
        const active = subscriptionsData.subscriptions.filter((sub: Subscription) => sub.isActive)
        const inactive = subscriptionsData.subscriptions.filter((sub: Subscription) => !sub.isActive)
        return { active, inactive } as { active: Subscription[]; inactive: Subscription[] }
    }, [subscriptionsData?.subscriptions])

    const unifiedData = useMemo(() => {
        const items: ListItemType[] = []

        if (showSubscriptions) {
            if (groupedSubscriptions.active.length > 0) {
                items.push({
                    type: "subscription-header",
                    title: "Active",
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
                    title: "Inactive",
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

        if (showExpenses) {
            ;(wallet?.expenses2 ?? []).forEach((monthData, monthIndex) => {
                items.push({ type: "month", data: monthData, monthIndex })
            })
        }

        return items
    }, [showSubscriptions, showExpenses, groupedSubscriptions, wallet?.expenses2])

    const onRefresh = useCallback(async () => {
        setRefreshing(true)
        if (refetch) refetch()
        if (refetchSubscriptions) refetchSubscriptions()
        setRefreshing(false)
    }, [refetch, refetchSubscriptions])

    const renderItem: ListRenderItem<ListItemType> = useCallback(
        ({ item }) => {
            switch (item.type) {
                case "subscription-header":
                    return (
                        <Text style={[styles.monthText, { marginTop: 30, marginBottom: 15 }]}>
                            {item.title} ({item.count})
                        </Text>
                    )

                case "subscription":
                    return (
                        <SubscriptionItem
                            subscription={item.data}
                            index={item.index}
                            onPress={() => navigation.navigate("Subscription", { subscriptionId: item.data.id })}
                        />
                    )

                case "month":
                    return (
                        <MonthItem
                            monthData={item.data}
                            monthIndex={item.monthIndex}
                            defaultExpanded={item.monthIndex === 0}
                        />
                    )

                default:
                    return null
            }
        },
        [wallet?.balance],
    )

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

    return (
        <>
            <AnimatedList
                keyboardDismissMode={"on-drag"}
                data={unifiedData}
                getItem={getItem}
                getItemCount={getItemCount}
                renderItem={renderItem as any}
                keyExtractor={keyExtractor as any}
                onScroll={onScroll}
                ListHeaderComponent={
                    showExpenses ? (
                        <>
                            <SubAccountCards />
                            <WalletLimits navigation={navigation} />
                        </>
                    ) : (
                        <SubscriptionCalendar
                            subscriptions={[...groupedSubscriptions.active, ...groupedSubscriptions.inactive]}
                        />
                    )
                }
                contentContainerStyle={{ padding: 15, paddingTop: 230, paddingBottom: 120 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                onEndReached={onEndReached}
                onEndReachedThreshold={0.5}
                removeClippedSubviews
                windowSize={4}
                initialNumToRender={6}
            />
            {showExpenses && <ClearFiltersButton />}
        </>
    )
}

const MonthItem = ({
    monthData,
    monthIndex,
    defaultExpanded,
}: {
    monthData: MonthlyExpenses
    monthIndex: number
    defaultExpanded: boolean
}) => {
    const navigation = useNavigation<any>()
    const [isExpanded, setIsExpanded] = useState(defaultExpanded)
    const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set())

    const toggleMonth = useCallback(() => setIsExpanded((prev) => !prev), [])

    const toggleDate = useCallback((day: string) => {
        setCollapsedDates((prev) => {
            const next = new Set(prev)
            if (next.has(day)) next.delete(day)
            else next.add(day)
            return next
        })
    }, [])

    const groupedByDay = useMemo(() => {
        const map = new Map<string, Expense[]>()
        monthData.expenses.forEach((expense) => {
            const day = expense.date.slice(0, 10)
            if (!map.has(day)) map.set(day, [])
            map.get(day)!.push(expense)
        })
        return map
    }, [monthData.expenses])

    const calculateDaySum = useCallback((dayExpenses: Expense[]): [number, number] => {
        return dayExpenses.reduce(
            (acc, expense) => {
                if (getInvalidExpenses(expense)) return acc
                const value = expense.amount
                if (expense.type === "income") acc[1] += isNaN(value) ? 0 : value
                else acc[0] += isNaN(value) ? 0 : value
                return acc
            },
            [0, 0] as [number, number],
        )
    }, [])

    return (
        <View style={[styles.monthContainer, monthIndex === 0 && styles.monthContainerFirst]}>
            <MonthHeader monthData={monthData} isExpanded={isExpanded} onToggle={toggleMonth} />

            {isExpanded && (
                <View style={styles.monthContent}>
                    {Array.from(groupedByDay.entries()).map(([day, dayExpenses]) => {
                        const isDateExpanded = !collapsedDates.has(day)
                        const sum = calculateDaySum(dayExpenses)

                        return (
                            <View key={day}>
                                <DateHeader
                                    date={dayExpenses[0].date}
                                    sum={sum}
                                    isExpanded={isDateExpanded}
                                    onToggle={() => toggleDate(day)}
                                />

                                {isDateExpanded &&
                                    dayExpenses.map((expense, index) => (
                                        <WalletItem
                                            key={expense.id}
                                            index={index}
                                            handlePress={() => navigation.navigate("Expense", { expense })}
                                            {...(expense as any)}
                                        />
                                    ))}
                            </View>
                        )
                    })}
                </View>
            )}
        </View>
    )
}

// ─── Month Header ─────────────────────────────────────────────────────────────

const MonthHeader = ({
    monthData,
    isExpanded,
    onToggle,
}: {
    monthData: MonthlyExpenses
    isExpanded: boolean
    onToggle: () => void
}) => {
    const { data, previousData } = useQuery(
        gql`
            query getMonthTotal($date: String!) {
                getMonthTotal(date: $date)
            }
        `,
        {
            variables: { date: monthData.month },
            fetchPolicy: "cache-and-network",
            notifyOnNetworkStatusChange: true,
        },
    )

    const amount = data?.getMonthTotal ?? previousData?.getMonthTotal ?? 0

    return (
        <Pressable onPress={onToggle} style={styles.monthHeaderRow}>
            <View style={styles.monthTitleRow}>
                <ChevronIcon isExpanded={isExpanded} />
                <Text style={styles.monthText}>{moment(monthData.month).format("MMMM YYYY")}</Text>
            </View>

            <Text style={amount > 0 ? styles.monthAmountPositive : styles.monthAmountNegative}>
                {amount > 0 ? `+${amount.toFixed(2)}` : amount.toFixed(2)}
                <Text
                    style={[
                        amount > 0 ? styles.monthAmountPositive : styles.monthAmountNegative,
                        styles.monthAmountCurrency,
                    ]}
                >
                    zł
                </Text>
            </Text>
        </Pressable>
    )
}

// ─── Date Header ──────────────────────────────────────────────────────────────

const DateHeader = ({
    date,
    sum,
    isExpanded,
    onToggle,
}: {
    date: string
    sum: [number, number]
    isExpanded: boolean
    onToggle: () => void
}) => {
    const {
        calendar: { setCalendarDate },
    } = useWalletContext()
    const navigation = useNavigation<any>()

    const onPress = useCallback(() => {
        setCalendarDate(moment(date).toDate())
        navigation.navigate("CreateExpense", { date: moment(date).format("YYYY-MM-DD") })
    }, [date])

    return (
        <View style={styles.dateRow}>
            <Pressable onPress={onToggle} hitSlop={10} style={styles.dateChevron}>
                <ChevronIcon isExpanded={isExpanded} />
            </Pressable>
            <Ripple onPress={onPress} style={styles.dateTextContainer}>
                <Text style={styles.dateText}>{parseDateToText(date)}</Text>
                <View style={styles.dateSumContainer}>
                    {sum[0] > 0 && (
                        <Text style={[styles.expenseAmount, styles.expenseAmountNegative]}>
                            {`-${sum[0].toFixed(2)}`}zł
                        </Text>
                    )}
                    {sum[0] > 0 && sum[1] > 0 && <Text style={styles.dateText}>/</Text>}
                    {sum[1] > 0 && (
                        <Text style={[styles.expenseAmount, styles.incomeAmountPositive]}>
                            {`+${sum[1].toFixed(2)}`}zł
                        </Text>
                    )}
                </View>
            </Ripple>
        </View>
    )
}

// ─── Chevron ──────────────────────────────────────────────────────────────────

const ChevronIcon = ({ isExpanded }: { isExpanded: boolean }) => {
    const rotation = useSharedValue(isExpanded ? 0 : -90)

    useEffect(() => {
        rotation.value = withTiming(isExpanded ? 0 : -90, { duration: 200 })
    }, [isExpanded])

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }))

    return (
        <Animated.View style={animatedStyle}>
            <AntDesign name="down" size={14} color="rgba(255,255,255,0.5)" />
        </Animated.View>
    )
}

// ─── Clear Filters ────────────────────────────────────────────────────────────

import Haptics from "react-native-haptic-feedback"
import GlassView from "@/components/ui/GlassView"
import SubAccountCards from "./SubAccountCards"
import SubscriptionCalendar from "./SubscriptionCalendar"

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
                    if (typeof value === "object" && value !== null) flatten(value, newKey)
                    else output[newKey] = value
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

    if (!hasFilters) return null

    return (
        <Animated.View style={styles.clearFiltersContainer}>
            <Pressable
                onPress={() => {
                    Haptics.trigger("impactLight")
                    dispatch({ type: "RESET" })
                }}
            >
                <GlassView style={styles.clearFiltersButton}>
                    <Text style={styles.clearFiltersText}>
                        {diffCount > 0
                            ? `Reset (${diffCount}) ${diffCount > 1 ? "filters" : "filter"}`
                            : "Reset filters"}
                    </Text>
                    <AntDesign name="close" size={18} color={Colors.secondary_light_2} />
                </GlassView>
            </Pressable>
        </Animated.View>
    )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    monthContainer: {
        marginTop: 30,
    },
    monthContainerFirst: {
        marginTop: 15,
    },
    monthContent: {
        marginTop: 8,
    },
    monthHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 4,
    },
    monthTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    monthText: {
        fontSize: 25,
        fontWeight: "700",
        color: Colors.text_light,
    },
    monthAmountPositive: {
        color: "#66E875",
        fontSize: 17,
        fontWeight: "600",
    },
    monthAmountNegative: {
        color: "#F07070",
        fontSize: 17,
        fontWeight: "600",
    },
    monthAmountCurrency: {
        fontSize: 13,
    },
    dateRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 20,
        marginBottom: 8,
    },
    dateTextContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 5,
        alignItems: "center",
    },
    dateChevron: {
        marginRight: 10,
        paddingVertical: 5,
    },
    dateText: {
        color: "rgba(255,255,255,0.7)",
        fontWeight: "600",
        fontSize: 15,
    },
    dateSumContainer: {
        flexDirection: "row",
        gap: 5,
        alignItems: "center",
    },
    expenseAmount: {
        fontSize: 15,
        fontWeight: "600",
    },
    expenseAmountNegative: {
        color: "#F07070",
    },
    incomeAmountPositive: {
        color: "#66E875",
    },
    monthRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 30,
    },
    subscriptionHeaderContainer: {
        marginBottom: 30,
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
    clearFiltersContainer: {
        position: "absolute",
        bottom: 100,
        width: Layout.screen.width,
        justifyContent: "center",
        alignItems: "center",
    },
    clearFiltersButton: {
        padding: 5,
        borderRadius: 50,
        flexDirection: "row",
        gap: 5,
        paddingHorizontal: 15,
    },
    clearFiltersText: {
        color: Colors.secondary_light_2,
    },
})
