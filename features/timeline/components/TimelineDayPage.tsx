import NotFound from "@/features/home/components/NotFound"
import { useCallback, useState } from "react"
import { RefreshControl, View, VirtualizedList } from "react-native"
import DayTimeline from "./DayTimeline"
import TimelineItem from "./TimelineItem"
import useGetOccurrencesQuery, { OccurrenceItem } from "../hooks/query/useGetOccurrencesQuery"

interface TimelineDayPageProps {
    date: string
    switchView: "date-list" | "calendar" | "timeline"
    contentPaddingTop?: number
}

export default function TimelineDayPage({ date, switchView, contentPaddingTop = 0 }: TimelineDayPageProps) {
    const { data, loading, refetch } = useGetOccurrencesQuery(date)
    const [refreshing, setRefreshing] = useState(false)

    const onRefresh = useCallback(async () => {
        setRefreshing(true)
        await refetch()
        setRefreshing(false)
    }, [refetch])

    const eventsCount = data?.occurrences?.length || 0

    return switchView !== "timeline" ? (
        <VirtualizedList
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListHeaderComponent={<View style={{ height: 20 }} />}
            ListEmptyComponent={<ListEmptyComponent isLoading={loading} length={eventsCount} selectedDate={date} />}
            contentContainerStyle={{
                paddingBottom: eventsCount > 0 ? 120 : 0,
                padding: 15,
                paddingTop: contentPaddingTop,
            }}
            data={(data?.occurrences as OccurrenceItem[]) || []}
            initialNumToRender={3}
            keyExtractor={(item: any) => item.id}
            getItem={(data, index) => data[index] as OccurrenceItem}
            getItemCount={(data) => data.length}
            renderItem={({ item }: { item: any }) => <TimelineItem {...item} location="timeline" />}
        />
    ) : (
        <DayTimeline
            selected={date}
            date={date}
            events={data?.occurrences || []}
            theme={{}}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={{ paddingTop: contentPaddingTop }}>
                {data?.occurrences?.length === 0 && (
                    <View style={{ height: 225, marginTop: 30, paddingHorizontal: 15 }}>
                        <ListEmptyComponent isLoading={loading} length={eventsCount} selectedDate={date} />
                    </View>
                )}
            </View>
        </DayTimeline>
    )
}

interface ListEmptyComponentProps {
    isLoading: boolean
    length: number
    selectedDate: string
}

const ListEmptyComponent = (props: ListEmptyComponentProps) =>
    props.length === 0 ? (
        <View
            style={{
                padding: 15,
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                marginTop: 25,
            }}
        >
            <NotFound selectedDate={props.selectedDate} />
        </View>
    ) : null
