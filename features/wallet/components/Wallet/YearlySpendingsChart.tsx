import { formatAmount } from "@/utils/functions/formatCurrency"
import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import { gql, useQuery } from "@apollo/client"
import { StyleSheet, View } from "react-native"
import Text from "@/components/ui/Text/Text"
import Animated, { FadeIn } from "react-native-reanimated"
import SparklineChart from "@/components/ui/Charts/SparklineChart"

const QUERY = gql`
    query StatisticsYearlySpendingsByMonth($year: Int) {
        statisticsYearlySpendingsByMonth(year: $year) {
            month
            value
        }
    }
`

const ALL_MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const CARD_W = Layout.screen.width - 30
const CARD_H = Layout.screen.width * 0.8 * 0.6
const PT = 14
const PB = 10
const X_AXIS_H = 22
const CHART_H = CARD_H - PT - PB - X_AXIS_H

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

    const allValues = Array.from({ length: 12 }, (_, i) => {
        const found = items.find((it) => it.month === i)
        return found?.value ?? 0
    })

    const values = allValues.slice(0, currentMonth + 1)
    const labels = ALL_MONTH_LABELS.slice(0, currentMonth + 1)

    const selectedValue = selectedBar <= currentMonth ? allValues[selectedBar] : null
    const currentValue = allValues[currentMonth]
    const total = allValues.reduce((acc, v) => acc + v, 0)

    return (
        <Animated.View style={styles.container} entering={FadeIn}>
            <SparklineChart
                data={values}
                labels={labels}
                chartHeight={CHART_H}
                referenceValue={currentValue > 0 ? currentValue : undefined}
                selectedIndex={selectedBar <= currentMonth ? selectedBar : undefined}
                onPointSelect={onBarPress}
                currency="zł"
            />

            <View style={styles.footer}>
                <View style={styles.footerStat}>
                    <Text size={16} weight="700" color={Colors.text_light} mono>
                        {formatAmount(total, 0)}zł
                    </Text>
                    <Text size={10} color={Colors.text_light} opacity={0.4} letterSpacing={0.5} uppercase>
                        year total
                    </Text>
                </View>

                <View style={[styles.footerStat, { alignItems: "flex-end" }]}>
                    <Text size={16} weight="700" color={Colors.secondary} mono>
                        {formatAmount(selectedValue ?? currentValue, 0)}zł
                    </Text>
                    <Text size={10} color={Colors.text_light} opacity={0.4} letterSpacing={0.5} uppercase>
                        {selectedValue !== null && selectedBar !== currentMonth
                            ? ALL_MONTH_LABELS[selectedBar]
                            : "this month"}
                    </Text>
                </View>
            </View>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: CARD_W,
        paddingTop: PT,
        paddingBottom: PB,
        paddingHorizontal: 4,
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
})
