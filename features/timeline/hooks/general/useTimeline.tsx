import { gql, useQuery } from "@apollo/client"
import moment from "moment"
import { useCallback, useMemo, useState } from "react"
import { TimelineScreenProps } from "../../types"
import useGetOccurrencesQuery from "../query/useGetOccurrencesQuery"

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
        !!monthEvents[date] ? (monthEvents[date] += 1) : (monthEvents[date] = 1)
    }
    return monthEvents
}

export default function useTimeline({ route, navigation }: TimelineScreenProps<"Timeline">) {
    const { data, selected, setSelected, loading, error, setQuery, query } = useGetOccurrencesQuery()

    const [switchView, setSwitchView] = useState<"date-list" | "calendar" | "timeline">("timeline")

    const { data: monthData, refetch } = useQuery(GET_MONTHLY_OCCURRENCES, {
        variables: { date: moment(selected).startOf("month").format("YYYY-MM-DD") },
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

    const dayEventsSorted = useMemo(() => groupDates(monthData?.occurrenceMonth || []), [monthData?.occurrenceMonth])

    const displayDate = useMemo(
        () => (moment().format("YYYY-MM-DD") === selected ? `Today (${selected})` : selected),
        [selected],
    )

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
        setQuery,
        query,
    }
}
