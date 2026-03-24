import { useEffect } from "react"
import store from "../store"
import { OccurrenceItem, GET_OCCURRENCES_QUERY } from "@/features/timeline/hooks/query/useGetOccurrencesQuery"
import { WidgetTimelineData, WidgetTimelineEvent, WidgetTodo } from "../types"
import { ExtensionStorage } from "@bacons/apple-targets"
import { useQuery } from "@apollo/client"
import moment from "moment"

const transformTodoForWidget = (todo: { id: string; title: string; isCompleted: boolean; modifiedAt?: string }): WidgetTodo => ({
    id: todo.id,
    title: todo.title,
    isCompleted: todo.isCompleted,
    modifiedAt: todo.modifiedAt,
})

const transformEventForWidget = (event: OccurrenceItem): WidgetTimelineEvent => ({
    id: event.id,
    title: event.title,
    description: event.description,
    date: event.date,
    beginTime: event.beginTime,
    endTime: event.endTime,
    isCompleted: event.isCompleted,
    isRepeat: event.isRepeat,
    todos: event.todos.map(transformTodoForWidget),
})

export const useWidgetTimelineData = () => {
    const todayQuery = useQuery<{ occurrences: OccurrenceItem[] }>(GET_OCCURRENCES_QUERY, {
        variables: { date: moment().format("YYYY-MM-DD") },
    })

    const tomorrowQuery = useQuery<{ occurrences: OccurrenceItem[] }>(GET_OCCURRENCES_QUERY, {
        variables: { date: moment().add(1, "day").format("YYYY-MM-DD") },
    })

    const dayAfterQuery = useQuery<{ occurrences: OccurrenceItem[] }>(GET_OCCURRENCES_QUERY, {
        variables: { date: moment().add(2, "days").format("YYYY-MM-DD") },
    })

    useEffect(() => {
        const allEvents: OccurrenceItem[] = [
            ...(todayQuery.data?.occurrences || []),
            ...(tomorrowQuery.data?.occurrences || []),
            ...(dayAfterQuery.data?.occurrences || []),
        ]

        if (allEvents.length === 0) return

        // Each occurrence has a unique id — no deduplication needed, but guard against duplicates
        const seen = new Set<string>()
        const uniqueEvents = allEvents.filter((event) => {
            if (seen.has(event.id)) return false
            seen.add(event.id)
            return true
        })

        const sortedEvents = uniqueEvents.sort((a, b) => {
            const dateA = moment(`${a.date} ${a.beginTime}`)
            const dateB = moment(`${b.date} ${b.beginTime}`)
            return dateA.isBefore(dateB) ? -1 : 1
        })

        const recentEvents = sortedEvents.slice(0, 8).map(transformEventForWidget)
        const completedEvents = uniqueEvents.filter((event) => event.isCompleted).length

        const widgetData: WidgetTimelineData = {
            events: recentEvents,
            selectedDate: moment().format("YYYY-MM-DD"),
            totalEvents: uniqueEvents.length,
            completedEvents,
            lastUpdated: new Date().toISOString(),
        }

        store.set("timeline_data", JSON.stringify(widgetData))
        ExtensionStorage.reloadWidget()
    }, [todayQuery.data, tomorrowQuery.data, dayAfterQuery.data])
}

export default useWidgetTimelineData
