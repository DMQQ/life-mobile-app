import { useEffect } from "react"
import { useQuery, gql } from "@apollo/client"
import store from "../store"
import { WidgetAnalyticsData } from "../types"
import { ExtensionStorage } from "@bacons/apple-targets"
import moment from "moment"

const GET_WIDGET_ANALYTICS = gql`
    query WidgetAnalytics(
        $range: String!
        $date: String
        $statsRange: [String!]!
        $startDate: String!
        $endDate: String!
        $detailed: String!
    ) {
        limits(range: $range, date: $date) {
            id
            category
            amount
            current
        }
        statistics: getStatistics(range: $statsRange) {
            total
            average
            max
            min
            count
            theMostCommonCategory
            theLeastCommonCategory
            lastBalance
            income
            expense
        }
        statisticsDayOfWeek(startDate: $startDate, endDate: $endDate) {
            day
            total
            avg
            median
            count
        }
        statisticsLegend(startDate: $startDate, endDate: $endDate, displayMode: $detailed) {
            category
            count
            total
            percentage
        }
        wallet {
            id
            balance
            income
            monthlyPercentageTarget
        }
    }
`

export const useWidgetAnalyticsData = () => {
    const now = moment()
    const { data } = useQuery(GET_WIDGET_ANALYTICS, {
        variables: {
            range: "monthly",
            date: now.format("YYYY-MM-DD"),
            statsRange: [now.startOf("month").format("YYYY-MM-DD"), now.endOf("month").format("YYYY-MM-DD")],
            startDate: now.subtract(6, "days").format("YYYY-MM-DD"),
            endDate: moment().format("YYYY-MM-DD"),
            detailed: "monthly",
        },
    })

    useEffect(() => {
        if (!data) return

        const limits = (data.limits || [])
            .filter((l: any) => l.current > 0)
            .sort((a: any, b: any) => b.current - a.current)
            .slice(0, 4)
            .map((l: any) => ({
                category: l.category,
                amount: l.amount,
                current: l.current,
            }))

        const dailySpendingData = data.statisticsDayOfWeek || []

        const weeklySpending = Array.from({ length: 7 }, (_, i) => {
            const day = i + 1
            return dailySpendingData.find((d: any) => d.day === day)?.total || 0
        })

        const topCategories = [...(data.statisticsLegend || [])]
            .sort((a: any, b: any) => b.total - a.total)
            .slice(0, 4)
            .map((c: any) => ({
                name: c.category,
                amount: c.total,
            }))

        const wallet = data.wallet
        const monthlyIncome = data.statistics?.income || wallet?.income || 0
        const monthlyExpense = data.statistics?.expense || 0
        const savedAmount = monthlyIncome - monthlyExpense
        const targetPercentage = wallet?.monthlyPercentageTarget || 20
        const targetAmount = monthlyIncome * (targetPercentage / 100)
        const savedPercentage = targetAmount > 0 ? (savedAmount / targetAmount) * 100 : 0

        const savings = {
            savedAmount,
            targetAmount,
            savedPercentage: Math.min(100, Math.max(-100, savedPercentage)),
        }

        const analyticsData: WidgetAnalyticsData = {
            limits,
            weeklySpending,
            topCategories,
            savings,
            lastUpdated: new Date().toISOString(),
        }

        store.set("analytics_data", JSON.stringify(analyticsData))
        ExtensionStorage.reloadWidget()
    }, [data])
}

export default useWidgetAnalyticsData
