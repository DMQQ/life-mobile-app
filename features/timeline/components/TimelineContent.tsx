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
    filter: "all" | "active" | "completed"
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
    filter,
}: TimelineContentProps) {
    const renderItem = useCallback(({ item }: { item: any }): any => <TimelineItem {...item} location="timeline" />, [])

    const activeKey = isSearchActive ? "search" : switchView

    const onDayPress = useCallback((date: string) => {
        setSelected(date)
        setSwitchView("day")
    }, [])

    const filteredSearchResults = useMemo(() => {
        if (filter === "active") return searchResults.filter((e) => !e.isCompleted)
        if (filter === "completed") return searchResults.filter((e) => e.isCompleted)
        return searchResults
    }, [searchResults, filter])

    return (
        <Animated.View key={activeKey} entering={enterAnim} exiting={exitAnim} style={{ flex: 1 }}>
            {isSearchActive ? (
                <VirtualizedList
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListHeaderComponent={<View style={{ height: 10 }} />}
                    ListEmptyComponent={
                        <View style={{ flex: 1, height: 400, justifyContent: "center", alignItems: "center" }}>
                            <Feather name="search" size={50} color={Colors.text_dark} style={{ marginBottom: 15 }} />
                            <Text style={{ color: Colors.text_dark }}>
                                No events found for "{searchQuery}",{"\n"}try changing the phrase
                            </Text>
                        </View>
                    }
                    contentContainerStyle={{
                        paddingBottom: filteredSearchResults.length > 0 ? 120 : 0,
                        padding: 15,
                        paddingTop: headerHeight + 10,
                    }}
                    data={filteredSearchResults}
                    initialNumToRender={3}
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
                    filter={filter}
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
