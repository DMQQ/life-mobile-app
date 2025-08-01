import DateList from "@/components/DateList/DateList"
import DeleteTimelineEvent from "@/components/ui/Dialog/Delete/DeleteTimelineEvent"
import AnimatedHeaderSearch from "@/components/ui/Header/AnimatedHeaderSearch"
import Header from "@/components/ui/Header/Header"
import Colors from "@/constants/Colors"
import NotFound from "@/features/home/components/NotFound"
import { AntDesign, Feather } from "@expo/vector-icons"
import dayjs from "dayjs"
import moment from "moment"
import { useCallback, useMemo, useState } from "react"
import { RefreshControl, View, VirtualizedList } from "react-native"
import Feedback from "react-native-haptic-feedback"
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated"
import DayTimeline from "../components/DayTimeline"
import { TimelineScreenLoader } from "../components/LoaderSkeleton"
import TimelineItem from "../components/TimelineItem"
import useTimeline from "../hooks/general/useTimeline"
import { GetTimelineQuery } from "../hooks/query/useGetTimeLineQuery"
import { TimelineScreenProps } from "../types"

const AnimatedVirtualizedList = Animated.createAnimatedComponent(VirtualizedList)

export default function Timeline({ navigation, route }: TimelineScreenProps<"Timeline">) {
    const timeline = useTimeline({
        navigation,
        route,
    })

    const scrollY = useSharedValue(0)
    const translateY = useSharedValue(0)

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            const currentScrollY = event.contentOffset.y
            scrollY.value = currentScrollY

            translateY.value = currentScrollY
        },
    })

    const selectedDateFormatted = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
    }).format(moment(timeline.selected).toDate())

    const eventsCount = timeline.data?.timeline?.length || 0

    const [selectedEventForDeletion, setSelectedEventForDeletion] = useState<GetTimelineQuery | null>(null)

    const renderItem = useCallback(
        ({ item }: { item: any }): any =>
            (
                <TimelineItem
                    styles={{
                        backgroundColor: Colors.primary_lighter,
                        borderRadius: 15,
                        padding: 20,
                        marginBottom: 10,
                        zIndex: 1,
                    }}
                    key={item.id}
                    location="timeline"
                    {...item}
                    onLongPress={() => {
                        Feedback.trigger("impactMedium")
                        setSelectedEventForDeletion(item)
                    }}
                />
            ) as any,
        [],
    )

    const dateListMemoized = useMemo(
        () => (
            <DateList
                dayEvents={timeline.dayEventsSorted}
                selectedDate={timeline.selected}
                setSelected={timeline.setSelected}
            />
        ),
        [timeline.selected, timeline.dayEventsSorted],
    )
    const [refreshing, setRefreshing] = useState(false)

    const onRefresh = async () => {
        setRefreshing(true)

        await timeline.refetch()

        setRefreshing(false)
    }
    const [query, setQuery] = useState("")

    return (
        <View style={{ flex: 1 }}>
            {timeline.loading && <TimelineScreenLoader />}
            <Header
                scrollY={scrollY}
                animated={true}
                buttons={[
                    {
                        onPress: () => {
                            timeline.onViewToggle()
                            scrollY.value = 0
                        },
                        icon: <Feather name="repeat" size={20} color={Colors.foreground} />,
                    },
                    {
                        icon: <AntDesign name="plus" size={20} color={Colors.foreground} />,
                        onPress: () => timeline.createTimeline(),
                    },
                ]}
                animatedTitle={dayjs(timeline.selected).format("DD MMMM")}
                animatedSubtitle={`${selectedDateFormatted} • ${eventsCount} Events`}
                renderAnimatedItem={(props) => (
                    <AnimatedHeaderSearch buttonsCount={2} {...props} filterValue={query} setFilterValue={setQuery} />
                )}
            />

            {timeline.switchView !== "timeline" ? (
                <AnimatedVirtualizedList
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListHeaderComponent={<View style={{ paddingBottom: 30 }}>{dateListMemoized}</View>}
                    ListEmptyComponent={
                        <ListEmptyComponent
                            isLoading={timeline.loading}
                            length={eventsCount}
                            selectedDate={timeline.selected}
                        />
                    }
                    onScroll={scrollHandler}
                    contentContainerStyle={{
                        paddingBottom: (timeline.data?.timeline?.length || 0) > 0 ? 120 : 0,
                        padding: 15,
                        paddingTop: 275,
                    }}
                    data={(timeline.data?.timeline as GetTimelineQuery[]) || []}
                    initialNumToRender={3}
                    keyExtractor={(item: any) => item.id}
                    getItem={(data, index) => data[index] as GetTimelineQuery}
                    getItemCount={(data) => data.length}
                    renderItem={renderItem}
                />
            ) : (
                <DayTimeline
                    onScroll={scrollHandler}
                    selected={timeline.selected}
                    date={timeline.selected}
                    events={timeline.data?.timeline || []}
                    theme={{}}
                    onLongPress={(item) => {
                        Feedback.trigger("impactMedium")
                        setSelectedEventForDeletion(item as GetTimelineQuery)
                    }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                >
                    <View style={{ paddingHorizontal: 15, paddingBottom: 30 }}>
                        {dateListMemoized}
                        {timeline.data?.timeline?.length === 0 && (
                            <View style={{ height: 225, marginTop: 30 }}>
                                <ListEmptyComponent
                                    isLoading={timeline.loading}
                                    length={eventsCount}
                                    selectedDate={timeline.selected}
                                />
                            </View>
                        )}
                    </View>
                </DayTimeline>
            )}

            <DeleteTimelineEvent
                isVisible={!!selectedEventForDeletion}
                item={
                    selectedEventForDeletion
                        ? {
                              id: selectedEventForDeletion.id,
                              name: selectedEventForDeletion.title,
                              date: selectedEventForDeletion.date,
                          }
                        : undefined
                }
                onDismiss={() => setSelectedEventForDeletion(null)}
            />
        </View>
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
