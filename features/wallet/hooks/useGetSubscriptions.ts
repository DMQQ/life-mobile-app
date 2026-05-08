import { graphql } from "@/gql/gql"
import { useQuery } from "@apollo/client"

const SUBSCRIPTIONS = graphql(`
    query Subscriptions {
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
`)

export default function useGetSubscriptions() {
    return useQuery(SUBSCRIPTIONS)
}
