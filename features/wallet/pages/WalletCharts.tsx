import Header from "@/components/ui/Header/Header"
import Text from "@/components/ui/Text/Text"
import Colors, { secondary_candidates } from "@/constants/Colors"
import Layout from "@/constants/Layout"
import { Expense } from "@/types"
import wrapWithFunction from "@/utils/functions/wrapFn"
import { AntDesign, MaterialIcons } from "@expo/vector-icons"
import moment from "moment"
import { useCallback, useMemo, useRef, useState } from "react"
import { StyleSheet, View, VirtualizedList } from "react-native"
import Feedback from "react-native-haptic-feedback"
import Ripple from "react-native-material-ripple"
import Animated, { FadeOut, useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { CategoryUtils } from "../components/Expense/ExpenseIcon"
import WalletItem, { Icons } from "../components/Wallet/WalletItem"
import ChartLoader from "../components/WalletChart/ChartLoader"
import Charts from "../components/WalletChart/Charts"
import DailySpendingChart from "../components/WalletChart/DailySpendingChart"
import DateRangePicker from "../components/WalletChart/DateRangePicker"
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

const AnimatedVirtualizedList = Animated.createAnimatedComponent(VirtualizedList)

const styles = StyleSheet.create({
    tilesContainer: {
        marginTop: 15,
        width: Layout.window.width - 30,
        gap: 10,
        flexDirection: "row",
        flexWrap: "wrap",
    },

    tile: {
        flexDirection: "column",
        padding: 20,
        backgroundColor: Colors.primary_light,
        borderRadius: 15,
        gap: 5,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 10,
        marginRight: 10,
    },
    tileText: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
    },
    expenseTitle: {
        color: Colors.foreground,
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 15,
    },
    totalText: {
        color: Colors.foreground,
        fontSize: 22,
        fontWeight: "bold",
    },
    listHeader: {
        flex: 1,
        paddingHorizontal: 15,
        alignItems: "center",
        marginBottom: 30,
    },
    viewAll: { color: Colors.secondary, textAlign: "center", marginTop: 10 },

    overlay: { backgroundColor: Colors.primary, zIndex: 1000, justifyContent: "center", alignItems: "center" },
})

export default function WalletChartComponent(props: any) {
    return (
        <WalletContextProvider>
            <WalletCharts {...props} />
        </WalletContextProvider>
    )
}

export const getInvalidExpenses = (curr: Expense) =>
    !curr.category ||
    curr.description.startsWith("Balance") ||
    curr.type === "income" ||
    curr.type === "refunded" ||
    curr.category === "refunded" ||
    curr.amount == 0

function WalletCharts({ navigation }: any) {
    const {
        data = { wallet: { expenses: [] } },
        dispatch,
        filters,
        loading,
        onEndReached,
    } = useGetWallet({
        fetchAll: true,
        excludeFields: ["subscription", "location", "files"],

        defaultFilters: {
            type: "expense",
            date: {
                from: moment().startOf("month").format("YYYY-MM-DD"),
                to: moment().endOf("month").format("YYYY-MM-DD"),
            },
        },
    })

    const filteredExpenses = useMemo(() => {
        return data?.wallet?.expenses?.filter((item) => !getInvalidExpenses(item)) || []
    }, [data?.wallet?.expenses])

    const [excluded, setExcluded] = useState<string[]>([])

    const listRef = useRef<VirtualizedList<any> | null>(null)
    const [selected, setSelected] = useState("")

    const [chartType, setChartType] = useState<"pie" | "bar">("pie")

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
        if (!data?.wallet?.expenses) return 0

        return barData.reduce((acc, curr) => {
            if (excluded.includes(curr.label)) return acc
            return acc + curr.value
        }, 0)
    }, [barData, excluded.length])

    const onLegendItemPress = (item: { category: string }) => {
        if (!item.category) return

        if (excluded.includes(item.category)) {
            setExcluded((prev) => prev.filter((cat) => cat !== item.category))
        }

        setSelected((prev) => (prev === item.category ? "" : item.category))
        setStep(5)

        try {
            if (data.wallet?.expenses?.length === 0) return
            setTimeout(() => {
                listRef.current?.scrollToIndex({ index: 0, animated: true })
            }, 100)
        } catch (error) {}
    }

    const selectedCategoryData = useMemo(() => {
        if (selected.trim() === "") return data?.wallet?.expenses || []

        return (
            data?.wallet?.expenses?.filter((item) => item.category.startsWith(selected) && item.type !== "refunded") ||
            []
        )
    }, [selected])

    const onChartPress = (e: any) => {
        if (!e.label) return
        setSelected(e.label)
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

    const headerButtons = useMemo(
        () => [
            {
                icon: (
                    <MaterialIcons name="bar-chart" size={25} color={chartType === "bar" ? Colors.secondary : Colors.foreground} />
                ),
                onPress: () => setChartType("bar"),
            },
            {
                icon: (
                    <MaterialIcons name="pie-chart" size={20} color={chartType === "pie" ? Colors.secondary : Colors.foreground} />
                ),
                onPress: () => setChartType("pie"),
            },
        ],
        [chartType],
    )

    const [step, setStep] = useState(5)

    const insets = useSafeAreaInsets()

    const monthDiff = moment(filters.date.from).diff(moment(filters.date.to))

    const scrollY = useSharedValue(0)

    const onScroll = useAnimatedScrollHandler({
        onScroll: (ev) => {
            scrollY.value = ev.contentOffset.y
        },
    })

    return (
        <View style={{ paddingTop: 15, paddingBottom: insets.bottom }}>
            {loading && (
                <Animated.View
                    exiting={FadeOut.duration(250)}
                    style={[StyleSheet.absoluteFillObject, styles.overlay, { paddingTop: 15 }]}
                >
                    <ChartLoader />
                </Animated.View>
            )}

            <Header
                scrollY={scrollY}
                buttons={headerButtons}
                goBack
                backIcon={<AntDesign name="close" size={24} color={Colors.foreground} />}
                
            />
            <AnimatedVirtualizedList
                style={{ marginTop: 60 }}
                onScroll={onScroll}
                ref={listRef}
                ListHeaderComponent={
                    <View style={styles.listHeader}>
                        <View style={{ height: Layout.screen.height / 2.8, marginBottom: 15 }}>
                            {chartType === "pie" ? (
                                <PieChart data={chartData} totalSum={sumOfExpenses} onPress={onChartPress} />
                            ) : (
                                <Charts data={chartData} onPress={onChartPress} />
                            )}
                        </View>
                        <DateRangePicker
                            filters={filters}
                            dispatch={wrapWithFunction(dispatch, () => setSelected(""))}
                        />
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

                        {selectedCategoryData.length > 0 && (
                            <View style={{ width: Layout.screen.width - 30, marginTop: 25 }}>
                                <Text variant="body" style={{ color: Colors.foreground, fontWeight: "bold" }}>
                                    Selected category:{" "}
                                    <Text
                                        variant="body"
                                        style={{
                                            color: barData.find((c) => c.label === selected)?.color,
                                            textTransform: "capitalize",
                                        }}
                                    >
                                        {" "}
                                        {CategoryUtils.getCategoryName(selected) || "All"}
                                    </Text>
                                </Text>
                            </View>
                        )}
                    </View>
                }
                data={selectedCategoryData.slice(0, step)}
                getItem={(data, index) => data[index]}
                getItemCount={(data) => data.length}
                keyExtractor={(item: any) => item.id}
                contentContainerStyle={{ padding: 15 }}
                bounces
                removeClippedSubviews
                initialNumToRender={5}
                onEndReached={onEndReached}
                renderItem={({ item }: any) => (
                    <WalletItem
                        handlePress={() => {
                            navigation.navigate("Expense", {
                                expense: item as Expense,
                            })
                        }}
                        {...item}
                    />
                )}
                ListFooterComponent={
                    <>
                        {selectedCategoryData.length > step && (
                            <Ripple onPress={() => setStep(selectedCategoryData.length)}>
                                <Text variant="body" style={styles.viewAll}>View all</Text>
                            </Ripple>
                        )}
                        <StatisticsSummary />
                        <SpendingsByDay />
                        {monthDiff > 28 && monthDiff < 32 && (
                            <FutureProjection data={filteredExpenses} income={5500} currentBalance={currentBalance} />
                        )}
                        <MonthlyCategoryComparison />

                        <LimitsComparison />

                        <CalendarHeatmap />

                        <HourlySpendingsHeatMap />

                        <DailySpendingChart />
                    </>
                }
            />
        </View>
    )
}
