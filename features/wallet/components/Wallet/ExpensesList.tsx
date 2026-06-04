import { FONTS } from "@/constants/Fonts"
import { formatAmount } from "@/utils/functions/formatCurrency"
import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import { Expense, MonthlyExpenses, Wallet } from "@/types"
import { gql, useQuery } from "@apollo/client"
import { Feather } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import moment from "moment"
import { memo, ReactNode, useCallback, useEffect, useMemo, useState } from "react"
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
import { useWalletContext } from "../WalletContext"
import GlassView from "@/components/ui/GlassView"
import WalletItem, { parseDateToText } from "./WalletItem"

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
    listHeader?: ReactNode
}

export default function ExpensesList({ wallet, onScroll, refetch, onEndReached, listHeader }: Props) {
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
        return <MonthItem monthData={item.data} monthIndex={item.monthIndex} defaultExpanded={item.monthIndex === 0} />
    }, [])

    return (
        <AnimatedList
            keyboardDismissMode="on-drag"
            data={items}
            getItem={getItem}
            getItemCount={getItemCount}
            renderItem={renderItem as any}
            keyExtractor={keyExtractor as any}
            onScroll={onScroll}
            ListHeaderComponent={listHeader ? <>{listHeader}</> : undefined}
            stickyHeaderIndices={listHeader ? [0] : undefined}
            contentContainerStyle={styles.contentContainer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.2}
            removeClippedSubviews
            windowSize={4}
            initialNumToRender={6}
        />
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

    const items = useMemo(
        () =>
            Array.from(groupedByDay.entries()).map(([day, dayExpenses]) => {
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
                        {isDateExpanded && (
                            <View style={styles.items}>
                                {dayExpenses.map((expense, index) => (
                                    <WalletItem
                                        key={expense.id}
                                        index={index}
                                        handlePress={() => navigation.navigate("Expense", { expense })}
                                        {...(expense as any)}
                                        animatedStyle={{
                                            borderWidth: 0,
                                            marginBottom: 0,
                                            borderRadius: 0,
                                            borderBottomWidth: dayExpenses.length - 1 === index ? 0 : 1,
                                            marginTop: 0,
                                        }}
                                    />
                                ))}
                            </View>
                        )}
                    </View>
                )
            }),
        [calculateDaySum, toggleDate, collapsedDates, groupedByDay, navigation],
    )

    return (
        <View style={[styles.monthContainer, monthIndex === 0 && styles.monthContainerFirst]}>
            <MonthHeader monthData={monthData} isExpanded={isExpanded} onToggle={toggleMonth} />

            {(isExpanded || hasFilters) && <View style={styles.monthContent}>{items}</View>}
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
                {amount > 0 ? `+${formatAmount(amount)}` : formatAmount(amount)}
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
                    {sum[0] > 0 && <Text style={[styles.amount, styles.negative]}>{`-${formatAmount(sum[0])}`}zł</Text>}
                    {sum[0] > 0 && sum[1] > 0 && <Text style={styles.dateText}>/</Text>}
                    {sum[1] > 0 && <Text style={[styles.amount, styles.positive]}>{`+${formatAmount(sum[1])}`}zł</Text>}
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
            <Feather name="chevron-down" size={12} color="rgba(255,255,255,0.5)" />
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    contentContainer: {
        padding: 15,
        paddingTop: 100,
        paddingBottom: 200,
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
        fontFamily: FONTS.bold,
        color: Colors.text_light,
    },
    monthAmountPositive: {
        color: "#66E875",
        fontSize: 17,
        fontFamily: FONTS.semibold,
    },
    monthAmountNegative: {
        color: "#F07070",
        fontSize: 17,
        fontFamily: FONTS.semibold,
    },
    monthAmountCurrency: {
        fontSize: 13,
    },
    dateRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 20,
        marginBottom: 4,
    },
    dateTextContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    dateChevron: {
        marginRight: 10,
        paddingVertical: 5,
    },
    dateText: {
        color: "rgba(255,255,255,0.7)",
        fontFamily: FONTS.semibold,
        fontSize: 14,
    },
    dateSumContainer: {
        flexDirection: "row",
        gap: 5,
        alignItems: "center",
    },
    amount: {
        fontSize: 14,
        fontFamily: FONTS.semibold,
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
    items: {
        backgroundColor: Colors.primary_lighter,
        borderRadius: 20,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: Colors.borderColor,
    },
})
