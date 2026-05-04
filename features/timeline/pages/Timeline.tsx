import Header from "@/components/ui/Header/Header"
import DatePicker, { DatePickerRef } from "@/components/DatePicker"
import DateList from "@/components/DateList/DateList"
import Colors from "@/constants/Colors"
import { AntDesign, Ionicons } from "@expo/vector-icons"
import dayjs from "dayjs"
import moment from "moment"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { RefreshControl, TouchableOpacity, View, VirtualizedList } from "react-native"
import { useScreenSearch } from "@/utils/hooks/useScreenSearch"
import Feedback from "react-native-haptic-feedback"
import { TimelineScreenLoader } from "../components/LoaderSkeleton"
import TimelineItem from "../components/TimelineItem"
import TimelineDayPage from "../components/TimelineDayPage"
import WeekView from "../components/WeekView"
import MonthView from "../components/MonthView"
import useTimeline from "../hooks/general/useTimeline"
import { OccurrenceItem } from "../hooks/query/useGetOccurrencesQuery"
import { TimelineScreenProps } from "../types"
import Text from "@/components/ui/Text/Text"
import PagerView from "react-native-pager-view"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Animated, {
    Easing,
    Extrapolation,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated"
import useTrackScroll from "@/utils/hooks/ui/useTrackScroll"
import Background from "@/components/ui/Background"

const HEADER_THRESHOLD = 200

function ViewSwitcher({
    current,
    onChange,
}: {
    current: "day" | "week" | "month"
    onChange: (v: "day" | "week" | "month") => void
}) {
    const labels: { key: "day" | "week" | "month"; label: string }[] = [
        { key: "day", label: "D" },
        { key: "week", label: "W" },
        { key: "month", label: "M" },
    ]
    return (
        <View style={{ flexDirection: "row", gap: 2, alignItems: "center" }}>
            {labels.map(({ key, label }) => {
                const isActive = current === key
                return (
                    <TouchableOpacity
                        key={key}
                        onPress={() => onChange(key)}
                        style={{
                            width: 26,
                            height: 26,
                            borderRadius: 13,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: isActive ? Colors.secondary : "transparent",
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 12,
                                fontWeight: "700",
                                color: isActive ? Colors.foreground : Colors.text_dark,
                            }}
                        >
                            {label}
                        </Text>
                    </TouchableOpacity>
                )
            })}
        </View>
    )
}

export default function Timeline({ navigation, route }: TimelineScreenProps<"Timeline">) {
    const timeline = useTimeline({ navigation, route })
    const insets = useSafeAreaInsets()
    const headerHeight = insets.top + 50
    const expandedHeaderHeight = insets.top * 3 + 90
    const dateListHeight = 83
    const dayContentPaddingTop = expandedHeaderHeight + dateListHeight
    const compactContentPaddingTop = headerHeight

    const [scrollY, onScroll] = useTrackScroll()

    const hasEverLoaded = useRef(false)
    if (timeline.data) hasEverLoaded.current = true

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

    useEffect(() => {
        scrollY.value = withTiming(0, { duration: 250 })
    }, [timeline.switchView])

    const animatedTitle = useMemo(() => {
        if (timeline.switchView === "week") {
            const ws = moment(timeline.selected).startOf("isoWeek")
            const we = ws.clone().add(6, "days")
            return ws.month() === we.month()
                ? `${ws.format("MMM D")} – ${we.format("D")}`
                : `${ws.format("MMM D")} – ${we.format("MMM D")}`
        }
        if (timeline.switchView === "month") {
            return dayjs(timeline.selected).format("MMMM YYYY")
        }
        return dayjs(timeline.selected).format("DD MMMM")
    }, [timeline.switchView, timeline.selected])

    const isDayView = timeline.switchView === "day"
    const isMonthView = timeline.switchView === "month"

    const viewOrder = { day: 0, week: 1, month: 2 } as const
    const prevViewRef = useRef<"day" | "week" | "month">(timeline.switchView)

    const scaleAnim = useSharedValue(1)
    const fadeAnim = useSharedValue(1)

    useEffect(() => {
        const prev = viewOrder[prevViewRef.current]
        const next = viewOrder[timeline.switchView]
        const zoomingIn = next < prev

        scaleAnim.value = zoomingIn ? 0.96 : 1.04
        fadeAnim.value = 0

        scaleAnim.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) })
        fadeAnim.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic) })

        prevViewRef.current = timeline.switchView
    }, [timeline.switchView])

    const fadeStyle = useAnimatedStyle(() => ({
        opacity: fadeAnim.value,
        transform: [{ scale: scaleAnim.value }],
        flex: 1,
    }))

    return (
        <View style={{ flex: 1 }}>
            <Background />

            {!hasEverLoaded.current && timeline.loading && <TimelineScreenLoader />}

            <Header
                animated={false}
                containerStyle={{ justifyContent: "flex-end" }}
                animatedTitle={!isSearchActive ? animatedTitle : undefined}
                onAnimatedTitlePress={
                    !isSearchActive && (isDayView || isMonthView) ? () => datePickerRef.current?.open() : undefined
                }
                buttons={[
                    !isSearchActive
                        ? {
                              onPress: () => {},
                              icon: null as any,

                              children: (
                                  <ViewSwitcher current={timeline.switchView} onChange={timeline.setSwitchView} />
                              ),
                          }
                        : undefined,
                    {
                        icon: <AntDesign name="plus" size={20} color={Colors.foreground} />,
                        onPress: () => timeline.createTimeline(),
                        position: "right",
                        standalone: true,
                    },
                ]}
                initialTitleFontSize={25}
                shadow={false}
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
                        controlRef={datePickerRef}
                        mode="single"
                        dates={{ start: selectedDate, end: selectedDate }}
                        setDates={(d) => timeline.setSelected(moment(d.start).format("YYYY-MM-DD"))}
                        buttonComponent={() => <View style={{ width: 0, height: 0 }} />}
                    />
                )}
            </Header>

            {!isSearchActive && isDayView && (
                <Animated.View
                    style={[{ position: "absolute", left: 0, right: 0, zIndex: 100 }, { top: headerHeight }]}
                >
                    <DateList
                        dayEvents={timeline.dayEventsSorted}
                        selectedDate={timeline.selected}
                        setSelected={timeline.setSelected}
                    />
                </Animated.View>
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
                    <Animated.View style={fadeStyle}>
                        {isDayView ? (
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
                                            switchView="timeline"
                                            contentPaddingTop={dayContentPaddingTop + 15}
                                            onScroll={onScroll}
                                        />
                                    </View>
                                ))}
                            </PagerView>
                        ) : isMonthView ? (
                            <MonthView
                                selectedDate={timeline.selected}
                                setSelected={timeline.setSelected}
                                contentPaddingTop={compactContentPaddingTop}
                                onDayPress={(date) => {
                                    timeline.setSelected(date)
                                    timeline.setSwitchView("day")
                                }}
                            />
                        ) : (
                            <WeekView
                                selectedDate={timeline.selected}
                                setSelected={timeline.setSelected}
                                contentPaddingTop={compactContentPaddingTop}
                                onScroll={onScroll}
                            />
                        )}
                    </Animated.View>
                )}
            </View>
        </View>
    )
}
