import Layout from "@/constants/Layout"
import { useMemo, useState, useEffect } from "react"
import { StyleSheet, View } from "react-native"
import Text from "@/components/ui/Text/Text"
import Colors, { secondary_candidates } from "@/constants/Colors"
import Color from "color"
import ChartTemplate, { Types } from "./ChartTemplate"
import { gql, useQuery } from "@apollo/client"
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from "react-native-reanimated"
import AnimatedBar from "@/components/ui/Charts/AnimatedBar"

interface LegendProps {
    data: { label: string; value: number; frontColor?: string; color?: string; prevValue?: number }[]
    totalSum: number
    prevTotalSum: number
    type: "total" | "avg" | "median" | "count"
}

export interface BarItem {
    label: string
    value: number
    prevValue?: number
    frontColor: string
    day: number
}

export const DAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const labels = DAY_LABELS

function ChartLegend({ data, type }: LegendProps) {
    return (
        <View style={styles.legendContainer}>
            {data.map((item, index) => {
                const changePercent =
                    item.prevValue && item.prevValue > 0 ? ((item.value - item.prevValue) / item.prevValue) * 100 : 0

                return (
                    <View key={index} style={styles.legendItem}>
                        <View style={styles.legendTextContainer}>
                            <Text size={14} weight="600" color={Colors.foreground}>{labels[index]}</Text>
                            <View style={styles.valueRow}>
                                <Text size={12} color={blueText}>
                                    {item.value.toFixed(type === "count" ? 0 : 1)}
                                    {type !== "count" && "zł"}
                                </Text>
                                {item.prevValue !== undefined && (
                                    <Text size={10} weight="600" color={changePercent >= 0 ? "#4ade80" : "#f87171"}>
                                        {changePercent >= 0 ? "+" : ""}
                                        {changePercent.toFixed(0)}%
                                    </Text>
                                )}
                            </View>
                        </View>
                    </View>
                )
            })}
        </View>
    )
}

export const CustomDayBarChart = ({ data, maxValue, type }: { data: BarItem[]; maxValue: number; type: Types }) => {
    const [selectedBar, setSelectedBar] = useState<BarItem | null>(null)
    const tooltipOpacity = useSharedValue(0)
    const tooltipScale = useSharedValue(0.8)

    const BAR_WIDTH = 45
    const BAR_SPACING = 8
    const CHART_HEIGHT = 320

    const handleBarPress = (item: BarItem) => {
        setSelectedBar(item)
        tooltipOpacity.value = withTiming(1, { duration: 300 })
        tooltipScale.value = withTiming(1, { duration: 300 })

        setTimeout(() => {
            tooltipOpacity.value = withTiming(0, { duration: 300 })
            tooltipScale.value = withTiming(0.8, { duration: 300 }, () => {
                runOnJS(setSelectedBar)(null)
            })
        }, 3000)
    }

    const animatedTooltipStyle = useAnimatedStyle(() => ({
        opacity: tooltipOpacity.value,
        transform: [{ scale: tooltipScale.value }],
    }))

    useEffect(() => {
        tooltipOpacity.value = 0
        tooltipScale.value = 0.8
    }, [data])

    return (
        <View style={styles.chartWrapper}>
            <View style={styles.yAxisLabels}>
                {[4, 3, 2, 1, 0].map((i) => (
                    <Text key={i} size={10} color={Colors.foreground}>
                        {type === "count" ? Math.round((maxValue / 4) * i) : Math.round((maxValue / 4) * i)}
                    </Text>
                ))}
            </View>

            <View style={styles.chartContent}>
                <View style={styles.gridLines}>
                    {[0, 1, 2, 3, 4].map((i) => (
                        <View key={i} style={[styles.gridLine, { top: CHART_HEIGHT - (CHART_HEIGHT / 4) * i }]} />
                    ))}
                </View>

                <View style={styles.barsContainer}>
                    {data.map((item, index) => (
                        <AnimatedBar
                            key={index}
                            value={item.value}
                            prevValue={item.prevValue}
                            maxValue={maxValue}
                            chartHeight={CHART_HEIGHT}
                            color={Colors.secondary}
                            labelColor={item.frontColor}
                            label={item.label}
                            barWidth={BAR_WIDTH}
                            marginRight={index < data.length - 1 ? BAR_SPACING : 0}
                            minBarHeight={20}
                            onPress={() => handleBarPress(item)}
                            valueLabel={item.value.toFixed(type === "count" ? 0 : 1)}
                        />
                    ))}
                </View>

                {selectedBar && (
                    <Animated.View style={[styles.tooltip, animatedTooltipStyle]}>
                        <Text size={14} weight="bold" color={Colors.foreground}>{labels[selectedBar.day - 1]}</Text>
                        <Text size={12} color={Colors.foreground} style={{ marginVertical: 1 }}>
                            Current: {selectedBar.value.toFixed(type === "count" ? 0 : 2)}
                            {type === "count" ? " tx" : "zł"}
                        </Text>
                        {selectedBar.prevValue !== undefined ? (
                            <Text size={12} color={Colors.foreground} style={{ marginVertical: 1 }}>
                                Previous: {selectedBar.prevValue.toFixed(type === "count" ? 0 : 2)}
                                {type === "count" ? " tx" : "zł"}
                            </Text>
                        ) : (
                            <Text size={12} color={Colors.foreground} italic opacity={0.7} style={{ marginVertical: 1 }}>
                                Previous: No data
                            </Text>
                        )}
                    </Animated.View>
                )}
            </View>
        </View>
    )
}

const SpendingsByDay = ({ type, ...props }: { dateRange: [string, string]; type: Types }) => {
    const previousDateRange = useMemo(() => {
        const startDate = new Date(props.dateRange[0])
        const endDate = new Date(props.dateRange[1])
        const diffTime = endDate.getTime() - startDate.getTime()

        const prevEndDate = new Date(startDate.getTime() - 1)
        const prevStartDate = new Date(prevEndDate.getTime() - diffTime)

        return [prevStartDate.toISOString().split("T")[0], prevEndDate.toISOString().split("T")[0]]
    }, [props.dateRange])

    const query = useQuery<{
        statisticsDayOfWeek: { day: number; total: number; avg: number; median: number; count: number }[]
    }>(
        gql`
            query StatisticsDayOfWeek($startDate: String!, $endDate: String!) {
                statisticsDayOfWeek(startDate: $startDate, endDate: $endDate) {
                    day
                    total
                    avg
                    median
                    count
                }
            }
        `,
        {
            variables: {
                startDate: props.dateRange[0],
                endDate: props.dateRange[1],
            },
            fetchPolicy: "cache-and-network",
        },
    )

    const prevQuery = useQuery<{
        statisticsDayOfWeek: { day: number; total: number; avg: number; median: number; count: number }[]
    }>(
        gql`
            query PreviousStatisticsDayOfWeek($startDate: String!, $endDate: String!) {
                statisticsDayOfWeek(startDate: $startDate, endDate: $endDate) {
                    day
                    total
                    avg
                    median
                    count
                }
            }
        `,
        {
            variables: {
                startDate: previousDateRange[0],
                endDate: previousDateRange[1],
            },
            fetchPolicy: "cache-and-network",
        },
    )

    const data = query.data?.statisticsDayOfWeek || []
    const prevData = prevQuery.data?.statisticsDayOfWeek || []

    const { chartData, maxValue, total, prevTotal } = useMemo(() => {
        const prevDataMap = new Map(prevData.map((item) => [item.day, item]))

        const days = data.map((item, index) => {
            const prevItem = prevDataMap.get(item.day)
            return {
                label: labels[item.day - 1].slice(0, 3),
                value: item[type],
                prevValue: prevItem ? prevItem[type] : undefined,
                frontColor: secondary_candidates[index % secondary_candidates.length],
                day: item.day,
            }
        })

        const allValues = [
            ...days.map((d) => d.value),
            ...days.filter((d) => d.prevValue !== undefined).map((d) => d.prevValue!),
        ]

        const maxVal = allValues.length > 0 ? Math.max(...allValues) * 1.1 : 100
        const currentTotal = data.reduce((acc, curr) => acc + curr[type], 0)
        const previousTotal = prevData.reduce((acc, curr) => acc + curr[type], 0)

        return {
            chartData: days,
            maxValue: maxVal,
            total: currentTotal,
            prevTotal: previousTotal,
        }
    }, [data, prevData, type])

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }

    if (query.loading || prevQuery.loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text size={16} color={Colors.foreground}>Loading...</Text>
            </View>
        )
    }

    return (
        <View>
            <View>
                <CustomDayBarChart data={chartData} maxValue={maxValue} type={type} />

                <View style={styles.periodLegendContainer}>
                    <View style={styles.periodLegend}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                            <View
                                style={{
                                    width: 12,
                                    height: 8,
                                    backgroundColor: secondary_candidates[0],
                                    borderRadius: 2,
                                }}
                            />
                            <Text size={12} color={Colors.foreground}>Current Period</Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                            <View
                                style={{
                                    width: 12,
                                    height: 8,
                                    backgroundColor: Color(secondary_candidates[0]).alpha(0.25).string(),
                                    borderRadius: 2,
                                }}
                            />
                            <Text size={12} color={Colors.foreground}>Previous Period</Text>
                        </View>
                    </View>
                    <Text size={10} color={Color(Colors.foreground).alpha(0.7).string()} align="center">
                        {formatDate(props.dateRange[0])} - {formatDate(props.dateRange[1])} vs{" "}
                        {formatDate(previousDateRange[0])} - {formatDate(previousDateRange[1])}
                    </Text>
                </View>

                <View style={styles.barLegendContainer}>
                    <ChartLegend type={type} data={chartData} totalSum={total} prevTotalSum={prevTotal} />
                </View>
            </View>
        </View>
    )
}

const blueText = Colors.foreground_secondary

const styles = StyleSheet.create({
    chartWrapper: {
        flexDirection: "row",
        marginTop: 10,
    },
    yAxisLabels: {
        width: 35,
        height: 320,
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingLeft: 2,
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
        height: 320,
    },
    gridLine: {
        position: "absolute",
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: Color(Colors.primary).lighten(0.8).string(),
    },
    barsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "flex-end",
        height: 320,
        paddingHorizontal: 5,
    },
    tooltip: {
        position: "absolute",
        top: 20,
        left: 20,
        backgroundColor: Color(Colors.primary).lighten(0.5).string(),
        padding: 10,
        borderRadius: 5,
        minWidth: 120,
        zIndex: 10,
    },
    periodLegendContainer: {
        marginTop: 15,
        alignItems: "center",
        gap: 8,
    },
    periodLegend: {
        flexDirection: "row",
        gap: 15,
        justifyContent: "center",
    },
    legendContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: 8,
    },
    barLegendContainer: {
        marginTop: 20,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 10,
        backgroundColor: Color(Colors.primary).lighten(0.2).string(),
        borderRadius: 6,
        width: "48%",
    },
    colorIndicator: {
        width: 14,
        height: 14,
        borderRadius: 7,
        marginRight: 10,
    },
    legendTextContainer: {
        flex: 1,
    },
    valueRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 2,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        minHeight: 300,
    },
})

export { SpendingsByDay }

export default () => {
    return (
        <ChartTemplate
            types={["total", "count", "avg", "median"] as Types[]}
            title="Spendings by day of week"
            description="Spendings by day of week vs previous period"
        >
            {({ dateRange, type }) => <SpendingsByDay dateRange={dateRange} type={type} />}
        </ChartTemplate>
    )
}
