import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import { Expense, MonthlyExpenses, Wallet } from "@/types"
import { gql, useQuery } from "@apollo/client"
import { AntDesign } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
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
import Haptics from "react-native-haptic-feedback"
import { getInvalidExpenses } from "../../pages/WalletCharts"
import { init, useWalletContext } from "../WalletContext"
import GlassView from "@/components/ui/GlassView"
import SubAccountCards from "./SubAccountCards"
import WalletItem, { parseDateToText } from "./WalletItem"
import CategoryBreakdown from "./CategoryBreakdown"

type ListItem = { type: "month"; data: MonthlyExpenses; monthIndex: number }

const getItem = (data: ListItem[], index: number) => data[index]
const getItemCount = (data: ListItem[]) => data.length
const keyExtractor = (item: ListItem, index: number) =>
    item.type === "month" ? `month-${item.data.month}` : `item-${index}`

const AnimatedList = Animated.createAnimatedComponent(VirtualizedList<ListItem>)

interface Props {
    wallet?: Wallet
    onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void
    refetch?: () => void
    onEndReached?: () => void
}

export default function ExpensesList({ wallet, onScroll, refetch, onEndReached }: Props) {
    const [refreshing, setRefreshing] = useState(false)

    const items: ListItem[] = useMemo(
        () =>
            (wallet?.expenses2 ?? []).map((data, monthIndex) => ({
                type: "month",
                data,
                monthIndex,
            })),
        [wallet?.expenses2],
    )

    const onRefresh = useCallback(async () => {
        setRefreshing(true)
        refetch?.()
        setRefreshing(false)
    }, [refetch])

    const renderItem = useCallback(({ item }: { item: ListItem }) => {
        if (item.type === "month") {
            return (
                <MonthItem monthData={item.data} monthIndex={item.monthIndex} defaultExpanded={item.monthIndex === 0} />
            )
        }
        return null
    }, [])

    return (
        <>
            <AnimatedList
                keyboardDismissMode="on-drag"
                data={items}
                getItem={getItem}
                getItemCount={getItemCount}
                renderItem={renderItem as any}
                keyExtractor={keyExtractor as any}
                onScroll={onScroll}
                ListHeaderComponent={
                    <View style={{ flexDirection: "column", gap: 15 }}>
                        <SubAccountCards />
                    </View>
                }
                contentContainerStyle={styles.contentContainer}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                onEndReached={onEndReached}
                onEndReachedThreshold={0.2}
                removeClippedSubviews
                windowSize={4}
                initialNumToRender={6}
            />
            <ClearFiltersButton />
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
    const { hasFilters } = useWalletContext()

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
            const day = moment(expense.date).format("YYYY-MM-DD")
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

            {(isExpanded || hasFilters) && (
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
                    {sum[0] > 0 && <Text style={[styles.amount, styles.negative]}>{`-${sum[0].toFixed(2)}`}zł</Text>}
                    {sum[0] > 0 && sum[1] > 0 && <Text style={styles.dateText}>/</Text>}
                    {sum[1] > 0 && <Text style={[styles.amount, styles.positive]}>{`+${sum[1].toFixed(2)}`}zł</Text>}
                </View>
            </Ripple>
        </View>
    )
}

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

const ClearFiltersButton = () => {
    const { dispatch, hasFilters, filtersDiffCount } = useWalletContext()

    if (!hasFilters) return null

    return (
        <Animated.View style={styles.clearContainer}>
            <Pressable
                onPress={() => {
                    Haptics.trigger("impactLight")
                    dispatch({ type: "RESET" })
                }}
            >
                <GlassView style={styles.clearButton}>
                    <Text style={styles.clearText}>
                        {filtersDiffCount > 0
                            ? `Reset (${filtersDiffCount}) ${filtersDiffCount > 1 ? "filters" : "filter"}`
                            : "Reset filters"}
                    </Text>
                    <AntDesign name="close" size={18} color={Colors.secondary_light_2} />
                </GlassView>
            </Pressable>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    contentContainer: {
        padding: 15,
        paddingTop: 230,
        paddingBottom: 120,
    },
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
    amount: {
        fontSize: 15,
        fontWeight: "600",
    },
    negative: {
        color: "#F07070",
    },
    positive: {
        color: "#66E875",
    },
    clearContainer: {
        position: "absolute",
        bottom: 100,
        width: Layout.screen.width,
        justifyContent: "center",
        alignItems: "center",
    },
    clearButton: {
        padding: 5,
        borderRadius: 50,
        flexDirection: "row",
        gap: 5,
        paddingHorizontal: 15,
    },
    clearText: {
        color: Colors.secondary_light_2,
    },
})
