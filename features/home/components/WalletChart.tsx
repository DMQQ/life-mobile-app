import { useMemo } from "react"
import { formatAmount } from "@/utils/functions/formatCurrency"
import { StyleSheet, View } from "react-native"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import Color from "color"
import { gql, useQuery } from "@apollo/client"
import { Feather } from "@expo/vector-icons"
import moment from "moment"
import { useRefresh } from "@/utils/context/RefreshContext"
import SparklineChart from "@/components/ui/Charts/SparklineChart"

const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

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

    const { data, prevData, total, prevTotal, percentageChange } = useMemo(() => {
        const raw = (query.data?.statisticsDayOfWeek || []) as { day: number; total: number }[]
        const prevRaw = (prevQuery.data?.statisticsDayOfWeek || []) as { day: number; total: number }[]
        const prevDataMap = new Map<number, number>(prevRaw.map((item) => [item.day, item.total]))

        const currentData = Array.from({ length: 7 }, (_, i) => {
            const found = raw.find((d) => d.day === i + 1)
            return found?.total ?? 0
        })
        const previousData = Array.from({ length: 7 }, (_, i) => prevDataMap.get(i + 1) ?? 0)

        const currentTotal = raw.reduce((acc, curr) => acc + curr.total, 0)
        const previousTotal = prevRaw.reduce((acc, curr) => acc + curr.total, 0)
        const change = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0

        return {
            data: currentData,
            prevData: previousData,
            total: currentTotal,
            prevTotal: previousTotal,
            percentageChange: change,
        }
    }, [query.data, prevQuery.data])

    if (query.loading || prevQuery.loading) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text size={14} color={Colors.text_light} opacity={0.7}>
                        Loading...
                    </Text>
                </View>
            </View>
        )
    }

    const isUp = percentageChange >= 0
    const changeColor = isUp ? "#FF8A80" : "#4ECDC4"

    return (
        <View style={styles.container}>
            <View style={styles.changeBadge}>
                <Feather name={isUp ? "arrow-up" : "arrow-down"} size={9} color={changeColor} />
                <Text size={12} weight="700" color={changeColor}>
                    {Math.abs(Math.round(percentageChange))}%
                </Text>
            </View>

            <SparklineChart data={data} prevData={prevData} labels={labels} chartHeight={160} />

            <View style={styles.footer}>
                <View style={styles.footerStat}>
                    <Text size={16} weight="700" color={Colors.text_light} mono>
                        {formatAmount(prevTotal, 0)}zł
                    </Text>
                    <Text size={10} color={Colors.text_light} opacity={0.4} letterSpacing={0.5} uppercase>
                        last week
                    </Text>
                </View>

                <View style={[styles.footerStat, { alignItems: "flex-end" }]}>
                    <Text size={16} weight="700" color={Colors.secondary} mono>
                        {formatAmount(total, 0)}zł
                    </Text>
                    <Text size={10} color={Colors.text_light} opacity={0.4} letterSpacing={0.5} uppercase>
                        this week
                    </Text>
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
    changeBadge: {
        position: "absolute",
        top: 4,
        right: 4,
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        backgroundColor: "rgba(255,255,255,0.06)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
        zIndex: 1,
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
    loadingContainer: {
        height: 160,
        justifyContent: "center",
        alignItems: "center",
    },
})

export default CompactSpendingChart
