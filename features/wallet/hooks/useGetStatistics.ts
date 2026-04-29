import { graphql } from "@/gql/gql"
import { useQuery } from "@apollo/client"
import { useEffect } from "react"

const WALLET_STATISTICS = graphql(`
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
`)

export type WalletStatisticsResponse = NonNullable<ReturnType<typeof useGetStatistics>["data"]>

export default function useGetStatistics(range: [any, any]) {
    const query = useQuery(WALLET_STATISTICS, { variables: { range } })

    useEffect(() => {
        query.refetch({ range })
    }, range)

    return query
}
