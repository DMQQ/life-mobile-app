import { useMemo, useEffect, useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import Colors from "@/constants/Colors"
import Color from "color"
import { gql, useQuery } from "@apollo/client"
import { AntDesign } from "@expo/vector-icons"
import moment from "moment"
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, runOnJS } from "react-native-reanimated"
import { useRefresh } from "@/utils/context/RefreshContext"
import Svg, { Path, Circle, Line as SvgLine, Text as SvgText } from "react-native-svg"
import { Padding } from "@/constants/Values"
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
    onPositionChange: (point: { value: number; label: string; percentChange: number; index: number } | null) => void
}

const AnimatedLineChart = ({ data, currentBalance, index, onPositionChange }: AnimatedLineChartProps) => {
    const animatedOpacity = useSharedValue(0)
    const animatedProgress = useSharedValue(0)
    const dragX = useSharedValue(-1)

    const CHART_HEIGHT = 150
    const CHART_WIDTH = Layout.screen.width - 70
    const PADDING_LEFT = 20
    const PADDING_RIGHT = 10

    useEffect(() => {
        animatedOpacity.value = withDelay(index * 100, withTiming(1, { duration: 600 }))
        animatedProgress.value = withDelay(index * 100, withTiming(1, { duration: 1200 }))
    }, [index])

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: animatedOpacity.value,
    }))

    // Calculate path for the line chart
    const { path, points, minValue, maxValue } = useMemo(() => {
        if (!data.length) return { path: "", points: [], minValue: 0, maxValue: 0 }

        const allBalances = [currentBalance, ...data.map((d) => d.projectedBalance)]
        const min = Math.min(...allBalances) * 0.95
        const max = Math.max(...allBalances) * 1.05

        const getY = (value: number) => {
            const normalized = (value - min) / (max - min)
            return CHART_HEIGHT - normalized * CHART_HEIGHT
        }

        const getX = (index: number, total: number) => {
            return (index / total) * (CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT) + PADDING_LEFT
        }

        // Create path starting from current balance
        const pathPoints = [
            {
                x: getX(0, data.length),
                y: getY(currentBalance),
                value: currentBalance,
                label: "Now",
                percentChange: 0,
            },
            ...data.map((d, i) => ({
                x: getX(i + 1, data.length),
                y: getY(d.projectedBalance),
                value: d.projectedBalance,
                label: `${d.monthsAhead}m`,
                percentChange: ((d.projectedBalance - currentBalance) / currentBalance) * 100,
            })),
        ]

        // Create smooth curve using cubic bezier
        let pathString = `M ${pathPoints[0].x} ${pathPoints[0].y}`

        for (let i = 1; i < pathPoints.length; i++) {
            const curr = pathPoints[i]
            const prev = pathPoints[i - 1]

            // Calculate control points for smooth curve
            const controlPointX = prev.x + (curr.x - prev.x) * 0.5

            pathString += ` C ${controlPointX} ${prev.y}, ${controlPointX} ${curr.y}, ${curr.x} ${curr.y}`
        }

        return {
            path: pathString,
            points: pathPoints,
            minValue: min,
            maxValue: max,
        }
    }, [data, currentBalance])

    const handleDragUpdate = (x: number) => {
        "worklet"
        let closestIndex = -1
        let minDistance = Infinity

        for (let i = 0; i < points.length; i++) {
            const distance = Math.abs(points[i].x - x)
            if (distance < minDistance) {
                minDistance = distance
                closestIndex = i
            }
        }

        if (closestIndex >= 0 && closestIndex < points.length) {
            runOnJS(onPositionChange)({ ...points[closestIndex], index: closestIndex })
        }
    }

    const panGesture = Gesture.Pan()
        .onStart((event) => {
            const clampedX = Math.max(PADDING_LEFT, Math.min(CHART_WIDTH - PADDING_RIGHT, event.x))
            dragX.value = clampedX
            handleDragUpdate(clampedX)
        })
        .onUpdate((event) => {
            const clampedX = Math.max(PADDING_LEFT, Math.min(CHART_WIDTH - PADDING_RIGHT, event.x))
            dragX.value = clampedX
            handleDragUpdate(clampedX)
        })
        .onEnd(() => {
            // Keep the line visible at last position
        })

    const formatValue = (val: number) => {
        if (val >= 1000) return `${(val / 1000).toFixed(1)}k`
        return Math.round(val).toString()
    }

    const animatedLineStyle = useAnimatedStyle(() => {
        if (dragX.value < 0) {
            return {
                opacity: 0,
                transform: [{ translateX: 0 }],
            }
        }

        return {
            opacity: 1,
            transform: [{ translateX: dragX.value }],
        }
    })

    return (
        <Animated.View style={[styles.chartContainer, animatedStyle]}>
            <View style={styles.chartWithLabels}>
                {/* Y-axis labels */}
                <View style={styles.yAxisLabels}>
                    {[0, 1, 2, 3, 4].map((i) => {
                        const value = maxValue - ((maxValue - minValue) / 4) * i
                        return (
                            <Text key={i} style={styles.yAxisLabel}>
                                {formatValue(value)}
                            </Text>
                        )
                    })}
                </View>

                {/* Chart SVG with gesture handler */}
                <GestureDetector gesture={panGesture}>
                    <Animated.View>
                        <Svg width={CHART_WIDTH} height={CHART_HEIGHT + 30}>
                            {/* Grid lines */}
                            {[0, 1, 2, 3, 4].map((i) => {
                                const y = (CHART_HEIGHT / 4) * i
                                return (
                                    <SvgLine
                                        key={i}
                                        x1={PADDING_LEFT}
                                        y1={y}
                                        x2={CHART_WIDTH - PADDING_RIGHT}
                                        y2={y}
                                        stroke={Color(Colors.secondary).alpha(0.1).string()}
                                        strokeWidth="1"
                                    />
                                )
                            })}

                            {/* Line path */}
                            <Path
                                d={path}
                                stroke={Colors.secondary}
                                strokeWidth="3"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            {/* Data points */}
                            {points.map((point, i) => (
                                <Circle
                                    key={`point-${i}`}
                                    cx={point.x}
                                    cy={point.y}
                                    r="4"
                                    fill={i === 0 ? Colors.ternary : Colors.secondary}
                                    stroke={Colors.primary}
                                    strokeWidth="2"
                                />
                            ))}

                            {/* X-axis labels */}
                            {points.map((point, i) => (
                                <SvgText
                                    key={`label-${i}`}
                                    x={point.x}
                                    y={CHART_HEIGHT + 20}
                                    fill={Colors.text_light}
                                    fontSize="11"
                                    fontWeight="600"
                                    textAnchor="middle"
                                    opacity={0.7}
                                >
                                    {point.label}
                                </SvgText>
                            ))}
                        </Svg>

                        {/* Draggable vertical line indicator */}
                        <Animated.View
                            style={[styles.verticalLine, animatedLineStyle, { height: CHART_HEIGHT + 30 }]}
                        />
                    </Animated.View>
                </GestureDetector>
            </View>
        </Animated.View>
    )
}

const BalancePredictionChart = () => {
    const [selectedPoint, setSelectedPoint] = useState<{
        value: number
        label: string
        percentChange: number
        index: number
    } | null>(null)

    const toDate = useMemo(() => moment().add(12, "months").format("YYYY-MM-DD"), [])

    const query = useQuery(WALLET_BALANCE_PREDICTION, {
        variables: { toDate },
    })

    useRefresh([query.refetch], [toDate])

    const { chartData, currentBalance, avgMonthlyNet, projectedGrowth } = useMemo(() => {
        const data = query.data?.walletBalancePrediction as BalancePredictionData | undefined

        if (!data) {
            return {
                chartData: [],
                currentBalance: 0,
                avgMonthlyNet: 0,
                projectedGrowth: 0,
            }
        }

        // Use only 1, 2, 3, 6, 12 months for cleaner visualization
        const selectedProjections = data.projections

        const endBalance = selectedProjections[selectedProjections.length - 1]?.projectedBalance || 0
        const growth = endBalance - data.currentBalance

        return {
            chartData: selectedProjections,
            currentBalance: data.currentBalance,
            avgMonthlyNet: data.avgMonthlyNet,
            projectedGrowth: growth,
        }
    }, [query.data])

    if (query.loading) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            </View>
        )
    }

    if (!chartData.length) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>No prediction data available</Text>
                </View>
            </View>
        )
    }

    const isPositiveGrowth = projectedGrowth >= 0

    return (
        <View style={styles.container}>
            <View style={styles.chartWrapper}>
                <AnimatedLineChart
                    data={chartData}
                    currentBalance={currentBalance}
                    index={0}
                    onPositionChange={setSelectedPoint}
                />
            </View>

            {/* Details below chart */}
            {selectedPoint ? (
                <View style={styles.detailsContainer}>
                    <View style={styles.detailsHeader}>
                        <Text style={styles.detailsTitle}>{selectedPoint.label}</Text>
                        <Text style={styles.detailsBalance}>{Math.round(selectedPoint.value)}zł</Text>
                    </View>

                    <View style={styles.detailsGrid}>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Change</Text>
                            <View style={styles.detailValueContainer}>
                                <AntDesign
                                    name={selectedPoint.percentChange >= 0 ? "caret-up" : "caret-down"}
                                    size={14}
                                    color={selectedPoint.percentChange >= 0 ? "#4ECDC4" : "#FF8A80"}
                                />
                                <Text
                                    style={[
                                        styles.detailValue,
                                        { color: selectedPoint.percentChange >= 0 ? "#4ECDC4" : "#FF8A80" },
                                    ]}
                                >
                                    {Math.abs(Math.round(selectedPoint.percentChange))}%
                                </Text>
                            </View>
                        </View>

                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Amount</Text>
                            <Text style={styles.detailValue}>
                                {selectedPoint.percentChange >= 0 ? "+" : ""}
                                {Math.round(selectedPoint.value - currentBalance)}zł
                            </Text>
                        </View>
                    </View>
                </View>
            ) : (
                <View style={styles.footer}>
                    <View style={styles.totalContainer}>
                        <Text style={styles.totalAmount}>{Math.round(currentBalance)}zł</Text>
                        <Text style={styles.totalLabel}>Current</Text>
                    </View>

                    <View style={styles.tinyLegendContainer}>
                        <View style={styles.changeIndicator}>
                            <AntDesign
                                name={isPositiveGrowth ? "caret-up" : "caret-down"}
                                size={12}
                                color={isPositiveGrowth ? "#4ECDC4" : "#FF8A80"}
                            />
                            <Text
                                style={[
                                    styles.changeText,
                                    {
                                        color: isPositiveGrowth ? "#4ECDC4" : "#FF8A80",
                                    },
                                ]}
                            >
                                {Math.round(avgMonthlyNet)}zł/mo avg
                            </Text>
                        </View>
                    </View>

                    <View style={styles.totalContainer}>
                        <Text style={styles.projectedAmount}>
                            {Math.round(chartData[chartData.length - 1].projectedBalance)}zł
                        </Text>
                        <Text style={styles.totalLabel}>In 12 months</Text>
                    </View>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 4,
        paddingHorizontal: 4,
    },
    chartWrapper: {
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
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
        height: 150,
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingVertical: 0,
    },
    yAxisLabel: {
        color: Colors.text_light,
        fontSize: 10,
        opacity: 0.7,
    },
    verticalLine: {
        position: "absolute",
        top: 0,
        left: -1.5,
        width: 2,
        backgroundColor: Color(Colors.secondary_light_1).string(),
        shadowColor: Colors.secondary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 6,
        borderRadius: 2,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 15,
    },
    totalContainer: {
        alignItems: "center",
    },
    totalAmount: {
        fontSize: 24,
        fontWeight: "bold",
        color: Colors.text_light,
        marginBottom: 2,
    },
    projectedAmount: {
        fontSize: 24,
        fontWeight: "bold",
        color: Colors.secondary,
        marginBottom: 2,
    },
    totalLabel: {
        fontSize: 9,
        color: Colors.text_light,
        opacity: 0.6,
    },
    tinyLegendContainer: {
        gap: 4,
    },
    changeIndicator: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    changeText: {
        fontSize: 14,
        fontWeight: "600",
    },
    loadingContainer: {
        height: 200,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        color: Colors.text_light,
        fontSize: 14,
        opacity: 0.7,
    },
    detailsContainer: {
        marginTop: 15,
        padding: Padding.m,
        backgroundColor: Color(Colors.primary_light).alpha(0.5).string(),
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Color(Colors.secondary).alpha(0.2).string(),
    },
    detailsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: Padding.m,
    },
    detailsTitle: {
        fontSize: 12,
        fontWeight: "600",
        color: Color(Colors.text_light).alpha(0.7).string(),
        textTransform: "uppercase",
    },
    detailsBalance: {
        fontSize: 24,
        fontWeight: "700",
        color: Colors.text_light,
    },
    detailsGrid: {
        flexDirection: "row",
        justifyContent: "space-around",
        gap: Padding.l,
    },
    detailItem: {
        flex: 1,
        alignItems: "center",
        gap: 4,
    },
    detailLabel: {
        fontSize: 11,
        color: Color(Colors.text_light).alpha(0.6).string(),
        textTransform: "uppercase",
        fontWeight: "500",
    },
    detailValueContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: "700",
        color: Colors.text_light,
    },
})

export default BalancePredictionChart
