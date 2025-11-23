import Colors from "@/constants/Colors"
import NotFound from "@/features/home/components/NotFound"
import { useCallback, useState } from "react"
import { RefreshControl, View, VirtualizedList } from "react-native"
import Animated from "react-native-reanimated"
import DayTimeline from "./DayTimeline"
import TimelineItem from "./TimelineItem"
import useGetTimeLineQuery, { GetTimelineQuery } from "../hooks/query/useGetTimeLineQuery"

const AnimatedVirtualizedList = Animated.createAnimatedComponent(VirtualizedList)

interface TimelineDayPageProps {
    date: string
    onScroll: any
    switchView: "date-list" | "calendar" | "timeline"
}

export default function TimelineDayPage({ date, onScroll, switchView }: TimelineDayPageProps) {
    const { data, loading, refetch } = useGetTimeLineQuery(date)
    const [refreshing, setRefreshing] = useState(false)

    const onRefresh = useCallback(async () => {
        setRefreshing(true)
        await refetch()
        setRefreshing(false)
    }, [refetch])

    const eventsCount = data?.timeline?.length || 0

    return switchView !== "timeline" ? (
        <AnimatedVirtualizedList
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListHeaderComponent={<View style={{ height: 20 }} />}
            ListEmptyComponent={<ListEmptyComponent isLoading={loading} length={eventsCount} selectedDate={date} />}
            onScroll={onScroll}
            contentContainerStyle={{
                paddingBottom: eventsCount > 0 ? 120 : 0,
                padding: 15,
                paddingTop: 450,
            }}
            data={(data?.timeline as GetTimelineQuery[]) || []}
            initialNumToRender={3}
            keyExtractor={(item: any) => item.id}
            getItem={(data, index) => data[index] as GetTimelineQuery}
            getItemCount={(data) => data.length}
            renderItem={({ item }: { item: any }) => <TimelineItem {...item} location="timeline" />}
        />
    ) : (
        <DayTimeline
            onScroll={onScroll}
            selected={date}
            date={date}
            events={data?.timeline || []}
            theme={{}}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={{ paddingTop: 150 }}>
                {data?.timeline?.length === 0 && (
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
