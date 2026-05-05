import Header from "@/components/ui/Header/Header"
import DatePicker, { DatePickerRef } from "@/components/DatePicker"
import DateList from "@/components/DateList/DateList"
import Colors from "@/constants/Colors"
import { AntDesign } from "@expo/vector-icons"
import dayjs from "dayjs"
import moment from "moment"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { TouchableOpacity, View } from "react-native"
import { useScreenSearch } from "@/utils/hooks/useScreenSearch"
import { TimelineScreenLoader } from "../components/LoaderSkeleton"
import TimelineContent from "../components/TimelineContent"
import useTimeline from "../hooks/general/useTimeline"
import { TimelineScreenProps } from "../types"
import Text from "@/components/ui/Text/Text"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Animated, {
    useSharedValue,
    withTiming,
} from "react-native-reanimated"
import useTrackScroll from "@/utils/hooks/ui/useTrackScroll"
import Background from "@/components/ui/Background"

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
            return dayjs(timeline.selected).format("MMMM YYYY")
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
                containerStyle={{ justifyContent: "flex-end" }}
                animatedTitle={animatedTitle}
                onAnimatedTitlePress={() => datePickerRef.current?.open()}
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
                <DatePicker
                    controlRef={datePickerRef}
                    mode="single"
                    dates={{ start: selectedDate, end: selectedDate }}
                    setDates={(d) => timeline.setSelected(moment(d.start).format("YYYY-MM-DD"))}
                    buttonComponent={() => <View style={{ width: 0, height: 0 }} />}
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
