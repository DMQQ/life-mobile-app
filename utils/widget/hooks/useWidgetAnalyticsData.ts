import { useEffect } from "react"
import { useQuery, gql } from "@apollo/client"
import store from "../store"
import { WidgetAnalyticsData } from "../types"
import { ExtensionStorage } from "@bacons/apple-targets"
import moment from "moment"

const GET_LIMITS = gql`
    query Limits($range: String!, $date: String) {
        limits(range: $range, date: $date) {
            id
            category
            amount
            current
        }
    }
`

const GET_STATISTICS = gql`
    query WalletStatistics($range: [String!]!) {
        statistics: getStatistics(range: $range) {
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
    }
`

const GET_DAILY_STATS = gql`
    query StatisticsDayOfWeek($startDate: String!, $endDate: String!) {
        statisticsDayOfWeek(startDate: $startDate, endDate: $endDate) {
            day
            total
            avg
            median
            count
        }
    }
`

const GET_CATEGORY_STATS = gql`
    query StatisticsLegend($startDate: String!, $endDate: String!, $detailed: String!) {
        statisticsLegend(startDate: $startDate, endDate: $endDate, displayMode: $detailed) {
            category
            count
            total
            percentage
        }
    }
`

const GET_WALLET = gql`
    query GetWallet {
        wallet {
            id
            balance
            income
            monthlyPercentageTarget
        }
    }
`

export const useWidgetAnalyticsData = () => {
    const { data: limitsData } = useQuery(GET_LIMITS, {
        variables: {
            range: "monthly",
            date: moment().format("YYYY-MM-DD"),
        },
    })

    const { data: dailyStats } = useQuery(GET_DAILY_STATS, {
        variables: {
            startDate: moment().subtract(6, "days").format("YYYY-MM-DD"),
            endDate: moment().format("YYYY-MM-DD"),
        },
    })

    const { data: categoryStats } = useQuery(GET_CATEGORY_STATS, {
        variables: {
            startDate: moment().startOf("month").format("YYYY-MM-DD"),
            endDate: moment().endOf("month").format("YYYY-MM-DD"),
            detailed: "monthly",
        },
    })

    const { data: walletData } = useQuery(GET_WALLET)

    const { data: monthlyStats } = useQuery(GET_STATISTICS, {
        variables: {
            range: [moment().startOf("month").format("YYYY-MM-DD"), moment().endOf("month").format("YYYY-MM-DD")],
        },
    })

    useEffect(() => {
        if (!limitsData && !dailyStats && !monthlyStats && !categoryStats && !walletData) return

        const limits = (limitsData?.limits || [])
            .filter((limit: any) => limit.current > 0)
            .sort((a: any, b: any) => b.current - a.current)
            .slice(0, 4)
            .map((limit: any) => ({
                category: limit.category,
                amount: limit.amount,
                current: limit.current,
            }))

        // Real daily spending data for last 7 days
        const dailySpendingData = dailyStats?.statisticsDayOfWeek || []
        const weeklySpending = Array.from({ length: 7 }, (_, index) => {
            const targetDay = moment()
                .subtract(6 - index, "days")
                .format("dddd")
                .toLowerCase()
            const dayData = dailySpendingData.find((day: any) => day?.day?.toLowerCase?.() === targetDay)
            return dayData?.total || 0
        })

        // Real category data from database
        const topCategories = [...(categoryStats?.statisticsLegend || [])]
            .sort((a: any, b: any) => b.total - a.total)
            .slice(0, 4)
            .map((category: any) => ({
                name: category.category,
                amount: category.total,
            }))

        // Real savings calculation using database target
        const wallet = walletData?.wallet
        const monthlyIncome = monthlyStats?.statistics?.income || wallet?.income || 0
        const monthlyExpense = monthlyStats?.statistics?.expense || 0
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

        console.log("Analytics widget data:", JSON.stringify(analyticsData, null, 2))

        store.set("analytics_data", JSON.stringify(analyticsData))
        ExtensionStorage.reloadWidget()
    }, [limitsData, dailyStats, monthlyStats, categoryStats, walletData])
}

export default useWidgetAnalyticsData
