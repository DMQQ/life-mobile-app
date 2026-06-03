import { FONTS } from "@/constants/Fonts"
import { formatAmount } from "@/utils/functions/formatCurrency"
import Colors from "@/constants/Colors"
import Color from "color"
import dayjs from "dayjs"
import { useEffect } from "react"
import { StyleSheet, View } from "react-native"
import Text from "@/components/ui/Text/Text"
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated"

interface Expense {
    id: string
    amount: number
    date: string
}

interface SimilarExpensesChartProps {
    expenses: Expense[]
    currentExpenseId: string
}

const CHART_HEIGHT = 180
const MIN_BAR_HEIGHT = 14

function Bar({
    amount,
    date,
    isCurrent,
    maxAmount,
}: {
    amount: number
    date: string
    isCurrent: boolean
    maxAmount: number
}) {
    const targetHeight = maxAmount > 0 ? Math.max((amount / maxAmount) * CHART_HEIGHT, MIN_BAR_HEIGHT) : MIN_BAR_HEIGHT

    const animHeight = useSharedValue(0)
    const animOpacity = useSharedValue(0)

    useEffect(() => {
        animHeight.value = withTiming(targetHeight, { duration: 500 })
        animOpacity.value = withTiming(1, { duration: 400 })
    }, [targetHeight])

    const barStyle = useAnimatedStyle(() => ({ height: animHeight.value }))

    const valueOpacity = useAnimatedStyle(() => ({
        opacity: interpolate(
            animHeight.value,
            [0, MIN_BAR_HEIGHT, MIN_BAR_HEIGHT * 2.5],
            [0, 0, 1],
            Extrapolation.CLAMP,
        ),
    }))

    const containerStyle = useAnimatedStyle(() => ({ opacity: animOpacity.value }))

    const barColor = isCurrent ? Colors.secondary : Color(Colors.secondary).alpha(0.3).string()
    const borderColor = isCurrent ? Colors.secondary : "transparent"

    return (
        <Animated.View style={[styles.barColumn, containerStyle]}>
            <View style={styles.barSlot}>
                <Animated.View
                    style={[
                        styles.bar,
                        { backgroundColor: barColor, borderColor, borderWidth: isCurrent ? 1.5 : 0 },
                        barStyle,
                    ]}
                >
                    <Animated.View style={[styles.valueWrapper, valueOpacity]}>
                        <Text size={9} weight="700" color={isCurrent ? "#000" : Colors.foreground} style={{ transform: [{ rotate: "-90deg" }] }}>
                            {Math.round(amount)}
                        </Text>
                    </Animated.View>
                </Animated.View>
            </View>
            <Text size={9} weight="500" align="center" color={isCurrent ? Colors.secondary : Colors.text_dark} numberOfLines={1} style={{ marginTop: 6 }}>
                {dayjs(date).format("DD")}
            </Text>
        </Animated.View>
    )
}

export default function SimilarExpensesChart({ expenses, currentExpenseId }: SimilarExpensesChartProps) {
    if (!expenses || expenses.length < 2) return null

    const sorted = [...expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    const amounts = sorted.map((e) => e.amount)
    const maxAmount = Math.max(...amounts) * 1.15
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length
    const minAmount = Math.min(...amounts)
    const maxRaw = Math.max(...amounts)

    const avgLineBottom = maxAmount > 0 ? (avgAmount / maxAmount) * CHART_HEIGHT : 0

    return (
        <View style={styles.container}>
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text size={15} weight="700" color={Colors.secondary} mono>{amounts.length}×</Text>
                    <Text size={10} color={Colors.text_dark} style={{ marginTop: 2 }}>visits</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text size={15} weight="700" color={Colors.secondary} mono>{formatAmount(avgAmount)}zł</Text>
                    <Text size={10} color={Colors.text_dark} style={{ marginTop: 2 }}>avg</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text size={15} weight="700" color="#66E875" mono>{formatAmount(minAmount)}zł</Text>
                    <Text size={10} color={Colors.text_dark} style={{ marginTop: 2 }}>min</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text size={15} weight="700" color="#F07070" mono>{formatAmount(maxRaw)}zł</Text>
                    <Text size={10} color={Colors.text_dark} style={{ marginTop: 2 }}>max</Text>
                </View>
            </View>

            <View style={styles.chartArea}>
                {/* Average line */}
                <View style={[styles.avgLine, { bottom: avgLineBottom + 28 }]} pointerEvents="none">
                    <View style={styles.avgLineDash} />
                    <Text size={9} weight="600" color={Colors.text_light}>{formatAmount(avgAmount)}zł avg</Text>
                </View>

                {/* Bars */}
                <View style={styles.barsRow}>
                    {sorted.map((expense) => (
                        <Bar
                            key={expense.id}
                            amount={expense.amount}
                            date={expense.date}
                            isCurrent={expense.id === currentExpenseId}
                            maxAmount={maxAmount}
                        />
                    ))}
                </View>
            </View>

            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendSwatch, { backgroundColor: Colors.secondary }]} />
                    <Text size={11} color={Colors.text_dark}>This expense</Text>
                </View>
                <View style={styles.legendItem}>
                    <View
                        style={[styles.legendSwatch, { backgroundColor: Color(Colors.secondary).alpha(0.3).string() }]}
                    />
                    <Text size={11} color={Colors.text_dark}>Previous</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={styles.avgLineLegendSwatch} />
                    <Text size={11} color={Colors.text_dark}>Average</Text>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.primary_lighter,
        borderRadius: 15,
        padding: 15,
        paddingBottom: 12,
    },
    statsRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 18,
    },
    statItem: {
        flex: 1,
        alignItems: "center",
    },
    statDivider: {
        width: 1,
        height: 28,
        backgroundColor: Color(Colors.foreground).alpha(0.08).string(),
    },
    statValue: {
        color: Colors.secondary,
        fontSize: 15,
        fontFamily: FONTS.bold,
    },
    statLabel: {
        color: Colors.text_dark,
        fontSize: 10,
        marginTop: 2,
    },
    chartArea: {
        position: "relative",
    },
    barsRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-around",
    },
    barColumn: {
        flex: 1,
        alignItems: "center",
        maxWidth: 48,
    },
    barSlot: {
        height: CHART_HEIGHT,
        width: "100%",
        justifyContent: "flex-end",
        maxWidth: 36,
    },
    bar: {
        width: "100%",
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },
    valueWrapper: {
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    },
    barValue: {
        fontSize: 9,
        fontFamily: FONTS.bold,
        transform: [{ rotate: "-90deg" }],
    },
    dateLabel: {
        fontSize: 9,
        marginTop: 6,
        fontFamily: FONTS.medium,
        textAlign: "center",
    },
    avgLine: {
        position: "absolute",
        left: 0,
        right: 0,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        zIndex: 1,
    },
    avgLineDash: {
        flex: 1,
        height: 1,
        backgroundColor: Color(Colors.text_dark).alpha(0.45).string(),
    },
    avgLineLabel: {
        color: Colors.text_light,
        fontSize: 9,
        fontFamily: FONTS.semibold,
    },
    legend: {
        flexDirection: "row",
        gap: 14,
        marginTop: 12,
        flexWrap: "wrap",
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    legendSwatch: {
        width: 10,
        height: 10,
        borderRadius: 2,
    },
    legendText: {
        color: Colors.text_dark,
        fontSize: 11,
    },
    avgLineLegendSwatch: {
        width: 16,
        height: 1,
        backgroundColor: Color(Colors.text_dark).alpha(0.45).string(),
    },
})
