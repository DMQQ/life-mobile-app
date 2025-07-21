import { gql, useQuery } from "@apollo/client"
import moment from "moment"
import { useCallback, useMemo, useState } from "react"
import { ToastAndroid } from "react-native"
import { TimelineScreenProps } from "../../types"
import useGetTimeLineQuery from "../query/useGetTimeLineQuery"

export const GET_MONTHLY_EVENTS = gql`
    query GetMonthlyEvents($date: String!) {
        timelineMonth(date: $date) {
            date
        }
    }
`

const groupDates = (dates: { date: string }[]) => {
    const monthEvents = {} as {
        [date: string]: number
    }

    for (let { date } of dates) {
        !!monthEvents[date] ? (monthEvents[date] += 1) : (monthEvents[date] = 1)
    }

    return monthEvents
}

export default function useTimeline({ route, navigation }: TimelineScreenProps<"Timeline">) {
    const { data, selected, setSelected, loading, error } = useGetTimeLineQuery()

    const { data: monthData, refetch } = useQuery(GET_MONTHLY_EVENTS, {
        variables: { date: moment().startOf("month").format("YYYY-MM-DD") },

        onError: (err) => ToastAndroid.show("Oh! Something went wrong", ToastAndroid.SHORT),
    })

    const onDayPress = useCallback((day: { dateString: string }) => setSelected(day.dateString), [setSelected])

    const createTimeline = useCallback(
        () =>
            navigation.navigate("TimelineCreate", {
                selectedDate: selected,
                mode: "create",
            }),
        [navigation, selected],
    )

    const dayEventsSorted = useMemo(() => groupDates(monthData?.timelineMonth || []), [monthData?.timelineMonth])

    const displayDate = useMemo(
        () => (moment().format("YYYY-MM-DD") === selected ? `Today (${selected})` : selected),
        [selected],
    )

    const [switchView, setSwitchView] = useState<"date-list" | "calendar" | "timeline">("timeline")

    const onViewToggle = useCallback(() => {
        const views = ["date-list", "timeline"]

        setSwitchView((prev) => {
            const index = views.findIndex((v) => v === prev)

            return views[(index + 1) % views.length] as "date-list" | "timeline"
        })
    }, [])

    return {
        data,
        selected,
        setSelected,
        loading,
        monthData,
        refetch,
        onDayPress,
        createTimeline,
        dayEventsSorted,
        displayDate,
        switchView,
        setSwitchView,
        onViewToggle,
        error,
    }
}
