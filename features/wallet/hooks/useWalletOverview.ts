import { gql, useQuery } from "@apollo/client"
import dayjs from "dayjs"
import { useMemo } from "react"

type WalletOverviewData = {
    wallet: {
        balance: number
        expenses2: Array<{
            expenses: Array<{
                id: string
                amount: number
                date: string
                description: string
                type: string
                category?: string | null
                spontaneousRate?: number | null
                subAccountId?: string | null
            }>
        }>
    } | null
    subscriptions: Array<{
        id: string
        amount: number
        dateStart: string
        dateEnd?: string | null
        description: string
        isActive: boolean
        nextBillingDate: string
        billingCycle: string
        billingDay?: number | null
        customBillingMonths?: number[] | null
        reminderDaysBeforehand: number
        totalSpent: number
        totalAmount: number
        totalDuration: number
        expenses: Array<{
            id: string
            amount: number
            date: string
            description: string
            category?: string | null
        }>
    }> | null
}

const WALLET_OVERVIEW = gql`
    query WalletOverview($filters: GetWalletFilters) {
        wallet {
            balance
            expenses2(filters: $filters, take: 2) {
                expenses {
                    id
                    amount
                    date
                    description
                    type
                    category
                    spontaneousRate
                    subAccountId
                }
            }
        }
        subscriptions {
            id
            amount
            dateStart
            dateEnd
            description
            isActive
            nextBillingDate
            billingCycle
            billingDay
            customBillingMonths
            reminderDaysBeforehand
            totalSpent
            totalAmount
            totalDuration
            expenses {
                id
                amount
                date
                description
                category
            }
        }
    }
`

export default function useWalletOverview() {
    const filters = useMemo(() => {
        const now = dayjs()
        return {
            date: {
                from: now.subtract(7, "day").format("YYYY-MM-DD"),
                to: now.format("YYYY-MM-DD"),
            },
        }
    }, [])

    return useQuery<WalletOverviewData>(WALLET_OVERVIEW, { variables: { filters } })
}
