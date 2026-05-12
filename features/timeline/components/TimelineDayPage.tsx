import { useCallback, useState } from "react"
import { RefreshControl } from "react-native"
import DayTimeline from "./DayTimeline"
import useGetOccurrencesQuery from "../hooks/query/useGetOccurrencesQuery"

interface TimelineDayPageProps {
    date: string
    contentPaddingTop?: number
    onScroll?: (...args: any[]) => void
}

export default function TimelineDayPage({ date, contentPaddingTop = 0, onScroll }: TimelineDayPageProps) {
    const { data, refetch } = useGetOccurrencesQuery(date)
    const [refreshing, setRefreshing] = useState(false)

    const onRefresh = useCallback(async () => {
        setRefreshing(true)
        await refetch()
        setRefreshing(false)
    }, [refetch])

    return (
        <DayTimeline
            selected={date}
            date={date}
            events={data?.occurrences || []}
            theme={{}}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            onScroll={onScroll}
            style={{ flex: 1, paddingTop: contentPaddingTop }}
        />
    )
}
