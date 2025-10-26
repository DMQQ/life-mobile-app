import { gql, useQuery } from "@apollo/client"
import moment from "moment"
import { useEffect, useState } from "react"

export interface GetTimelineQuery {
    id: string
    title: string
    description: string
    date: string
    beginTime: string
    endTime: string
    isCompleted: boolean

    todos: {
        id: string
        title: string
        isCompleted: boolean
    }[]

    images: {
        id: string
    }[]
}

export const GET_TIMELINE_QUERY = gql`
    query GetTimeline($date: String, $query: String) {
        timeline(date: $date, query: $query) {
            id
            title
            description
            date
            beginTime
            endTime
            isCompleted

            todos {
                id
                title
                isCompleted
            }

            images {
                id
            }
        }
    }
`

export default function useGetTimeLineQuery(date?: string) {
    const [selected, setSelected] = useState(date || (() => moment().format("YYYY-MM-DD")))
    const [searchQuery, setSearchQuery] = useState("")
    const query = useQuery<{ timeline: GetTimelineQuery[] }>(GET_TIMELINE_QUERY, {
        variables: {
            date: !!searchQuery ? undefined : selected,
            query: !!searchQuery ? searchQuery : undefined,
        },
    })

    const setQuery = (q: string) => {
        setSearchQuery(q)
    }

    useEffect(() => {
        query.refetch({
            variables: {
                date: !!searchQuery ? undefined : selected,
                query: !!searchQuery ? searchQuery : undefined,
            },
        })
    }, [selected, searchQuery])

    return { ...query, selected, setSelected, setQuery, query: searchQuery }
}
