import { useMemo, useEffect, useState } from "react"
import { formatAmount } from "@/utils/functions/formatCurrency"
import { StyleSheet, View } from "react-native"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import Color from "color"
import { gql, useQuery } from "@apollo/client"
import { Feather } from "@expo/vector-icons"
import moment from "moment"
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, runOnJS } from "react-native-reanimated"
import { useRefresh } from "@/utils/context/RefreshContext"
import Svg, { Path, Circle, Line as SvgLine, Text as SvgText } from "react-native-svg"
import Layout from "@/constants/Layout"
import { Gesture, GestureDetector } from "react-native-gesture-handler"

interface BalanceProjection {
    month: number
    year: number
    monthsAhead: number
    projectedBalance: number
    avgMonthlyIncome: number
    avgMonthlyExpense: number
    avgMonthlyNet: number
}

interface BalancePredictionData {
    currentBalance: number
    avgMonthlyIncome: number
    avgMonthlyExpense: number
    avgMonthlyNet: number
    historicalMonths: number
    projections: BalanceProjection[]
}

interface SelectedPoint {
    value: number
    label: string
    percentChange: number
    index: number
    x: number
    y: number
}

const WALLET_BALANCE_PREDICTION = gql`
    query WalletBalancePrediction($toDate: String!) {
        walletBalancePrediction(toDate: $toDate) {
            currentBalance
            avgMonthlyIncome
            avgMonthlyExpense
            avgMonthlyNet
            historicalMonths
            projections {
                month
                year
                monthsAhead
                projectedBalance
                avgMonthlyIncome
                avgMonthlyExpense
                avgMonthlyNet
            }
        }
    }
`

interface AnimatedLineChartProps {
    data: BalanceProjection[]
    currentBalance: number
    index: number
    onPositionChange: (point: SelectedPoint | null) => void
}

const CHART_HEIGHT = 160
const CHART_WIDTH = Layout.screen.width - 102
const PADDING_LEFT = 20
const PADDING_RIGHT = 10
const TOOLTIP_WIDTH = 88

const AnimatedLineChart = ({ data, currentBalance, index, onPositionChange }: AnimatedLineChartProps) => {
    const animatedOpacity = useSharedValue(0)
    const dragX = useSharedValue(-1)
    const [tooltip, setTooltip] = useState<SelectedPoint | null>(null)

    useEffect(() => {
        animatedOpacity.value = withDelay(index * 100, withTiming(1, { duration: 600 }))
    }, [index])

    const animatedStyle = useAnimatedStyle(() => ({ opacity: animatedOpacity.value }))

    const { path, points, minValue, maxValue } = useMemo(() => {
        if (!data.length) return { path: "", points: [], minValue: 0, maxValue: 0 }

        const allBalances = [currentBalance, ...data.map((d) => d.projectedBalance)]
        const min = Math.min(...allBalances) * 0.95
        const max = Math.max(...allBalances) * 1.05

        const getY = (value: number) => {
            const normalized = (value - min) / (max - min)
            return CHART_HEIGHT - normalized * CHART_HEIGHT
        }

        const getX = (i: number, total: number) =>
            (i / total) * (CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT) + PADDING_LEFT

        const pathPoints = [
            { x: getX(0, data.length), y: getY(currentBalance), value: currentBalance, label: "Now", percentChange: 0 },
            ...data.map((d, i) => ({
                x: getX(i + 1, data.length),
                y: getY(d.projectedBalance),
                value: d.projectedBalance,
                label: `${d.monthsAhead}m`,
                percentChange: ((d.projectedBalance - currentBalance) / currentBalance) * 100,
            })),
        ]

        let pathString = `M ${pathPoints[0].x} ${pathPoints[0].y}`
        for (let i = 1; i < pathPoints.length; i++) {
            const curr = pathPoints[i]
            const prev = pathPoints[i - 1]
            const cpX = prev.x + (curr.x - prev.x) * 0.5
            pathString += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`
        }

        return { path: pathString, points: pathPoints, minValue: min, maxValue: max }
    }, [data, currentBalance])

    const handleDragUpdate = (x: number) => {
        "worklet"
        let closestIndex = -1
        let minDistance = Infinity
        for (let i = 0; i < points.length; i++) {
            const dist = Math.abs(points[i].x - x)
            if (dist < minDistance) {
                minDistance = dist
                closestIndex = i
            }
        }
        if (closestIndex >= 0) {
            const pt = { ...points[closestIndex], index: closestIndex }
            runOnJS(setTooltip)(pt)
            runOnJS(onPositionChange)(pt)
        }
    }

    const panGesture = Gesture.Pan()
        .onStart((e) => {
            const cx = Math.max(PADDING_LEFT, Math.min(CHART_WIDTH - PADDING_RIGHT, e.x))
            dragX.value = cx
            handleDragUpdate(cx)
        })
        .onUpdate((e) => {
            const cx = Math.max(PADDING_LEFT, Math.min(CHART_WIDTH - PADDING_RIGHT, e.x))
            dragX.value = cx
            handleDragUpdate(cx)
        })
        .onEnd(() => {
            dragX.value = -1
            runOnJS(setTooltip)(null)
            runOnJS(onPositionChange)(null)
        })

    const formatValue = (val: number) => (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : Math.round(val).toString())

    const animatedLineStyle = useAnimatedStyle(() => ({
        opacity: dragX.value < 0 ? 0 : 1,
        transform: [{ translateX: dragX.value < 0 ? 0 : dragX.value }],
    }))

    const tooltipLeft = tooltip ? Math.max(0, Math.min(tooltip.x - TOOLTIP_WIDTH / 2, CHART_WIDTH - TOOLTIP_WIDTH)) : 0
    const tooltipTop = tooltip ? Math.max(0, tooltip.y - 52) : 0
    const isPositive = (tooltip?.percentChange ?? 0) >= 0

    return (
        <Animated.View style={[styles.chartContainer, animatedStyle]}>
            <View style={styles.chartWithLabels}>
                <View style={styles.yAxisLabels}>
                    {[0, 1, 2, 3, 4].map((i) => {
                        const value = maxValue - ((maxValue - minValue) / 4) * i
                        return (
                            <Text key={i} size={9} color={Colors.text_light} opacity={0.5}>
                                {formatValue(value)}
                            </Text>
                        )
                    })}
                </View>

                <View style={{ position: "relative" }}>
                    <GestureDetector gesture={panGesture}>
                        <Animated.View>
                            <Svg width={CHART_WIDTH} height={CHART_HEIGHT + 17}>
                                {[0, 1, 2, 3, 4].map((i) => (
                                    <SvgLine
                                        key={i}
                                        x1={PADDING_LEFT}
                                        y1={(CHART_HEIGHT / 4) * i}
                                        x2={CHART_WIDTH - PADDING_RIGHT}
                                        y2={(CHART_HEIGHT / 4) * i}
                                        stroke={Color(Colors.secondary).alpha(0.08).string()}
                                        strokeWidth="1"
                                    />
                                ))}
                                <Path
                                    d={path}
                                    stroke={Colors.secondary}
                                    strokeWidth="2.5"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                {points.map((point, i) => (
                                    <Circle
                                        key={`pt-${i}`}
                                        cx={point.x}
                                        cy={point.y}
                                        r="3.5"
                                        fill={i === 0 ? Colors.ternary : Colors.secondary}
                                        stroke={Colors.primary}
                                        strokeWidth="1.5"
                                    />
                                ))}
                                {points.map((point, i) => (
                                    <SvgText
                                        key={`lbl-${i}`}
                                        x={point.x}
                                        y={CHART_HEIGHT + 13}
                                        fill={Colors.text_light}
                                        fontSize="10"
                                        fontWeight="600"
                                        textAnchor="middle"
                                        opacity={0.6}
                                    >
                                        {point.label}
                                    </SvgText>
                                ))}
                            </Svg>

                            <Animated.View
                                style={[styles.verticalLine, animatedLineStyle, { height: CHART_HEIGHT + 17 }]}
                            />
                        </Animated.View>
                    </GestureDetector>

                    {tooltip && (
                        <View style={[styles.tooltip, { left: tooltipLeft, top: tooltipTop }]} pointerEvents="none">
                            <Text size={9} weight="600" color={Colors.text_dark} letterSpacing={0.5} uppercase>{tooltip.label}</Text>
                            <Text size={14} weight="700" color={Colors.text_light}>{formatAmount(tooltip.value)}zł</Text>
                            <View style={styles.tooltipChange}>
                                <Feather
                                    name={isPositive ? "arrow-up" : "arrow-down"}
                                    size={8}
                                    color={isPositive ? "#4ECDC4" : "#FF8A80"}
                                />
                                <Text size={11} weight="600" color={isPositive ? "#4ECDC4" : "#FF8A80"}>
                                    {Math.abs(Math.round(tooltip.percentChange))}%
                                </Text>
                            </View>
                        </View>
                    )}
                </View>
            </View>
        </Animated.View>
    )
}

export { AnimatedLineChart }

const BalancePredictionChart = () => {
    const [selectedPoint, setSelectedPoint] = useState<SelectedPoint | null>(null)
    const toDate = useMemo(() => moment().add(12, "months").format("YYYY-MM-DD"), [])

    const query = useQuery(WALLET_BALANCE_PREDICTION, { variables: { toDate } })
    useRefresh([query.refetch], [toDate])

    const { chartData, currentBalance, avgMonthlyNet, projectedBalance } = useMemo(() => {
        const data = query.data?.walletBalancePrediction as BalancePredictionData | undefined
        if (!data) return { chartData: [], currentBalance: 0, avgMonthlyNet: 0, projectedBalance: 0 }
        return {
            chartData: data.projections,
            currentBalance: data.currentBalance,
            avgMonthlyNet: data.avgMonthlyNet,
            projectedBalance: data.projections[data.projections.length - 1]?.projectedBalance || 0,
        }
    }, [query.data])

    if (query.loading) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text size={14} color={Colors.text_light} opacity={0.7}>Loading...</Text>
                </View>
            </View>
        )
    }

    if (!chartData.length) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text size={14} color={Colors.text_light} opacity={0.7}>No prediction data</Text>
                </View>
            </View>
        )
    }

    const isPositiveNet = avgMonthlyNet >= 0
    const netColor = isPositiveNet ? "#4ECDC4" : "#FF8A80"

    return (
        <View style={styles.container}>
            <AnimatedLineChart
                data={chartData}
                currentBalance={currentBalance}
                index={0}
                onPositionChange={setSelectedPoint}
            />

            <View style={styles.footer}>
                <View style={styles.footerStat}>
                    <Text size={16} weight="700" color={Colors.text_light} mono>
                        {currentBalance >= 1000 ? `${(currentBalance / 1000).toFixed(1)}k` : formatAmount(currentBalance, 0)}zł
                    </Text>
                    <Text size={10} color={Colors.text_light} opacity={0.4} letterSpacing={0.5} uppercase>current</Text>
                </View>

                <View style={styles.changeBadge}>
                    <Feather name={isPositiveNet ? "arrow-up" : "arrow-down"} size={9} color={netColor} />
                    <Text size={12} weight="700" color={netColor}>
                        {formatAmount(Math.abs(avgMonthlyNet), 0)}zł/mo
                    </Text>
                </View>

                <View style={[styles.footerStat, { alignItems: "flex-end" }]}>
                    <Text size={16} weight="700" color={Colors.secondary} mono>
                        {projectedBalance >= 1000
                            ? `${(projectedBalance / 1000).toFixed(1)}k`
                            : formatAmount(projectedBalance, 0)}zł
                    </Text>
                    <Text size={10} color={Colors.text_light} opacity={0.4} letterSpacing={0.5} uppercase>12 months</Text>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 4,
    },
    chartContainer: {
        alignItems: "center",
        justifyContent: "center",
    },
    chartWithLabels: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    yAxisLabels: {
        width: 40,
        height: CHART_HEIGHT + 17,
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingBottom: 17,
    },
    verticalLine: {
        position: "absolute",
        top: 0,
        left: -1.5,
        width: 1.5,
        backgroundColor: Color(Colors.secondary_light_1).alpha(0.6).string(),
        shadowColor: Colors.secondary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        borderRadius: 2,
    },
    tooltip: {
        position: "absolute",
        width: TOOLTIP_WIDTH,
        backgroundColor: Color(Colors.primary_light).alpha(0.95).string(),
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderWidth: 1,
        borderColor: Color(Colors.secondary).alpha(0.3).string(),
        alignItems: "center",
        gap: 1,
    },
    tooltipChange: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
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
        height: CHART_HEIGHT + 30,
        justifyContent: "center",
        alignItems: "center",
    },
})

export default BalancePredictionChart
