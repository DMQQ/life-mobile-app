import { gql, useQuery } from "@apollo/client"
import moment from "moment"
import { useCallback, useEffect, useMemo, useState } from "react"
import { TimelineScreenProps } from "../../types"
import useGetOccurrencesQuery from "../query/useGetOccurrencesQuery"
import dayjs from "dayjs"

export const GET_MONTHLY_OCCURRENCES = gql`
    query GetMonthlyOccurrences($date: String!) {
        occurrenceMonth(date: $date) {
            date
        }
    }
`

const groupDates = (dates: { date: string }[]) => {
    const monthEvents = {} as { [date: string]: number }
    for (let { date } of dates) {
        const formattedDate = dayjs(parseInt(date)).format("YYYY-MM-DD")
        !!monthEvents[formattedDate] ? (monthEvents[formattedDate] += 1) : (monthEvents[formattedDate] = 1)
    }
    return monthEvents
}

export default function useTimeline({ route, navigation }: TimelineScreenProps<"Timeline">) {
    const { data, selected, setSelected, loading, error, setQuery, query } = useGetOccurrencesQuery()

    const [switchView, setSwitchView] = useState<"day" | "week" | "month">("day")

    const { data: monthData, refetch } = useQuery(GET_MONTHLY_OCCURRENCES, {
        variables: { date: dayjs(selected).startOf("month").format("YYYY-MM-DD") },
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

    const dayEventsSorted = useMemo(() => {
        const data = groupDates(monthData?.occurrenceMonth || [])

        return data
    }, [monthData?.occurrenceMonth])

    const displayDate = useMemo(
        () => (moment().format("YYYY-MM-DD") === selected ? `Today (${selected})` : selected),
        [selected],
    )

    const onViewToggle = useCallback(() => {
        setSwitchView((prev) => {
            const views: ("day" | "week" | "month")[] = ["day", "week", "month"]
            return views[(views.indexOf(prev) + 1) % views.length]
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
        setQuery,
        query,
    }
}
