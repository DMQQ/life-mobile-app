import { useEffect } from "react"
import store from "../store"
import { GetTimelineQuery, GET_TIMELINE_QUERY } from "@/features/timeline/hooks/query/useGetTimeLineQuery"
import { WidgetTimelineData, WidgetTimelineEvent, WidgetTodo } from "../types"
import { ExtensionStorage } from "@bacons/apple-targets"
import { useQuery } from "@apollo/client"
import moment from "moment"

const transformTodoForWidget = (todo: { id: string; title: string; isCompleted: boolean }): WidgetTodo => ({
    id: todo.id,
    title: todo.title,
    isCompleted: todo.isCompleted,
})

const transformEventForWidget = (event: GetTimelineQuery): WidgetTimelineEvent => ({
    id: event.id,
    title: event.title,
    description: event.description,
    date: event.date,
    beginTime: event.beginTime,
    endTime: event.endTime,
    isCompleted: event.isCompleted,
    todos: event.todos.map(transformTodoForWidget),
})

export const useWidgetTimelineData = () => {
    const todayQuery = useQuery<{ timeline: GetTimelineQuery[] }>(GET_TIMELINE_QUERY, {
        variables: { date: moment().format("YYYY-MM-DD") },
    })

    const tomorrowQuery = useQuery<{ timeline: GetTimelineQuery[] }>(GET_TIMELINE_QUERY, {
        variables: { date: moment().add(1, "day").format("YYYY-MM-DD") },
    })

    const dayAfterQuery = useQuery<{ timeline: GetTimelineQuery[] }>(GET_TIMELINE_QUERY, {
        variables: { date: moment().add(2, "days").format("YYYY-MM-DD") },
    })

    useEffect(() => {
        const allEvents: GetTimelineQuery[] = [
            ...(todayQuery.data?.timeline || []),
            ...(tomorrowQuery.data?.timeline || []),
            ...(dayAfterQuery.data?.timeline || []),
        ]

        if (allEvents.length === 0) return

        const sortedEvents = allEvents.sort((a, b) => {
            const dateA = moment(`${a.date} ${a.beginTime}`)
            const dateB = moment(`${b.date} ${b.beginTime}`)
            return dateA.isBefore(dateB) ? -1 : 1
        })

        const recentEvents = sortedEvents.slice(0, 8).map(transformEventForWidget)
        const completedEvents = allEvents.filter((event) => event.isCompleted).length

        const widgetData: WidgetTimelineData = {
            events: recentEvents,
            selectedDate: moment().format("YYYY-MM-DD"),
            totalEvents: allEvents.length,
            completedEvents,
            lastUpdated: new Date().toISOString(),
        }

        store.set("timeline_data", JSON.stringify(widgetData))
        ExtensionStorage.reloadWidget()
    }, [todayQuery.data, tomorrowQuery.data, dayAfterQuery.data])
}

export default useWidgetTimelineData
