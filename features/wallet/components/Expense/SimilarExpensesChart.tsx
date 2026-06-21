import { formatAmount } from "@/utils/functions/formatCurrency"
import Colors from "@/constants/Colors"
import Color from "color"
import dayjs from "dayjs"
import { useEffect } from "react"
import { StyleSheet, View, useWindowDimensions } from "react-native"
import Text from "@/components/ui/Text/Text"
import Svg, {
    Defs,
    LinearGradient as SvgGrad,
    Stop,
    Path,
    Polyline,
    Circle,
    Line as SvgLine,
} from "react-native-svg"
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated"

interface Expense {
    id: string
    amount: number
    date: string
}

interface SimilarExpensesChartProps {
    expenses: Expense[]
    currentExpenseId: string
    tint?: string
}

const CHART_H = 96
const PAD = 10

function Sparkline({
    values,
    color,
    uid,
    width,
    currentIndex,
    avgRatio,
}: {
    values: number[]
    color: string
    uid: string
    width: number
    currentIndex: number
    avgRatio: number
}) {
    if (values.length < 2) return null

    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min || 1

    const xs = values.map((_, i) => PAD + (i / (values.length - 1)) * (width - PAD * 2))
    const ys = values.map((v) => PAD + (1 - (v - min) / range) * (CHART_H - PAD * 2))
    const pts = xs.map((x, i) => `${x},${ys[i]}`).join(" ")
    const area =
        `M ${xs[0]},${CHART_H} ` +
        xs.map((x, i) => `L ${x},${ys[i]}`).join(" ") +
        ` L ${xs[xs.length - 1]},${CHART_H} Z`

    const avgY = PAD + (1 - avgRatio) * (CHART_H - PAD * 2)

    return (
        <Svg width={width} height={CHART_H}>
            <Defs>
                <SvgGrad id={uid} x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor={color} stopOpacity="0.28" />
                    <Stop offset="1" stopColor={color} stopOpacity="0" />
                </SvgGrad>
            </Defs>
            <Path d={area} fill={`url(#${uid})`} />
            <SvgLine
                x1={PAD}
                y1={avgY}
                x2={width - PAD}
                y2={avgY}
                stroke={Color(Colors.text_dark).alpha(0.35).string()}
                strokeWidth={1}
                strokeDasharray="4 4"
            />
            <Polyline
                points={pts}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {xs.map((x, i) => {
                const isCurrent = i === currentIndex
                return (
                    <Circle
                        key={i}
                        cx={x}
                        cy={ys[i]}
                        r={isCurrent ? 5.5 : 3}
                        fill={isCurrent ? color : Color(color).alpha(0.45).string()}
                        stroke={isCurrent ? Colors.primary_lighter : "none"}
                        strokeWidth={isCurrent ? 2 : 0}
                    />
                )
            })}
        </Svg>
    )
}

export default function SimilarExpensesChart({ expenses, currentExpenseId, tint }: SimilarExpensesChartProps) {
    if (!expenses || expenses.length < 2) return null

    const { width: screenWidth } = useWindowDimensions()
    const chartWidth = screenWidth - 64

    const opacity = useSharedValue(0)
    const translateY = useSharedValue(8)

    useEffect(() => {
        opacity.value = withTiming(1, { duration: 400 })
        translateY.value = withTiming(0, { duration: 400 })
    }, [])

    const animStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }))

    const sorted = [...expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const amounts = sorted.map((e) => e.amount)
    const maxAmount = Math.max(...amounts)
    const minAmount = Math.min(...amounts)
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length
    const currentIndex = sorted.findIndex((e) => e.id === currentExpenseId)

    const minVal = minAmount
    const maxVal = maxAmount
    const avgRatio = (avgAmount - minVal) / (maxVal - minVal || 1)

    const currentX = PAD + (currentIndex / (sorted.length - 1)) * (chartWidth - PAD * 2)

    return (
        <Animated.View style={[styles.container, tint && { backgroundColor: Color(tint).mix(Color(Colors.primary_lighter), 0.95).hex() }, animStyle]}>
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text size={17} weight="700" color={Colors.secondary} mono>
                        {amounts.length}×
                    </Text>
                    <Text size={10} color={Colors.text_dark} style={styles.statLabel}>
                        visits
                    </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statItem}>
                    <Text size={17} weight="700" color={Colors.foreground} mono>
                        {formatAmount(avgAmount)}
                    </Text>
                    <Text size={10} color={Colors.text_dark} style={styles.statLabel}>
                        avg
                    </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statItem}>
                    <Text size={17} weight="700" color={Colors.positive} mono>
                        {formatAmount(minAmount)}
                    </Text>
                    <Text size={10} color={Colors.text_dark} style={styles.statLabel}>
                        min
                    </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statItem}>
                    <Text size={17} weight="700" color={Colors.negative} mono>
                        {formatAmount(maxAmount)}
                    </Text>
                    <Text size={10} color={Colors.text_dark} style={styles.statLabel}>
                        max
                    </Text>
                </View>
            </View>

            <View style={styles.chartWrapper}>
                <Sparkline
                    values={amounts}
                    color={Colors.secondary}
                    uid="similar-expenses-spark"
                    width={chartWidth}
                    currentIndex={currentIndex}
                    avgRatio={avgRatio}
                />

                <View style={[styles.dateRow, { width: chartWidth }]}>
                    <Text size={9} color={Colors.text_dark}>
                        {dayjs(sorted[0].date).format("D MMM")}
                    </Text>
                    {currentIndex > 0 && currentIndex < sorted.length - 1 && (
                        <Text
                            size={9}
                            weight="700"
                            color={Colors.secondary}
                            style={{ position: "absolute", left: currentX - 18 }}
                        >
                            {dayjs(sorted[currentIndex].date).format("D MMM")}
                        </Text>
                    )}
                    <Text size={9} color={Colors.text_dark}>
                        {dayjs(sorted[sorted.length - 1].date).format("D MMM")}
                    </Text>
                </View>
            </View>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.primary_lighter,
        borderRadius: 15,
        padding: 15,
        paddingBottom: 12,
        gap: 14,
    },
    statsRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    statItem: {
        flex: 1,
        alignItems: "center",
    },
    statLabel: {
        marginTop: 2,
    },
    divider: {
        width: 1,
        height: 28,
        backgroundColor: Color(Colors.foreground).alpha(0.08).string(),
    },
    chartWrapper: {
        gap: 6,
    },
    dateRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: PAD,
    },
})
