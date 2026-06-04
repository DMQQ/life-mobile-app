import Header from "@/components/ui/Header/Header"
import { formatAmount } from "@/utils/functions/formatCurrency"
import Text from "@/components/ui/Text/Text"
import Colors, { secondary_candidates } from "@/constants/Colors"
import Layout from "@/constants/Layout"
import { Expense, MonthlyExpenses } from "@/types"
import { Feather } from "@expo/vector-icons"
import moment from "moment"
import { useCallback, useMemo, useRef, useState } from "react"
import { ScrollView, StyleSheet, View } from "react-native"
import Feedback from "react-native-haptic-feedback"
import Animated, { FadeOut, useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import { Icons } from "../components/Wallet/WalletItem"
import ChartLoader from "../components/WalletChart/ChartLoader"
import Charts from "../components/WalletChart/Charts"
import FutureProjection from "../components/WalletChart/FutureProjection"
import HourlySpendingsHeatMap from "../components/WalletChart/HourlyHeatMap"
import Legend from "../components/WalletChart/Legend"
import LimitsComparison from "../components/WalletChart/LimitsComparison"
import MonthlyCategoryComparison from "../components/WalletChart/MonthlyComparison"
import CalendarHeatmap from "../components/WalletChart/MonthlySpendingHeatMap"
import PieChart from "../components/WalletChart/PieChart"
import SpendingsByDay from "../components/WalletChart/SpendingsByDayOfWeek"
import StatisticsSummary from "../components/WalletChart/StatisticsSummary"
import WalletContextProvider from "../components/WalletContext"
import useGetLegendData from "../hooks/useGetLegendData"
import useGetWallet, { useGetBalance } from "../hooks/useGetWallet"
import DatePicker from "@/components/DatePicker"
import dayjs from "dayjs"
import { IconButton } from "@/components"
import BottomSheet from "@gorhom/bottom-sheet"
import CategoryExpensesSheet from "../components/WalletChart/CategoryExpensesSheet"
import Background from "@/components/ui/Background"

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView)

const styles = StyleSheet.create({
    listHeader: {
        flex: 1,
        alignItems: "center",
        marginBottom: 30,
    },
    overlay: { backgroundColor: Colors.primary, zIndex: 1000, justifyContent: "center", alignItems: "center" },
})

export default function WalletChartComponent(props: any) {
    const initialState = useMemo(
        () => ({
            type: "expense",
            date: {
                from: moment().startOf("month").format("YYYY-MM-DD"),
                to: moment().endOf("month").format("YYYY-MM-DD"),
            },
        }),
        [],
    )
    return (
        <WalletContextProvider initialState={initialState}>
            <WalletCharts {...props} />
        </WalletContextProvider>
    )
}

export const getInvalidExpenses = (curr: Expense) =>
    !curr.category ||
    curr.description.startsWith("Balance") ||
    curr.type === "refunded" ||
    curr.category === "refunded" ||
    curr.amount == 0

function WalletCharts({ navigation }: any) {
    const [view, setActiveView] = useState<"pie" | "bars">("pie")
    const {
        data = { wallet: { expenses2: [] } },
        dispatch,
        filters,
        loading,
        onEndReached,
    } = useGetWallet({
        fetchAll: true,
        excludeFields: ["subscription", "location", "files"],
    })

    const filteredExpenses: Expense[] = useMemo(() => {
        return (
            (data?.wallet?.expenses2 as MonthlyExpenses[] | undefined)
                ?.flatMap((expense) => expense.expenses as Expense[])
                ?.filter((item) => !getInvalidExpenses(item)) || []
        )
    }, [data?.wallet?.expenses2])

    const [excluded, setExcluded] = useState<string[]>([])
    const [selected, setSelected] = useState("")
    const sheetRef = useRef<BottomSheet>(null)

    const legend = useGetLegendData(
        moment().startOf("month").format("YYYY-MM-DD"),
        moment().endOf("month").format("YYYY-MM-DD"),
    )

    const barData = useMemo(() => {
        if (!legend.data?.statisticsLegend) return []
        return legend.data?.statisticsLegend.map((item, index: number) => ({
            value: item.total,
            label: item.category,
            color:
                Icons[item.category as keyof typeof Icons]?.backgroundColor ||
                secondary_candidates[index % secondary_candidates.length],
            selected: item.category === selected,
            itemsCount: +item.count,
        }))
    }, [legend.data?.statisticsLegend])

    const sumOfExpenses = useMemo(() => {
        return barData.reduce((acc, curr) => {
            if (excluded.includes(curr.label)) return acc
            return acc + curr.value
        }, 0)
    }, [barData, excluded])

    const onLegendItemPress = (item: { category: string }) => {
        if (!item.category) return
        if (excluded.includes(item.category)) {
            setExcluded((prev) => prev.filter((cat) => cat !== item.category))
        }
        setSelected(item.category)
        sheetRef.current?.snapToPosition("50%")
    }

    const selectedCategoryData: Expense[] = useMemo(() => {
        const allExpenses = ((data?.wallet?.expenses2 as MonthlyExpenses[] | undefined)?.flatMap((g) => g.expenses) ??
            []) as Expense[]
        if (selected.trim() === "") return allExpenses
        return allExpenses.filter((item) => (item.category ?? "").startsWith(selected) && item.type !== "refunded")
    }, [selected, data?.wallet?.expenses2])

    const onChartPress = (e: any) => {
        if (!e.label) return
        setSelected(e.label)
        sheetRef.current?.snapToPosition("50%")
    }

    const currentBalance = useGetBalance()

    const chartData = useMemo(() => {
        return barData.filter((item) => {
            if (excluded.length === 0) return true
            return !excluded.includes(item.label)
        })
    }, [barData, excluded])

    const onLongPress = useCallback(
        (item: { category: string } & Record<string, any>) => {
            Feedback.trigger("impactLight")
            setExcluded((prev) => {
                if (prev.includes(item.category)) return prev.filter((cat) => cat !== item.category)
                return [...prev, item.category]
            })
            if (item.category === selected) {
                setSelected("")
            }
        },
        [selected],
    )

    const insets = useSafeAreaInsets()
    const monthDiff = moment(filters.date.from).diff(moment(filters.date.to))
    const scrollY = useSharedValue(0)

    const onScroll = useAnimatedScrollHandler({
        onScroll: (ev) => {
            scrollY.value = ev.contentOffset.y
        },
    })

    const selectedColor = barData.find((c) => c.label === selected)?.color ?? Colors.secondary

    return (
        <SafeAreaView style={{ flex: 1, paddingBottom: insets.bottom }} edges={["top"]}>
            {loading && (
                <Animated.View exiting={FadeOut.duration(250)} style={[StyleSheet.absoluteFill, styles.overlay]}>
                    <ChartLoader />
                </Animated.View>
            )}

            <Header
                title={sumOfExpenses ? `Spent ${formatAmount(sumOfExpenses)}zł` : "No expenses"}
                scrollY={scrollY}
                animated={false}
                goBack
                buttons={[
                    {
                        icon: <Feather name="repeat" color={"#fff"} size={20} />,
                        onPress: () => {
                            setActiveView((prev) => (prev === "pie" ? "bars" : "pie"))
                        },
                    },
                    {
                        children: (
                            <DatePicker
                                clear
                                mode="period"
                                dates={{
                                    start: dayjs(filters.date.from).toDate(),
                                    end: dayjs(filters.date.to).toDate(),
                                }}
                                setDates={({ start, end }) => {
                                    dispatch({ type: "SET_DATE_MAX", payload: dayjs(end).format("YYYY-MM-DD") })
                                    dispatch({ type: "SET_DATE_MIN", payload: dayjs(start).format("YYYY-MM-DD") })
                                }}
                                buttonComponent={({ onPress }) => (
                                    <IconButton
                                        icon={<Feather name="calendar" size={20} color="#fff" />}
                                        onPress={onPress}
                                    />
                                )}
                            />
                        ),
                    },
                ]}
            />

            <Background tintColor={secondary_candidates[3]} />

            <AnimatedScrollView
                style={{ paddingTop: 100 }}
                onScroll={onScroll}
                scrollEventThrottle={16}
                bounces
                contentContainerStyle={{ padding: 15 }}
                onScrollEndDrag={onEndReached}
            >
                <View style={styles.listHeader}>
                    <View style={{ height: Layout.screen.height / 2.8 }}>
                        {view === "pie" ? (
                            <PieChart data={chartData} totalSum={sumOfExpenses} onPress={onChartPress} />
                        ) : (
                            <Charts data={chartData} onPress={onChartPress} />
                        )}
                    </View>

                    <Legend
                        excluded={excluded}
                        onLongPress={onLongPress}
                        totalSum={sumOfExpenses}
                        selected={selected}
                        onPress={onLegendItemPress}
                        startDate={filters.date.from}
                        endDate={filters.date.to}
                        detailed={legend.detailed}
                        statisticsLegendData={legend.data || { statisticsLegend: [] }}
                        toggleMode={legend.toggleMode}
                    />
                </View>

                <StatisticsSummary />
                <SpendingsByDay />
                {monthDiff > 28 && monthDiff < 32 && (
                    <FutureProjection data={filteredExpenses} income={5500} currentBalance={currentBalance} />
                )}
                <MonthlyCategoryComparison />
                <LimitsComparison />
                <CalendarHeatmap />
                <HourlySpendingsHeatMap />
            </AnimatedScrollView>

            <CategoryExpensesSheet
                ref={sheetRef}
                expenses={selectedCategoryData}
                categoryName={selected}
                categoryColor={selectedColor}
                onExpensePress={(expense) => navigation.navigate("Expense", { expense })}
            />
        </SafeAreaView>
    )
}
