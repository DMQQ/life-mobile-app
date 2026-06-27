import Colors from "@/constants/Colors"
import { Feather } from "@expo/vector-icons"
import { useCallback, useMemo } from "react"
import { RefreshControl, View, VirtualizedList } from "react-native"
import Animated, { Keyframe, SharedValue, withTiming } from "react-native-reanimated"

const enterAnim = new Keyframe({
    0: { opacity: 0, transform: [{ scale: 0.93 }] },
    100: { opacity: 1, transform: [{ scale: 1 }] },
}).duration(150)

const exitAnim = new Keyframe({
    0: { opacity: 1, transform: [{ scale: 1 }] },
    100: { opacity: 0, transform: [{ scale: 0.96 }] },
}).duration(100)
import Text from "@/components/ui/Text/Text"
import TimelineItem from "./TimelineItem"
import DayView from "./DayView"
import WeekView from "./WeekView"
import MonthView from "./MonthView"
import { OccurrenceItem } from "../hooks/query/useGetOccurrencesQuery"
import { TimelineFilterState } from "../types"

interface TimelineContentProps {
    switchView: "day" | "week" | "month"
    setSwitchView: (v: "day" | "week" | "month") => void
    selectedDate: string
    setSelected: (date: string) => void
    isSearchActive: boolean
    searchQuery: string
    searchResults: OccurrenceItem[]
    dayContentPaddingTop: number
    compactContentPaddingTop: number
    headerHeight: number
    scrollY: SharedValue<number>
    onScroll: (...args: any[]) => void
    onRefresh: () => Promise<void>
    refreshing: boolean
    filters: TimelineFilterState
}

export default function TimelineContent({
    switchView,
    setSwitchView,
    selectedDate,
    setSelected,
    isSearchActive,
    searchQuery,
    searchResults,
    dayContentPaddingTop,
    compactContentPaddingTop,
    headerHeight,
    scrollY,
    onScroll,
    onRefresh,
    refreshing,
    filters,
}: TimelineContentProps) {
    const renderItem = useCallback(({ item }: { item: any }): any => <TimelineItem {...item} location="timeline" />, [])

    const isFilterMode = useMemo(
        () =>
            filters.status !== "all" ||
            !!filters.hoursFrom ||
            !!filters.hoursTo ||
            !!filters.searchText ||
            !!filters.dateFrom ||
            !!filters.dateTo,
        [filters],
    )

    const showList = isSearchActive || isFilterMode
    const activeKey = showList ? (isSearchActive ? "search" : "filter") : switchView

    const onDayPress = useCallback((date: string) => {
        setSelected(date)
        setSwitchView("day")
    }, [])

    return (
        <Animated.View key={activeKey} entering={enterAnim} exiting={exitAnim} style={{ flex: 1 }}>
            {showList ? (
                <VirtualizedList
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListHeaderComponent={<View style={{ height: 10 }} />}
                    ListEmptyComponent={
                        <View style={{ flex: 1, height: 400, justifyContent: "center", alignItems: "center" }}>
                            <Feather
                                name={isSearchActive ? "search" : "filter"}
                                size={50}
                                color={Colors.text_dark}
                                style={{ marginBottom: 15 }}
                            />
                            <Text style={{ color: Colors.text_dark, textAlign: "center" }}>
                                {isSearchActive
                                    ? `No events found for "${searchQuery}"`
                                    : "No events match the active filters"}
                            </Text>
                        </View>
                    }
                    contentContainerStyle={{
                        paddingBottom: searchResults.length > 0 ? 120 : 0,
                        padding: 15,
                        paddingTop: headerHeight + 10,
                    }}
                    data={searchResults}
                    initialNumToRender={3}
                    ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                    keyExtractor={(item: any) => item.id}
                    getItem={(data, index) => data[index] as OccurrenceItem}
                    getItemCount={(data) => data.length}
                    renderItem={renderItem}
                />
            ) : switchView === "day" ? (
                <DayView
                    selectedDate={selectedDate}
                    setSelected={(date) => {
                        setSelected(date)
                        scrollY.value = withTiming(0, { duration: 250 })
                    }}
                    contentPaddingTop={dayContentPaddingTop}
                    onScroll={onScroll}
                />
            ) : switchView === "month" ? (
                <MonthView
                    selectedDate={selectedDate}
                    setSelected={setSelected}
                    contentPaddingTop={compactContentPaddingTop}
                    onDayPress={onDayPress}
                />
            ) : (
                <WeekView
                    selectedDate={selectedDate}
                    setSelected={setSelected}
                    contentPaddingTop={compactContentPaddingTop}
                    onScroll={onScroll}
                    onDayPress={onDayPress}
                />
            )}
        </Animated.View>
    )
}
