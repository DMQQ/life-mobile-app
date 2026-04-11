import { gql, useQuery } from "@apollo/client"
import moment from "moment"
import { useEffect, useState } from "react"
import { OCCURRENCE_FIELDS } from "../schemas/schemas"

export interface OccurrenceItem {
    id: string
    seriesId: string
    date: string
    position: number
    title: string
    description: string
    beginTime: string
    endTime: string
    isCompleted: boolean
    isSkipped: boolean
    isAllDay: boolean
    isRepeat: boolean
    tags: string
    priority: number | null
    todos: {
        id: string
        title: string
        isCompleted: boolean
    }[]
    images: {
        id: string
    }[]
}

export const GET_OCCURRENCES_QUERY = gql`
    query GetOccurrences($date: String, $query: String) {
        occurrences(date: $date, query: $query) {
            id
            seriesId
            date
            title
            description
            beginTime
            endTime
            isCompleted
            isSkipped
            isRepeat
            priority
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

export default function useGetOccurrencesQuery(date?: string) {
    const [selected, setSelected] = useState(date || (() => moment().format("YYYY-MM-DD")))
    const [searchQuery, setSearchQuery] = useState("")
    const query = useQuery<{ occurrences: OccurrenceItem[] }>(GET_OCCURRENCES_QUERY, {
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
            date: !!searchQuery ? undefined : selected,
            query: !!searchQuery ? searchQuery : undefined,
        })
    }, [selected, searchQuery])

    return { ...query, selected, setSelected, setQuery, query: searchQuery }
}
