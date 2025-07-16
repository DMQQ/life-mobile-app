import DateList from "@/components/DateList/DateList"
import DeleteTimelineEvent from "@/components/ui/Dialog/Delete/DeleteTimelineEvent"
import Header from "@/components/ui/Header/Header"
import Colors from "@/constants/Colors"
import NotFound from "@/features/home/components/NotFound"
import { AntDesign, FontAwesome, MaterialIcons } from "@expo/vector-icons"
import dayjs from "dayjs"
import moment from "moment"
import { useState } from "react"
import { View, VirtualizedList } from "react-native"
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

    return (
        <View style={{ flex: 1, padding: 15 }}>
            <Header
                scrollY={scrollY}
                animated={true}
                buttons={[
                    {
                        onPress: timeline.onViewToggle,
                        icon:
                            timeline.switchView === "date-list" ? (
                                <FontAwesome name="list-alt" size={20} color="#fff" />
                            ) : (
                                <MaterialIcons name="view-agenda" size={20} color="#fff" />
                            ),
                    },
                    {
                        icon: <AntDesign name="plus" size={20} color="#fff" />,
                        onPress: () => timeline.createTimeline(),
                    },
                ]}
                animatedTitle={dayjs(timeline.selected).format("DD MMMM")}
                animatedSubtitle={`${selectedDateFormatted} • ${eventsCount} Events`}
            />
            <DateList
                onMenuPress={() => timeline.setSwitchView("calendar")}
                dayEvents={timeline.dayEventsSorted}
                selectedDate={timeline.selected}
                setSelected={timeline.setSelected}
                translateY={translateY}
            />

            {timeline.loading ? (
                <TimelineScreenLoader loading />
            ) : timeline.data?.timeline?.length === 0 ? (
                <View
                    style={{
                        padding: 15,
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: 25,
                    }}
                >
                    <NotFound selectedDate={timeline.selected} />
                </View>
            ) : null}

            {timeline.switchView !== "timeline" ? (
                <AnimatedVirtualizedList
                    onScroll={scrollHandler}
                    contentContainerStyle={{
                        paddingBottom: 100,
                        paddingTop: 15,
                    }}
                    CellRendererComponent={({ index, style, ...rest }) => {
                        const newStyle = [style, { zIndex: -1 }]
                        return <View style={newStyle} {...rest} />
                    }}
                    data={(timeline.data?.timeline as GetTimelineQuery[]) || []}
                    initialNumToRender={3}
                    keyExtractor={(item: any) => item.id}
                    getItem={(data, index) => data[index] as GetTimelineQuery}
                    getItemCount={(data) => data.length}
                    renderItem={({ item }: { item: any }): any =>
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
                                    setSelectedEventForDeletion(item)
                                }}
                            />
                        ) as any
                    }
                />
            ) : (
                <DayTimeline
                    onScroll={scrollHandler}
                    selected={timeline.selected}
                    date={timeline.selected}
                    events={timeline.data?.timeline || []}
                    theme={{}}
                    onLongPress={(item) => {
                        setSelectedEventForDeletion(item as GetTimelineQuery)
                    }}
                />
            )}

            <DeleteTimelineEvent
                isVisible={!!selectedEventForDeletion}
                item={
                    selectedEventForDeletion
                        ? {
                              id: selectedEventForDeletion.id,
                              name: selectedEventForDeletion.title,
                          }
                        : undefined
                }
                onDismiss={() => setSelectedEventForDeletion(null)}
            />
        </View>
    )
}
