import Header from "@/components/ui/Header/Header"
import DatePicker, { DatePickerRef } from "@/components/DatePicker"
import DateList from "@/components/DateList/DateList"
import Colors from "@/constants/Colors"
import { AntDesign, Feather, Ionicons } from "@expo/vector-icons"
import dayjs from "dayjs"
import moment from "moment"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { RefreshControl, TouchableOpacity, View, VirtualizedList } from "react-native"
import { useScreenSearch } from "@/utils/hooks/useScreenSearch"
import Feedback from "react-native-haptic-feedback"
import { TimelineScreenLoader } from "../components/LoaderSkeleton"
import TimelineItem from "../components/TimelineItem"
import TimelineDayPage from "../components/TimelineDayPage"
import useTimeline from "../hooks/general/useTimeline"
import { OccurrenceItem } from "../hooks/query/useGetOccurrencesQuery"
import { TimelineScreenProps } from "../types"
import Text from "@/components/ui/Text/Text"
import PagerView from "react-native-pager-view"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Animated, { Extrapolation, interpolate, useAnimatedStyle, withTiming } from "react-native-reanimated"
import useTrackScroll from "@/utils/hooks/ui/useTrackScroll"
import Background from "@/components/ui/Background"

const HEADER_THRESHOLD = 200

export default function Timeline({ navigation, route }: TimelineScreenProps<"Timeline">) {
    const timeline = useTimeline({ navigation, route })
    const insets = useSafeAreaInsets()
    const headerHeight = insets.top + 50

    const [scrollY, onScroll] = useTrackScroll()

    const expandedHeaderHeight = insets.top * 3 + 90
    const dateListHeight = 83
    const expandedContentPaddingTop = expandedHeaderHeight + dateListHeight

    const timeoutId = useRef<number | null>(null)
    const { isSearchActive } = useScreenSearch(
        useCallback(
            (query) => {
                if (timeoutId.current) clearTimeout(timeoutId.current)
                timeoutId.current = setTimeout(() => timeline.setQuery(query), 200)
            },
            [timeline.setQuery],
        ),
    )

    const pagerRef = useRef<PagerView>(null)
    const datePickerRef = useRef<DatePickerRef>(null)
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
            if (isProgrammaticChange.current) return
            const position = e.nativeEvent.position
            const selectedDate = visibleDates[position]
            if (selectedDate && selectedDate !== timeline.selected) {
                Feedback.trigger("impactLight")
                isProgrammaticChange.current = true
                timeline.setSelected(selectedDate)
                scrollY.value = withTiming(0, { duration: 250 })
            }
        },
        [visibleDates, timeline.selected],
    )

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

    const selectedDate = moment(timeline.selected).toDate()

    const animatedDateListStyle = useAnimatedStyle(() => ({
        top: interpolate(
            scrollY.value,
            [0, HEADER_THRESHOLD],
            [expandedHeaderHeight, headerHeight],
            Extrapolation.CLAMP,
        ),
    }))

    useEffect(() => {
        scrollY.value = withTiming(0, { duration: 250 })
    }, [timeline.switchView])

    return (
        <View style={{ flex: 1 }}>
            <Background />

            {timeline.loading && <TimelineScreenLoader />}

            <Header
                containerStyle={{ justifyContent: "flex-end" }}
                animated={!isSearchActive}
                scrollY={!isSearchActive ? scrollY : undefined}
                animatedTitle={!isSearchActive ? dayjs(timeline.selected).format("DD MMMM") : undefined}
                onAnimatedTitlePress={!isSearchActive ? () => datePickerRef.current?.open() : undefined}
                buttons={[
                    !isSearchActive && timeline.query === ""
                        ? {
                              onPress: timeline.onViewToggle,
                              icon: <Feather name="repeat" size={20} color={Colors.foreground} />,
                          }
                        : undefined,

                    {
                        icon: <AntDesign name="plus" size={20} color={Colors.foreground} />,
                        onPress: () => timeline.createTimeline(),
                    },
                ]}
                initialTitleFontSize={55}
                // shadow={false}
                shadow
            >
                {isSearchActive ? (
                    <DatePicker
                        mode="single"
                        dates={{ start: selectedDate, end: selectedDate }}
                        setDates={(d) => timeline.setSelected(moment(d.start).format("YYYY-MM-DD"))}
                        buttonComponent={() => (
                            <TouchableOpacity>
                                <Text style={{ fontSize: 22, fontWeight: "bold", color: Colors.foreground }}>
                                    {timeline.query
                                        ? `"${timeline.query}"`
                                        : dayjs(timeline.selected).format("DD MMMM")}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                ) : (
                    <DatePicker
                        ref={datePickerRef}
                        mode="single"
                        dates={{ start: selectedDate, end: selectedDate }}
                        setDates={(d) => timeline.setSelected(moment(d.start).format("YYYY-MM-DD"))}
                        buttonComponent={() => <View style={{ width: 0, height: 0 }} />}
                    />
                )}
            </Header>

            {!isSearchActive && (
                <>
                    <Animated.View
                        style={[{ position: "absolute", left: 0, right: 0, zIndex: 100 }, animatedDateListStyle]}
                    >
                        <DateList
                            dayEvents={timeline.dayEventsSorted}
                            selectedDate={timeline.selected}
                            setSelected={timeline.setSelected}
                        />
                    </Animated.View>
                </>
            )}

            <View style={{ flex: 1 }}>
                {isSearchActive ? (
                    <VirtualizedList
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                        ListHeaderComponent={<View style={{ height: 10 }} />}
                        ListEmptyComponent={
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
                        }
                        contentContainerStyle={{
                            paddingBottom: (timeline.data?.occurrences?.length || 0) > 0 ? 120 : 0,
                            padding: 15,
                            paddingTop: headerHeight + 10,
                        }}
                        data={(timeline.data?.occurrences as OccurrenceItem[]) || []}
                        initialNumToRender={3}
                        keyExtractor={(item: any) => item.id}
                        getItem={(data, index) => data[index] as OccurrenceItem}
                        getItemCount={(data) => data.length}
                        renderItem={renderItem}
                    />
                ) : (
                    <PagerView
                        offscreenPageLimit={3}
                        ref={pagerRef}
                        style={{ flex: 1 }}
                        initialPage={1}
                        onPageSelected={handlePageSelected}
                    >
                        {visibleDates.map((date) => (
                            <View key={date} style={{ flex: 1 }}>
                                <TimelineDayPage
                                    date={date}
                                    switchView={timeline.switchView}
                                    contentPaddingTop={expandedContentPaddingTop + 15}
                                    onScroll={onScroll}
                                />
                            </View>
                        ))}
                    </PagerView>
                )}
            </View>
        </View>
    )
}
