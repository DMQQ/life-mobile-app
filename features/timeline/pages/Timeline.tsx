import DateList from "@/components/DateList/DateList"
import DeleteTimelineEvent from "@/components/ui/Dialog/Delete/DeleteTimelineEvent"
import Header from "@/components/ui/Header/Header"
import Colors from "@/constants/Colors"
import NotFound from "@/features/home/components/NotFound"
import { AntDesign, Feather, Ionicons } from "@expo/vector-icons"
import dayjs from "dayjs"
import moment from "moment"
import { useCallback, useMemo, useRef, useState } from "react"
import { RefreshControl, View, VirtualizedList } from "react-native"
import { useScreenSearch } from "@/utils/hooks/useScreenSearch"
import Feedback from "react-native-haptic-feedback"
import Animated from "react-native-reanimated"
import useTrackScroll from "@/utils/hooks/ui/useTrackScroll"
import DayTimeline from "../components/DayTimeline"
import { TimelineScreenLoader } from "../components/LoaderSkeleton"
import TimelineItem from "../components/TimelineItem"
import useTimeline from "../hooks/general/useTimeline"
import { GetTimelineQuery } from "../hooks/query/useGetTimeLineQuery"
import useWidgetTimelineData from "@/utils/widget/hooks/useWidgetTimelineData"
import { TimelineScreenProps } from "../types"
import Text from "@/components/ui/Text/Text"

const AnimatedVirtualizedList = Animated.createAnimatedComponent(VirtualizedList)

export default function Timeline({ navigation, route }: TimelineScreenProps<"Timeline">) {
    const timeline = useTimeline({
        navigation,
        route,
    })

    const timeoutId = useRef<NodeJS.Timeout | null>(null)
    const { isSearchActive } = useScreenSearch((query) => {
        if (timeoutId.current) {
            clearTimeout(timeoutId.current)
        }
        timeoutId.current = setTimeout(() => {
            timeline.setQuery(query)
        }, 200)
    })

    const [scrollY, onScroll] = useTrackScroll({ screenName: "TimelineScreens" })

    const selectedDateFormatted = useMemo(
        () =>
            new Intl.DateTimeFormat("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
            }).format(moment(timeline.selected).toDate()),
        [timeline.selected],
    )

    const eventsCount = timeline.data?.timeline?.length || 0

    const [selectedEventForDeletion, setSelectedEventForDeletion] = useState<GetTimelineQuery | null>(null)

    const renderItem = useCallback(
        ({ item }: { item: any }): any =>
            (
                <TimelineItem
                    {...item}
                    location="timeline"
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

    return (
        <View style={{ flex: 1 }}>
            {timeline.loading && <TimelineScreenLoader />}
            <Header
                scrollY={scrollY}
                animated={true}
                buttons={[
                    !isSearchActive && timeline.query === ""
                        ? {
                              onPress: () => {
                                  timeline.onViewToggle()
                              },
                              icon: <Feather name="repeat" size={20} color={Colors.foreground} />,
                          }
                        : undefined,
                    {
                        icon: <AntDesign name="plus" size={20} color={Colors.foreground} />,
                        onPress: () => timeline.createTimeline(),
                    },
                ]}
                animatedTitle={
                    isSearchActive && !!timeline.query
                        ? "Search " + `"${timeline.query}"`
                        : dayjs(timeline.selected).format("DD MMMM")
                }
                animatedSubtitle={`${selectedDateFormatted} - ${eventsCount} Events`}
                initialTitleFontSize={55 - timeline.query.length}
            />

            {timeline.switchView !== "timeline" || isSearchActive ? (
                <AnimatedVirtualizedList
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListHeaderComponent={
                        !isSearchActive && timeline.query === "" ? (
                            <View style={{ paddingBottom: 30 }}>{dateListMemoized}</View>
                        ) : (
                            <View style={{ height: 40 }} />
                        )
                    }
                    ListEmptyComponent={
                        !isSearchActive && timeline.query.trim() === "" ? (
                            <ListEmptyComponent
                                isLoading={timeline.loading}
                                length={eventsCount}
                                selectedDate={timeline.selected}
                            />
                        ) : (
                            <View style={{ flex: 1, height: 400, justifyContent: "center", alignItems: "center" }}>
                                <Ionicons
                                    name="search"
                                    size={50}
                                    color={Colors.text_dark}
                                    style={{ marginBottom: 15 }}
                                />
                                <Text style={{ color: Colors.text_dark }}>
                                    No events found for "{timeline.query}", {"\n"}try changing the phrase
                                </Text>
                            </View>
                        )
                    }
                    onScroll={onScroll}
                    contentContainerStyle={{
                        paddingBottom: (timeline.data?.timeline?.length || 0) > 0 ? 120 : 0,
                        padding: 15,
                        paddingTop: 300,
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
                    onScroll={onScroll}
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

            {/* <DeleteTimelineEvent
                shouldNavigateBack={false}
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
            /> */}
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
