import { useEffect } from "react"
import { Expense, Wallet } from "@/types"
import store from "../store"
import { WidgetWalletData, WidgetExpense, WidgetSubscription } from "../types"
import { ExtensionStorage } from "@bacons/apple-targets"
import useGetSubscriptions from "@/features/wallet/hooks/useGetSubscriptions"
import useGetStatistics from "@/features/wallet/hooks/useGetStatistics"
import moment from "moment"
import useGetWallet from "@/features/wallet/hooks/useGetWallet"

const transformExpenseForWidget = (expense: Expense): WidgetExpense => ({
    id: expense.id,
    amount: expense.amount,
    description: expense.description.charAt(0).toUpperCase() + expense.description.slice(1),
    date: expense.date,
    type: expense.type,
    category: expense.category.includes(":") ? expense.category.split(":")[1].trim() : expense.category,
})

export const useWidgetWalletData = () => {
    const { data } = useGetWallet()

    const wallet = data?.wallet as Wallet & {
        monthlyPercentageTarget?: number
        income: number
    }

    const { data: subscriptionsData } = useGetSubscriptions()

    const { data: statistics } = useGetStatistics([
        moment().startOf("month").toDate(),
        moment().endOf("month").toDate(),
    ])

    useEffect(() => {
        if (!wallet) return

        const recentExpenses = wallet.expenses.slice(0, 5).map(transformExpenseForWidget)

        const monthlySpent = statistics?.statistics?.expense || 0

        const monthlyLimit =
            wallet.income && wallet.monthlyPercentageTarget
                ? (wallet.income * wallet.monthlyPercentageTarget) / 100
                : 2000

        const now = new Date()
        const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

        const upcomingSubscriptions =
            subscriptionsData?.subscriptions
                ?.filter((sub: any) => {
                    if (!sub.isActive || !sub.nextBillingDate) return false
                    const billingDate = new Date(sub.nextBillingDate)
                    return billingDate >= now && billingDate <= threeDaysFromNow
                })
                ?.map(
                    (sub: any): WidgetSubscription => ({
                        id: sub.id,
                        amount: sub.amount,
                        description: sub.description,
                        nextBillingDate: sub.nextBillingDate,
                        isActive: sub.isActive,
                    }),
                ) || []

        const widgetData: WidgetWalletData = {
            balance: wallet.balance,
            income: wallet.income || 0,
            monthlyPercentageTarget: wallet.monthlyPercentageTarget || 0,
            recentExpenses,
            lastUpdated: new Date().toISOString(),
            monthlySpent,
            monthlyLimit,
            upcomingSubscriptions,
        }

        store.set("wallet_data", JSON.stringify(widgetData))

        ExtensionStorage.reloadWidget()
    }, [wallet, subscriptionsData, statistics])
}

export default useWidgetWalletData
