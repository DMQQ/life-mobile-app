import DateList from "@/components/DateList/DateList"
import Header from "@/components/ui/Header/Header"
import Colors from "@/constants/Colors"
import { AntDesign, Feather, Ionicons } from "@expo/vector-icons"
import dayjs from "dayjs"
import moment from "moment"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { RefreshControl, View, VirtualizedList } from "react-native"
import { useScreenSearch } from "@/utils/hooks/useScreenSearch"
import Feedback from "react-native-haptic-feedback"
import Animated, { useAnimatedStyle, interpolate, Extrapolation } from "react-native-reanimated"
import useTrackScroll from "@/utils/hooks/ui/useTrackScroll"
import { TimelineScreenLoader } from "../components/LoaderSkeleton"
import TimelineItem from "../components/TimelineItem"
import TimelineDayPage from "../components/TimelineDayPage"
import useTimeline from "../hooks/general/useTimeline"
import { GetTimelineQuery } from "../hooks/query/useGetTimeLineQuery"
import { TimelineScreenProps } from "../types"
import Text from "@/components/ui/Text/Text"
import PagerView from "react-native-pager-view"

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

    const pagerRef = useRef<PagerView>(null)
    const isProgrammaticChange = useRef(false)

    const visibleDates = useMemo(() => {
        const selectedMoment = moment(timeline.selected)
        return [
            selectedMoment.clone().subtract(1, "day").format("YYYY-MM-DD"),
            timeline.selected,
            selectedMoment.clone().add(1, "day").format("YYYY-MM-DD"),
            selectedMoment.clone().add(2, "days").format("YYYY-MM-DD"),
        ]
    }, [timeline.selected])

    const lastSelectedRef = useRef(timeline.selected)
    useEffect(() => {
        if (timeline.selected !== lastSelectedRef.current) {
            lastSelectedRef.current = timeline.selected
            isProgrammaticChange.current = true
            pagerRef.current?.setPageWithoutAnimation(1)
            setTimeout(() => {
                isProgrammaticChange.current = false
            }, 100)
        }
    }, [timeline.selected])

    const handlePageSelected = useCallback(
        (e: any) => {
            if (isProgrammaticChange.current) {
                return
            }

            const position = e.nativeEvent.position
            const selectedDate = visibleDates[position]
            if (selectedDate && selectedDate !== timeline.selected) {
                Feedback.trigger("impactLight")
                isProgrammaticChange.current = true
                timeline.setSelected(selectedDate)
            }
        },
        [visibleDates, timeline.selected],
    )

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

    const dateListAnimatedStyle = useAnimatedStyle(() => {
        if (!scrollY) return { transform: [{ translateY: 0 }] }

        const scrollValue = scrollY.value
        const clampedValue = Math.max(0, Math.min(scrollValue, 200))

        return {
            transform: [{ translateY: interpolate(clampedValue, [0, 200], [0, -175], Extrapolation.CLAMP) }],
        }
    })

    const renderItem = useCallback(
        ({ item }: { item: any }): any => (<TimelineItem {...item} location="timeline" />) as any,
        [],
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
                renderAnimatedItem={
                    !isSearchActive
                        ? () => (
                              <Animated.View style={[{ marginTop: 175 }, dateListAnimatedStyle]}>
                                  <DateList
                                      dayEvents={timeline.dayEventsSorted}
                                      selectedDate={timeline.selected}
                                      setSelected={timeline.setSelected}
                                      scrollY={scrollY}
                                  />
                              </Animated.View>
                          )
                        : undefined
                }
            />

            {isSearchActive ? (
                <AnimatedVirtualizedList
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListHeaderComponent={<View style={{ height: 40 }} />}
                    ListEmptyComponent={
                        <View style={{ flex: 1, height: 400, justifyContent: "center", alignItems: "center" }}>
                            <Ionicons name="search" size={50} color={Colors.text_dark} style={{ marginBottom: 15 }} />
                            <Text style={{ color: Colors.text_dark }}>
                                No events found for "{timeline.query}", {"\n"}try changing the phrase
                            </Text>
                        </View>
                    }
                    onScroll={onScroll}
                    contentContainerStyle={{
                        paddingBottom: (timeline.data?.timeline?.length || 0) > 0 ? 120 : 0,
                        padding: 15,
                        paddingTop: 250,
                    }}
                    data={(timeline.data?.timeline as GetTimelineQuery[]) || []}
                    initialNumToRender={3}
                    keyExtractor={(item: any) => item.id}
                    getItem={(data, index) => data[index] as GetTimelineQuery}
                    getItemCount={(data) => data.length}
                    renderItem={renderItem}
                />
            ) : (
                <PagerView ref={pagerRef} style={{ flex: 1 }} initialPage={1} onPageSelected={handlePageSelected}>
                    {visibleDates.map((date) => (
                        <View key={date} style={{ flex: 1 }}>
                            <TimelineDayPage date={date} onScroll={onScroll} switchView={timeline.switchView} />
                        </View>
                    ))}
                </PagerView>
            )}
        </View>
    )
}
