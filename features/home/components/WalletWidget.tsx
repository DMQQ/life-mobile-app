import { AnimatedNumber } from "@/components"
import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import { Padding, Rounded } from "@/constants/Values"
import ZeroExpenseStats from "@/features/wallet/components/WalletChart/ZeroSpendings"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import Color from "color"
import dayjs from "dayjs"
import { StyleSheet, Text, View } from "react-native"
import Animated, { LinearTransition } from "react-native-reanimated"
import WeeklyComparisonChart from "./WalletChart"

const Typography = {
    display: { fontSize: 48, fontWeight: "700", letterSpacing: -1 },
    headline: { fontSize: 24, fontWeight: "600", letterSpacing: -0.3 },
    title: { fontSize: 18, fontWeight: "600" },
    body: { fontSize: 16, fontWeight: "500" },
    caption: { fontSize: 11, fontWeight: "500" },
    overline: { fontSize: 10, fontWeight: "600", letterSpacing: 0.5 },
} as const

interface WalletStatistics {
    total: number
    average: number
    max: number
    min: number
    count: number
    theMostCommonCategory: string
    theLeastCommonCategory: string
    lastBalance: number
    income: number
    expense: number
}

interface Props {
    data: {
        wallet: {
            id: string
            balance: number
            income: number
            monthlyPercentageTarget: number
        }
        statistics: WalletStatistics
        lastMonthSpendings: WalletStatistics
    }
    loading: boolean
}

const AvailableBalanceWidget = ({ data, loading }: Props) => {
    if (loading) return <View style={styles.loadingContainer} />

    const { wallet, statistics: stats } = data

    const targetAmount = wallet?.income * (wallet?.monthlyPercentageTarget / 100)
    const spentPercentage = targetAmount ? (stats?.expense / targetAmount) * 100 : 0

    const remainingBudget = targetAmount - stats?.expense
    const daysLeft = Math.abs(dayjs().diff(dayjs().endOf("month"), "day") + 1) // +2 to include today and the last day of the month
    const dailyBudgetLeft = daysLeft > 0 ? remainingBudget / daysLeft : 0
    const savings = wallet?.income + stats?.income - stats?.expense

    const isOverBudget = spentPercentage > 100
    const isDailyBudgetNegative = dailyBudgetLeft < 0

    return (
        <Animated.View style={styles.container} layout={LinearTransition.delay(200)}>
            <View style={styles.metricsGrid}>
                <MetricCard label="Days remaining" value={daysLeft.toString()} icon="calendar-clock" />
                <MetricCard
                    label="Daily budget"
                    value={`${Math.abs(dailyBudgetLeft).toFixed(0)}zł`}
                    icon="wallet-outline"
                    status={isDailyBudgetNegative ? "error" : "neutral"}
                    prefix={isDailyBudgetNegative ? "-" : ""}
                />
                <MetricCard label="Total saved" value={`${savings.toFixed(0)}zł`} icon="piggy-bank" prefix="" />
            </View>

            <View
                style={[
                    styles.targetProgress,
                    {
                        backgroundColor: Color(isOverBudget ? Colors.error : Colors.secondary)
                            .alpha(0.08)
                            .string(),
                    },
                ]}
            >
                <View style={styles.targetContent}>
                    <MaterialCommunityIcons
                        name="target"
                        size={24}
                        color={isOverBudget ? Colors.error : Colors.secondary}
                    />
                    <Text style={[styles.targetLabel, { color: isOverBudget ? Colors.error : Colors.secondary }]}>
                        Monthly Target Progress {"\n"}of {targetAmount.toFixed(0)}zł target
                    </Text>
                    <Text style={[styles.targetPercentage, { color: isOverBudget ? Colors.error : Colors.secondary }]}>
                        {spentPercentage.toFixed(1)}%
                    </Text>
                </View>
            </View>

            <View style={styles.chartSection}>
                <WeeklyComparisonChart />
                <ZeroExpenseStats />
            </View>
        </Animated.View>
    )
}

const MetricCard = ({
    label,
    value,
    icon,
    status = "neutral",
    prefix = "",
}: {
    label: string
    value: string
    icon: keyof typeof MaterialCommunityIcons.glyphMap
    status?: "success" | "error" | "neutral"
    prefix?: string
}) => {
    const getStatusColor = () => {
        switch (status) {
            case "success":
                return Colors.secondary
            case "error":
                return Colors.error
            default:
                return Colors.text_light
        }
    }

    const color = getStatusColor()

    return (
        <View style={styles.metricCard}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 }}>
                <MaterialCommunityIcons
                    name={icon}
                    size={25}
                    color={status === "neutral" ? Colors.secondary_light_1 : color}
                    style={{ transform: [{ translateY: -2.5 }] }}
                />

                <AnimatedNumber
                    style={[styles.metricValue, { color: color }]}
                    formatValue={(val) => (!Number.isNaN(+value) ? val + "" : (prefix ?? "") + val + "zł")}
                    value={Number.isNaN(Number(value)) ? +value.replace(/\D/g, "") : Number(value)}
                />
            </View>
            <Text style={styles.metricLabel}>{label}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.primary,
        borderRadius: Rounded.xl,
        overflow: "hidden",
        width: Layout.screen.width - 30,
        alignSelf: "center",
        gap: 15,
    },
    loadingContainer: {
        height: 420,
        backgroundColor: Colors.primary,
        borderRadius: Rounded.xl,
        width: Layout.screen.width - 30,
        alignSelf: "center",
    },
    primarySection: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingTop: 25,
        paddingBottom: 12,
    },
    expenseDisplay: {
        flex: 1,
    },
    expenseAmount: {
        ...Typography.display,
        fontSize: 60,
        letterSpacing: 1,
        lineHeight: 60,
        color: Colors.text_light,
    },
    expenseLabel: {
        ...Typography.caption,
        color: Colors.text_dark,
        marginTop: Padding.xs,
        textTransform: "uppercase",
    },
    trendIndicator: {
        alignItems: "flex-end",
        marginTop: 10,
    },
    trendBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: Padding.m,
        paddingVertical: Padding.xs,
        borderRadius: 15,
        gap: Padding.xs,
    },
    trendValue: {
        ...Typography.body,
        fontWeight: "600",
    },
    trendSubtext: {
        ...Typography.overline,
        color: Colors.text_dark,
        marginTop: Padding.xs,
        textTransform: "uppercase",
    },
    metricsGrid: {
        flexDirection: "row",
        gap: 20,
        marginBottom: 16,
        marginTop: 10,
    },
    metricCard: {
        flex: 1,
        alignItems: "center",
        gap: Padding.xs,
    },
    metricIcon: {
        width: 32,
        height: 32,
        borderRadius: Rounded.m,
        backgroundColor: Color(Colors.text_dark).alpha(0.1).string(),
        alignItems: "center",
        justifyContent: "center",
    },
    metricValue: {
        ...Typography.title,
        fontSize: 24,
        lineHeight: 25,
        fontWeight: "700",
    },
    metricLabel: {
        ...Typography.overline,
        color: Colors.secondary_light_2,
        textAlign: "center",
        textTransform: "uppercase",
    },
    targetProgress: {
        padding: 15,
        borderRadius: Rounded.l,
        marginBottom: 16,
    },
    targetContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 4,
    },
    targetLabel: {
        ...Typography.caption,
        fontWeight: "600",
        textTransform: "uppercase",
        flex: 1,
    },
    targetPercentage: {
        ...Typography.title,
        fontWeight: "700",
    },
    targetSubtext: {
        ...Typography.caption,
        color: Colors.text_dark,
        textAlign: "center",
    },
    chartSection: {
        gap: 12,
    },
})

export default AvailableBalanceWidget
