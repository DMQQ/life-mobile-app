import { useMemo } from "react"
import { StyleSheet, View } from "react-native"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import Color from "color"
import { gql, useQuery } from "@apollo/client"
import { Feather } from "@expo/vector-icons"
import moment from "moment"
import { useRefresh } from "@/utils/context/RefreshContext"
import AnimatedBar from "@/components/ui/Charts/AnimatedBar"

const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const CHART_HEIGHT = 160
const MIN_BAR_HEIGHT = 12

const getBarHeight = (val: number, maxValue: number): number => {
    if (!val || !maxValue) return 0
    const proportion = val / maxValue
    return Math.max(proportion * CHART_HEIGHT, val > 0 ? MIN_BAR_HEIGHT : 0)
}

const STATISTICS_DAY_OF_WEEK = gql`
    query HomeStatisticsDayOfWeek($startDate: String!, $endDate: String!) {
        statisticsDayOfWeek(startDate: $startDate, endDate: $endDate) {
            day
            total
        }
    }
`

const CompactSpendingChart = () => {
    const dateRange = useMemo(
        () => [moment().startOf("isoWeek").format("YYYY-MM-DD"), moment().endOf("isoWeek").format("YYYY-MM-DD")],
        [],
    )

    const previousDateRange = useMemo(
        () => [
            moment().subtract(1, "weeks").startOf("isoWeek").format("YYYY-MM-DD"),
            moment().subtract(1, "weeks").endOf("isoWeek").format("YYYY-MM-DD"),
        ],
        [],
    )

    const query = useQuery(STATISTICS_DAY_OF_WEEK, { variables: { startDate: dateRange[0], endDate: dateRange[1] } })
    const prevQuery = useQuery(STATISTICS_DAY_OF_WEEK, {
        variables: { startDate: previousDateRange[0], endDate: previousDateRange[1] },
    })

    useRefresh([query.refetch, prevQuery.refetch], [dateRange, previousDateRange])

    const { chartData, maxValue, total, prevTotal, percentageChange } = useMemo(() => {
        const data = (query.data?.statisticsDayOfWeek || []) as { day: number; total: number }[]
        const prevData = (prevQuery.data?.statisticsDayOfWeek || []) as { day: number; total: number }[]

        const prevDataMap = new Map<number, number>(prevData.map((item) => [item.day, item.total]))

        const days: { label: string; value: number; prevValue: number; day: number }[] = Array.from(
            { length: 7 },
            (_, i) => {
                const dayData = data.find((d) => d.day === i + 1)
                const prevValue = prevDataMap.get(i + 1) || 0
                return { label: labels[i], value: dayData?.total || 0, prevValue, day: i + 1 }
            },
        )

        const allValues = [...days.map((d) => d.value), ...days.map((d) => d.prevValue)].filter((v) => v > 0)
        const maxVal = allValues.length > 0 ? Math.max(...allValues) * 1.2 : 100

        const currentTotal = data.reduce((acc, curr) => acc + curr.total, 0)
        const previousTotal = prevData.reduce((acc, curr) => acc + curr.total, 0)
        const change = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0

        return {
            chartData: days,
            maxValue: maxVal,
            total: currentTotal,
            prevTotal: previousTotal,
            percentageChange: change,
        }
    }, [query.data, prevQuery.data])

    const labelValues = useMemo(
        () => [...new Set(chartData.map((d) => [d.value, d.prevValue]).flat())].sort((a, b) => a - b).reverse(),
        [chartData],
    )

    if (query.loading || prevQuery.loading) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text size={14} color={Colors.text_light} opacity={0.7}>Loading...</Text>
                </View>
            </View>
        )
    }

    const isUp = percentageChange >= 0
    const changeColor = isUp ? "#FF8A80" : "#4ECDC4"

    return (
        <View style={styles.container}>
            <View style={styles.chartWrapper}>
                <View style={styles.yAxisLabels}>
                    {labelValues.map((v, i, array) => {
                        const value = Math.round(v)
                        const previousValue = array[i - 1] ? Math.round(array[i - 1]) : 0
                        const prevDistance = getBarHeight(previousValue, maxValue)
                        const currentDistance = getBarHeight(value, maxValue)
                        if (prevDistance - currentDistance < 12 && i !== 0) return null
                        return (
                            <Text
                                key={i}
                                size={10}
                                weight="500"
                                opacity={0.5}
                                style={{ position: "absolute", bottom: currentDistance + 15, width: 50, marginLeft: -5 }}
                            >
                                {value > 1000 ? `${(value / 1000).toFixed(1)}k` : value + "zł"}
                            </Text>
                        )
                    })}
                </View>

                <View style={styles.chartContent}>
                    <View style={styles.gridLines}>
                        {labelValues.map((v, i, array) => {
                            const value = Math.round(v)
                            const previousValue = array[i - 1] ? Math.round(array[i - 1]) : 0
                            const prevDistance = getBarHeight(previousValue, maxValue)
                            const currentDistance = getBarHeight(value, maxValue)
                            if (prevDistance - currentDistance < 12 && i !== 0) return null
                            return <View key={i} style={[styles.gridLine, { bottom: currentDistance + 15 }]} />
                        })}
                    </View>

                    <View style={styles.chartContainer}>
                        {chartData.map((item, index) => (
                            <AnimatedBar
                                key={index}
                                value={item.value}
                                prevValue={item.prevValue}
                                maxValue={maxValue}
                                chartHeight={CHART_HEIGHT}
                                color={Colors.secondary}
                                label={item.label}
                                index={index}
                                flex={1}
                                minBarHeight={MIN_BAR_HEIGHT}
                            />
                        ))}
                    </View>
                </View>
            </View>

            <View style={styles.footer}>
                <View style={styles.footerStat}>
                    <Text size={16} weight="700" color={Colors.text_light} mono>{Math.round(prevTotal)}zł</Text>
                    <Text size={10} color={Colors.text_light} opacity={0.4} letterSpacing={0.5} uppercase>last week</Text>
                </View>

                <View style={styles.changeBadge}>
                    <Feather name={isUp ? "arrow-up" : "arrow-down"} size={9} color={changeColor} />
                    <Text size={13} weight="700" color={changeColor}>
                        {Math.abs(Math.round(percentageChange))}%
                    </Text>
                </View>

                <View style={[styles.footerStat, { alignItems: "flex-end" }]}>
                    <Text size={16} weight="700" color={Colors.secondary} mono>{Math.round(total)}zł</Text>
                    <Text size={10} color={Colors.text_light} opacity={0.4} letterSpacing={0.5} uppercase>this week</Text>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 4,
        paddingHorizontal: 4,
    },
    chartWrapper: {
        flexDirection: "row",
        alignItems: "flex-end",
    },
    yAxisLabels: {
        width: 40,
        height: CHART_HEIGHT,
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingRight: 8,
    },
    chartContent: {
        flex: 1,
        position: "relative",
    },
    gridLines: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: CHART_HEIGHT,
    },
    gridLine: {
        position: "absolute",
        left: 0,
        right: 0,
        height: 0.5,
        backgroundColor: Color(Colors.secondary).alpha(0.1).string(),
    },
    chartContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        height: CHART_HEIGHT,
        marginBottom: 4,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 12,
        paddingHorizontal: 4,
    },
    footerStat: {
        gap: 2,
    },
    changeBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "rgba(255,255,255,0.06)",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    loadingContainer: {
        height: CHART_HEIGHT,
        justifyContent: "center",
        alignItems: "center",
    },
})

export default CompactSpendingChart
