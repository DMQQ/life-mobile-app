import { gql, useQuery } from "@apollo/client"

const GET_TOP_CATEGORIES = gql`
    query GetTopCategories($limit: Int) {
        topCategories(limit: $limit) {
            category
            count
            lastUsed
        }
    }
`

export type TopCategory = {
    category: string
    count: number
    lastUsed: string
}

export default function useTopCategories(limit = 20) {
    return useQuery<{ topCategories: TopCategory[] }>(GET_TOP_CATEGORIES, {
        variables: { limit },
    })
}
