import { gql, useApolloClient, useQuery } from "@apollo/client"
import moment from "moment"
import { useEffect, useState } from "react"

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

const GET_CALENDAR_OCCURRENCES_QUERY = gql`
    query GetCalendarOccurrences($date: String, $endDate: String) {
        occurrences(date: $date, endDate: $endDate) {
            id
            title
            date
            beginTime
            endTime
            isCompleted
        }
    }
`

export interface CalendarOccurrenceItem {
    id: string
    title: string
    date: string
    beginTime: string
    endTime: string
    isCompleted: boolean
}

export function useWeekEvents(days: string[]) {
    const { data } = useQuery<{ occurrences: CalendarOccurrenceItem[] }>(GET_CALENDAR_OCCURRENCES_QUERY, {
        variables: { date: days[0], endDate: days[6] },
        fetchPolicy: "cache-and-network",
    })
    const allEvents = data?.occurrences ?? []
    return days.map((date) => ({
        date,
        events: allEvents.filter((e) => e.date === date),
    }))
}

export function useRangeEvents(start: string, end: string): CalendarOccurrenceItem[] {
    const { data } = useQuery<{ occurrences: CalendarOccurrenceItem[] }>(GET_CALENDAR_OCCURRENCES_QUERY, {
        variables: { date: start, endDate: end },
        fetchPolicy: "cache-and-network",
    })
    return data?.occurrences ?? []
}

export function usePrefetchMonthRange(date: string) {
    const client = useApolloClient()
    const monthKey = moment(date).format("YYYY-MM")

    useEffect(() => {
        Promise.all(
            [-1, 0, 1].map((offset) => {
                const ms = moment(date).add(offset, "months").startOf("month")
                const start = ms.clone().startOf("week").format("YYYY-MM-DD")
                const end = ms.clone().endOf("month").endOf("week").format("YYYY-MM-DD")
                return client.query({
                    query: GET_CALENDAR_OCCURRENCES_QUERY,
                    variables: { date: start, endDate: end },
                    fetchPolicy: "network-only",
                })
            }),
        )
    }, [monthKey])
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
