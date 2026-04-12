import NotFound from "@/features/home/components/NotFound"
import { useCallback, useState, useEffect, useRef } from "react"
import { RefreshControl, View } from "react-native"
import Animated from "react-native-reanimated"
import DayTimeline from "./DayTimeline"
import TimelineItem from "./TimelineItem"
import useGetOccurrencesQuery, { OccurrenceItem } from "../hooks/query/useGetOccurrencesQuery"

interface TimelineDayPageProps {
    date: string
    switchView: "date-list" | "calendar" | "timeline"
    contentPaddingTop?: number
    onScroll?: (...args: any[]) => void
}

export default function TimelineDayPage({ date, switchView, contentPaddingTop = 0, onScroll }: TimelineDayPageProps) {
    const { data, loading, refetch } = useGetOccurrencesQuery(date)
    const [refreshing, setRefreshing] = useState(false)

    const flatListRef = useRef<any>(null)

    useEffect(() => {
        if (switchView !== "timeline") {
            const timeout = setTimeout(() => {
                flatListRef.current?.scrollToOffset({ offset: 1, animated: false })

                flatListRef.current?.scrollToOffset({ offset: 0, animated: false })
            }, 1)

            return () => clearTimeout(timeout)
        }
    }, [switchView])

    const onRefresh = useCallback(async () => {
        setRefreshing(true)
        await refetch()
        setRefreshing(false)
    }, [refetch])

    const eventsCount = data?.occurrences?.length || 0

    return switchView !== "timeline" ? (
        <Animated.FlatList
            ref={flatListRef}
            onScroll={onScroll}
            scrollEventThrottle={16}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={<ListEmptyComponent isLoading={loading} length={eventsCount} selectedDate={date} />}
            contentContainerStyle={{
                paddingBottom: eventsCount > 0 ? 120 : 0,
                padding: 15,
                paddingTop: contentPaddingTop,
            }}
            data={(data?.occurrences as OccurrenceItem[]) || []}
            initialNumToRender={3}
            keyExtractor={(item: any) => item.id}
            renderItem={({ item }: { item: any }) => <TimelineItem {...item} location="timeline" />}
        />
    ) : (
        <DayTimeline
            selected={date}
            date={date}
            events={data?.occurrences || []}
            theme={{}}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            onScroll={onScroll}
            style={{ flex: 1, paddingTop: contentPaddingTop }}
        ></DayTimeline>
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
