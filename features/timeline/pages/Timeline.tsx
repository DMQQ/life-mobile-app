import Header from "@/components/ui/Header/Header"
import DatePicker, { DatePickerRef } from "@/components/DatePicker"
import DateList from "@/components/DateList/DateList"
import Colors from "@/constants/Colors"
import dayjs from "dayjs"
import { SFSymbol } from "expo-symbols"
import moment from "moment"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { View } from "react-native"
import { useScreenSearch } from "@/utils/hooks/useScreenSearch"
import { TimelineScreenLoader } from "../components/LoaderSkeleton"
import TimelineContent from "../components/TimelineContent"
import useTimeline from "../hooks/general/useTimeline"
import { usePrefetchMonthRange } from "../hooks/query/useGetOccurrencesQuery"
import { TimelineScreenProps } from "../types"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Animated, { withTiming } from "react-native-reanimated"
import useTrackScroll from "@/utils/hooks/ui/useTrackScroll"
import Background from "@/components/ui/Background"

export default function Timeline({ navigation, route }: TimelineScreenProps<"Timeline">) {
    const timeline = useTimeline({ navigation, route })
    usePrefetchMonthRange(timeline.selected)
    const insets = useSafeAreaInsets()
    const headerHeight = insets.top + 50
    const expandedHeaderHeight = insets.top * 3 + 90
    const dateListHeight = 83
    const dayContentPaddingTop = expandedHeaderHeight + dateListHeight
    const compactContentPaddingTop = headerHeight

    const [scrollY, onScroll] = useTrackScroll()

    const hasEverLoaded = useRef(false)
    if (timeline.data) hasEverLoaded.current = true

    const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null)
    const { isSearchActive } = useScreenSearch(
        useCallback(
            (query) => {
                if (timeoutId.current) clearTimeout(timeoutId.current)
                timeoutId.current = setTimeout(() => timeline.setQuery(query), 200)
            },
            [timeline.setQuery],
        ),
    )

    const datePickerRef = useRef<DatePickerRef>(null)

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
            return dayjs(timeline.selected).format("MMMM")
        }
        return dayjs(timeline.selected).format("DD MMMM")
    }, [timeline.switchView, timeline.selected])

    const isDayView = timeline.switchView === "day"

    return (
        <View style={{ flex: 1 }}>
            <Background />

            {!hasEverLoaded.current && timeline.loading && <TimelineScreenLoader />}

            <Header
                animated={false}
                containerStyle={{ justifyContent: "space-between" }}
                onAnimatedTitlePress={() => datePickerRef.current?.open()}
                buttons={[
                    !isSearchActive
                        ? {
                              icon: "calendar" as SFSymbol,
                              contextMenu: {
                                  items: [
                                      {
                                          title: "Day",
                                          systemImage: "sun.max",
                                          checked: timeline.switchView === "day",
                                          onPress: () => timeline.setSwitchView("day"),
                                      },
                                      {
                                          title: "Week",
                                          systemImage: "calendar.badge.clock",
                                          checked: timeline.switchView === "week",
                                          onPress: () => timeline.setSwitchView("week"),
                                      },
                                      {
                                          title: "Month",
                                          systemImage: "calendar",
                                          checked: timeline.switchView === "month",
                                          onPress: () => timeline.setSwitchView("month"),
                                      },
                                  ],
                              },
                          }
                        : undefined,
                    {
                        icon: "plus" as SFSymbol,
                        onPress: () => timeline.createTimeline(),
                        position: "right",
                    },
                ]}
                shadow
            >
                <DatePicker
                    clear
                    mode="single"
                    placeholder={animatedTitle}
                    controlRef={datePickerRef}
                    dates={{ start: selectedDate, end: selectedDate }}
                    setDates={(d) => timeline.setSelected(moment(d.start).format("YYYY-MM-DD"))}
                />
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

            <TimelineContent
                switchView={timeline.switchView}
                setSwitchView={timeline.setSwitchView}
                selectedDate={timeline.selected}
                setSelected={timeline.setSelected}
                isSearchActive={isSearchActive}
                searchQuery={timeline.query}
                searchResults={(timeline.data?.occurrences as any[]) || []}
                dayContentPaddingTop={dayContentPaddingTop}
                compactContentPaddingTop={compactContentPaddingTop}
                headerHeight={headerHeight}
                scrollY={scrollY}
                onScroll={onScroll}
                onRefresh={onRefresh}
                refreshing={refreshing}
            />
        </View>
    )
}
