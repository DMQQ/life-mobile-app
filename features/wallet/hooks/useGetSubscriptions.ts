import { useQuery, gql } from "@apollo/client"

export default function useGetSubscriptions() {
    return useQuery(gql`
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
                expenses {
                    amount
                    id
                    date
                    description
                    category
                }
            }
        }
    `)
}
