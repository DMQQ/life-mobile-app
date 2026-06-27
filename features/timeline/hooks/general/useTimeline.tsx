import { gql, useQuery } from "@apollo/client"
import moment from "moment"
import { useCallback, useMemo, useState } from "react"
import { DEFAULT_TIMELINE_FILTERS, TimelineFilterState, TimelineScreenProps } from "../../types"
import useGetOccurrencesQuery, { OccurrenceSearchInput } from "../query/useGetOccurrencesQuery"
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
        const formattedDate = dayjs(date).format("YYYY-MM-DD")
        !!monthEvents[formattedDate] ? (monthEvents[formattedDate] += 1) : (monthEvents[formattedDate] = 1)
    }
    return monthEvents
}

function buildSearchInput(filters: TimelineFilterState): OccurrenceSearchInput | undefined {
    const hasContent =
        filters.searchText ||
        filters.dateFrom ||
        filters.dateTo ||
        filters.hoursFrom ||
        filters.hoursTo ||
        filters.status !== "all"
    if (!hasContent) return undefined
    return {
        query: filters.searchText || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        timeFrom: filters.hoursFrom || undefined,
        timeTo: filters.hoursTo || undefined,
        status: filters.status !== "all" ? filters.status : undefined,
    }
}

export default function useTimeline(
    { route, navigation }: TimelineScreenProps<"Timeline">,
    filters: TimelineFilterState = DEFAULT_TIMELINE_FILTERS,
) {
    const search = useMemo(() => buildSearchInput(filters), [filters])
    const { data, selected, setSelected, loading, error, setQuery, query } = useGetOccurrencesQuery(
        route.params?.date,
        search,
    )

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
        return groupDates(monthData?.occurrenceMonth || [])
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
