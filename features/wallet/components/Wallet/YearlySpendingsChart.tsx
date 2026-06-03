import { FONTS } from "@/constants/Fonts"
import { formatAmount } from "@/utils/functions/formatCurrency"
import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import { gql, useQuery } from "@apollo/client"
import { ScrollView, StyleSheet, View } from "react-native"
import Text from "@/components/ui/Text/Text"
import AnimatedBar from "@/components/ui/Charts/AnimatedBar"
import Animated, { FadeIn } from "react-native-reanimated"

const QUERY = gql`
    query StatisticsYearlySpendingsByMonth($year: Int) {
        statisticsYearlySpendingsByMonth(year: $year) {
            month
            value
        }
    }
`

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const CARD_W = Layout.screen.width - 30
const CARD_H = Layout.screen.width * 0.8 * 0.6 // fixed height matching SubAccountCards
const PT = 14
const PB = 10
const BAR_LABEL_H = 16 // AnimatedBar: marginTop(5) + fontSize(11)
const VALUE_TEXT_H = 16
const VALUE_TEXT_MB = 3
const CHART_HEIGHT = CARD_H - PT - PB - BAR_LABEL_H - VALUE_TEXT_H - VALUE_TEXT_MB
const BAR_WIDTH = 36

function formatValue(v: number): string {
    if (v === 0) return ""
    if (v >= 1000) return `${(v / 1000).toFixed(1)}k`
    return `${Math.round(v)}`
}

function getBarHeight(value: number, maxValue: number, minBarHeight = 4): number {
    if (!value || !maxValue) return 0
    return Math.max((value / maxValue) * CHART_HEIGHT, value > 0 ? minBarHeight : 0)
}

export default function YearlySpendingsChart({
    onBarPress,
    selectedBar,
}: {
    onBarPress: (monthIndex: number) => void
    selectedBar: number
}) {
    const currentMonth = new Date().getMonth()

    const { data } = useQuery(QUERY, {
        variables: { year: new Date().getFullYear() },
        fetchPolicy: "cache-and-network",
    })

    const items: { month: number; value: number }[] = data?.statisticsYearlySpendingsByMonth ?? []

    const values = Array.from({ length: 12 }, (_, i) => {
        const found = items.find((it) => it.month === i)
        return found?.value ?? 0
    })

    const maxValue = Math.max(...values, 1)
    const currentValue = values[currentMonth]
    const currentBarH = getBarHeight(currentValue, maxValue)

    const refLineTop = CARD_H - PB * 2 - BAR_LABEL_H - currentBarH

    return (
        <Animated.View style={styles.container} entering={FadeIn}>
            {currentValue > 0 && (
                <View style={[styles.referenceLine, { top: refLineTop }]} pointerEvents="none">
                    <View style={styles.refLineBar} />
                    <View style={styles.refValuePill}>
                        <Text style={styles.refValueText}>{formatAmount(currentValue, 0)} zł</Text>
                    </View>
                </View>
            )}

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {MONTH_LABELS.map((label, i) => {
                    const isCurrentMonth = selectedBar !== undefined ? i === selectedBar : i === currentMonth
                    const labelColor = isCurrentMonth ? Colors.text_light : Colors.text_dark
                    return (
                        <View key={i} style={[styles.barWrapper, i < 11 && { marginRight: 8 }]}>
                            <Text style={[styles.valueLabel, { color: labelColor }]}>{formatValue(values[i])}</Text>
                            <AnimatedBar
                                onPress={() => onBarPress(i)}
                                index={i}
                                value={values[i]}
                                maxValue={maxValue}
                                chartHeight={CHART_HEIGHT}
                                label={label}
                                labelColor={labelColor}
                                barWidth={BAR_WIDTH}
                                minBarHeight={4}
                                noPrevValue
                                barColor={isCurrentMonth ? Colors.secondary : Colors.secondary + "60"}
                            />
                        </View>
                    )
                })}
            </ScrollView>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: CARD_W,
        height: CARD_H,
        borderRadius: 20,
        paddingTop: PT,
        paddingBottom: PB,
        overflow: "hidden",
    },
    referenceLine: {
        position: "absolute",
        left: 0,
        right: 0,
        flexDirection: "row",
        alignItems: "center",
        zIndex: 10,
    },
    refLineBar: {
        flex: 1,
        height: 2,
        backgroundColor: "#fff",
        borderRadius: 5,
    },
    refValuePill: {
        marginHorizontal: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
        backgroundColor: "#fff",
        borderRadius: 100,
        borderWidth: 1,
        borderColor: "#fff",
    },
    refValueText: {
        fontSize: 10,
        fontFamily: FONTS.semibold,
        color: Colors.primary,
    },
    scrollContent: {
        alignItems: "flex-end",
    },
    barWrapper: {
        alignItems: "center",
    },
    valueLabel: {
        fontSize: 9,
        fontFamily: FONTS.semibold,
        marginBottom: VALUE_TEXT_MB,
        height: VALUE_TEXT_H,
        textAlignVertical: "bottom",
    },
})
