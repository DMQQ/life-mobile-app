import { gql, useQuery } from "@apollo/client"
import moment from "moment"
import { useState } from "react"

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
    reminderBeforeMinutes?: number | null
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
    query GetOccurrences($date: String, $endDate: String, $query: String) {
        occurrences(date: $date, endDate: $endDate, query: $query) {
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
            reminderBeforeMinutes
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

export function useWeekEvents(days: string[]) {
    const { data } = useQuery<{ occurrences: OccurrenceItem[] }>(GET_OCCURRENCES_QUERY, {
        variables: { date: days[0], endDate: days[6] },
    })
    const allEvents = data?.occurrences ?? []
    return days.map((date) => ({
        date,
        events: allEvents.filter((e) => e.date === date),
    }))
}

export function useRangeEvents(start: string, end: string): OccurrenceItem[] {
    const { data } = useQuery<{ occurrences: OccurrenceItem[] }>(GET_OCCURRENCES_QUERY, {
        variables: { date: start, endDate: end },
    })
    return (data?.occurrences ?? []) as OccurrenceItem[]
}

export default function useGetOccurrencesQuery(date?: string) {
    const [selected, setSelected] = useState(date || (() => moment().format("YYYY-MM-DD")))
    const [searchQuery, setSearchQuery] = useState("")
    const query = useQuery<{ occurrences: OccurrenceItem[] }>(GET_OCCURRENCES_QUERY, {
        variables: {
            date: !!searchQuery ? undefined : selected,
            query: !!searchQuery ? searchQuery : undefined,
        },
        fetchPolicy: "cache-and-network",
        nextFetchPolicy: "cache-first",
    })

    const setQuery = (q: string) => {
        setSearchQuery(q)
    }

    return { ...query, selected, setSelected, setQuery, query: searchQuery }
}
