import { useEffect } from "react"
import store from "../store"
import { OccurrenceItem, GET_OCCURRENCES_QUERY } from "@/features/timeline/hooks/query/useGetOccurrencesQuery"
import { WidgetTimelineData, WidgetTimelineEvent, WidgetTodo } from "../types"
import { ExtensionStorage } from "@bacons/apple-targets"
import { useQuery } from "@apollo/client"
import moment from "moment"
import { sendDataToWatch, isWatchAvailable } from "@/modules/expo-apple-watch"

const transformTodoForWidget = (todo: {
    id: string
    title: string
    isCompleted: boolean
    modifiedAt?: string
}): WidgetTodo => ({
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
    const { data } = useQuery<{ occurrences: OccurrenceItem[] }>(GET_OCCURRENCES_QUERY, {
        variables: {
            date: moment().format("YYYY-MM-DD"),
            endDate: moment().add(2, "days").format("YYYY-MM-DD"),
        },
    })

    useEffect(() => {
        const allEvents: OccurrenceItem[] = data?.occurrences || []

        if (allEvents.length === 0) return

        const sortedEvents = [...allEvents].sort((a, b) => {
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

        const serialized = JSON.stringify(widgetData)
        store.set("timeline_data", serialized)

        ExtensionStorage.reloadWidget()

        if (isWatchAvailable()) {
            sendDataToWatch({ timeline_data: serialized, reload_widget: true })
                .then((r) => console.log("[Watch] sendDataToWatch result:", r))
                .catch((e) => console.log("[Watch] sendDataToWatch error:", e))
        }
    }, [data])
}

export default useWidgetTimelineData
