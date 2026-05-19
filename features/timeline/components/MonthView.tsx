import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import PagerView from "react-native-pager-view"
import moment from "moment"
import Feedback from "react-native-haptic-feedback"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Colors from "@/constants/Colors"
import Text from "@/components/ui/Text/Text"
import { useRangeEvents, CalendarOccurrenceItem } from "../hooks/query/useGetOccurrencesQuery"
import { navigationRef } from "@/navigation/ref"
import { useNavigation } from "@react-navigation/native"

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const TODAY = moment().format("YYYY-MM-DD")
const TAB_BAR_H = 60

const EPOCH = moment().startOf("month")

function monthStartForPage(pageIndex: number) {
    return EPOCH.clone().add(pageIndex, "months").format("YYYY-MM-DD")
}

function pageForMonthStart(monthStart: string) {
    return moment(monthStart).startOf("month").diff(EPOCH, "months")
}

const WINDOW_SIZE = 3
const WINDOW_CENTER = Math.floor(WINDOW_SIZE / 2)

function getMonthWeeks(monthStart: string): string[][] {
    const start = moment(monthStart).startOf("month").startOf("week")
    const end = moment(monthStart).endOf("month").endOf("week")
    const weeks: string[][] = []
    const current = start.clone()
    while (current.isSameOrBefore(end, "day")) {
        const week: string[] = []
        for (let i = 0; i < 7; i++) {
            week.push(current.format("YYYY-MM-DD"))
            current.add(1, "day")
        }
        weeks.push(week)
    }
    return weeks
}

type DayData = { date: string; events: CalendarOccurrenceItem[] }

interface WeekRowProps {
    dayData: DayData[]
    selectedDate: string
    currentMonth: string
    onDayPress: (date: string) => void
}

const WeekRow = memo(({ dayData, selectedDate, currentMonth, onDayPress }: WeekRowProps) => {
    const navigation = useNavigation<any>()

    return (
        <View style={styles.weekRow}>
            {dayData.map(({ date, events }) => {
                const isSelected = date === selectedDate
                const isToday = date === TODAY
                const isCurrentMonth = moment(date).format("YYYY-MM") === currentMonth

                return (
                    <TouchableOpacity
                        key={date}
                        onPress={() => onDayPress(date)}
                        onLongPress={() =>
                            navigation.navigate("TimelineCreate", {
                                selectedDate: date,
                            })
                        }
                        activeOpacity={0.7}
                        style={[
                            styles.dayCell,
                            !isCurrentMonth && { backgroundColor: Colors.primary_dark },
                            isSelected && {
                                backgroundColor: Colors.primary_lighter,
                                borderWidth: 1,
                                borderColor: Colors.borderColor,
                            },
                        ]}
                    >
                        <View
                            style={[
                                styles.dayNumberWrap,
                                isSelected && { backgroundColor: Colors.secondary },
                                isToday && !isSelected && { borderWidth: 1.5, borderColor: Colors.secondary },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.dayNumber,
                                    !isCurrentMonth && { color: Colors.text_dark },
                                    isToday && !isSelected && { color: Colors.secondary },
                                    isSelected && { color: Colors.foreground },
                                ]}
                            >
                                {moment(date).format("D")}
                            </Text>
                        </View>

                        <View style={{ marginTop: 4, width: "100%", gap: 2 }}>
                            {events.slice(0, 4).map((event) => (
                                <TouchableOpacity
                                    key={event.id}
                                    onPress={() =>
                                        navigationRef.current?.navigate("TimelineScreens", {
                                            screen: "TimelineDetails",
                                            params: { timelineId: event.id },
                                        } as any)
                                    }
                                    style={[
                                        styles.eventChip,
                                        { backgroundColor: event.isCompleted ? "#34C759" : Colors.secondary },
                                    ]}
                                >
                                    <Text numberOfLines={1} style={styles.eventChipText}>
                                        {event.title}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {events.length > 4 && <Text style={styles.moreText}>+{events.length - 4}</Text>}
                    </TouchableOpacity>
                )
            })}
        </View>
    )
})

interface MonthPageProps {
    monthStart: string
    selectedDate: string
    onDayPress: (date: string) => void
}

const MonthPage = memo(({ monthStart, selectedDate, onDayPress }: MonthPageProps) => {
    const currentMonth = moment(monthStart).format("YYYY-MM")
    const weeks = useMemo(() => getMonthWeeks(monthStart), [monthStart])

    const firstDay = weeks[0][0]
    const lastDay = weeks[weeks.length - 1][6]
    const allEvents = useRangeEvents(firstDay, lastDay)

    const weeksWithData = useMemo(
        () =>
            weeks.map((week) =>
                week.map((date) => ({
                    date,
                    events: allEvents.filter((e) => e.date === date),
                })),
            ),
        [weeks, allEvents],
    )

    return (
        <View style={{ flex: 1 }}>
            {weeksWithData.map((dayData) => (
                <WeekRow
                    key={dayData[0].date}
                    dayData={dayData}
                    selectedDate={selectedDate}
                    currentMonth={currentMonth}
                    onDayPress={onDayPress}
                />
            ))}
        </View>
    )
})

interface MonthViewProps {
    selectedDate: string
    setSelected: (date: string) => void
    contentPaddingTop: number
    onDayPress: (date: string) => void
}

export default function MonthView({ selectedDate, setSelected, contentPaddingTop, onDayPress }: MonthViewProps) {
    const { bottom } = useSafeAreaInsets()
    const pagerRef = useRef<PagerView>(null)
    const currentMonthStart = moment(selectedDate).startOf("month").format("YYYY-MM-DD")
    const targetGlobalPage = pageForMonthStart(currentMonthStart)
    const lastGlobalPageRef = useRef(targetGlobalPage)

    const [basePage, setBasePage] = useState(targetGlobalPage - WINDOW_CENTER)
    const [initialLocalPage, setInitialLocalPage] = useState(WINDOW_CENTER)
    const [pagerKey, setPagerKey] = useState(0)

    const pages = useMemo(() => Array.from({ length: WINDOW_SIZE }, (_, i) => basePage + i), [basePage])

    useEffect(() => {
        const localPos = targetGlobalPage - basePage
        if (localPos >= 0 && localPos < WINDOW_SIZE) {
            lastGlobalPageRef.current = targetGlobalPage
            pagerRef.current?.setPageWithoutAnimation(localPos)
        } else {
            lastGlobalPageRef.current = targetGlobalPage
            setBasePage(targetGlobalPage - WINDOW_CENTER)
            setInitialLocalPage(WINDOW_CENTER)
            setPagerKey((k) => k + 1)
        }
    }, [targetGlobalPage])

    const handlePageSelected = useCallback(
        (e: any) => {
            const pos = e.nativeEvent.position
            const globalPage = basePage + pos
            if (globalPage === lastGlobalPageRef.current) return
            lastGlobalPageRef.current = globalPage

            const monthStart = monthStartForPage(globalPage)
            Feedback.trigger("impactLight")
            const dayOfMonth = moment(selectedDate).date()
            const daysInNewMonth = moment(monthStart).daysInMonth()
            const newDate = moment(monthStart).date(Math.min(dayOfMonth, daysInNewMonth)).format("YYYY-MM-DD")

            if (pos <= 1) {
                setBasePage((prev) => prev - WINDOW_CENTER)
                setInitialLocalPage(pos + WINDOW_CENTER)
                setPagerKey((k) => k + 1)
            } else if (pos >= WINDOW_SIZE - 2) {
                setBasePage((prev) => prev + WINDOW_CENTER)
                setInitialLocalPage(pos - WINDOW_CENTER)
                setPagerKey((k) => k + 1)
            }

            setSelected(newDate)
        },
        [basePage, selectedDate, setSelected],
    )

    return (
        <View style={[styles.container, { paddingTop: contentPaddingTop + 10, paddingBottom: TAB_BAR_H + bottom }]}>
            <View style={styles.dayNamesRow}>
                {DAY_NAMES.map((name) => (
                    <Text key={name} style={styles.dayNameText}>
                        {name}
                    </Text>
                ))}
            </View>

            <PagerView
                key={pagerKey}
                ref={pagerRef}
                style={{ flex: 1 }}
                initialPage={initialLocalPage}
                offscreenPageLimit={2}
                onPageSelected={handlePageSelected}
            >
                {pages.map((globalPage) => (
                    <View key={`m${globalPage}`} style={{ flex: 1 }}>
                        <MonthPage
                            monthStart={monthStartForPage(globalPage)}
                            selectedDate={selectedDate}
                            onDayPress={onDayPress}
                        />
                    </View>
                ))}
            </PagerView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    dayNamesRow: {
        flexDirection: "row",
        paddingVertical: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: "rgba(255,255,255,0.07)",
    },
    dayNameText: {
        flex: 1,
        textAlign: "center",
        fontSize: 11,
        fontWeight: "600",
        color: Colors.text_dark,
    },
    weekRow: {
        flex: 1,
        flexDirection: "row",
        borderTopWidth: StyleSheet.hairlineWidth,
        borderColor: "rgba(255,255,255,0.07)",
    },
    dayCell: {
        flex: 1,
        borderRightWidth: StyleSheet.hairlineWidth,
        borderColor: "transparent",
        overflow: "hidden",
        alignItems: "center",
        paddingVertical: 5,
        padding: 2,
        borderRadius: 10,
        borderWidth: 1,
    },
    dayNumberWrap: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 5,
        marginBottom: 5,
    },
    dayNumber: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.foreground,
    },
    eventChip: {
        borderRadius: 5,
        paddingHorizontal: 3,
        paddingVertical: 1.5,
        width: "100%",
    },
    eventChipText: {
        fontSize: 9,
        fontWeight: "600",
        color: Colors.foreground,
    },
    moreText: {
        fontSize: 9,
        color: Colors.text_dark,
        paddingHorizontal: 4,
        marginTop: 1,
    },
})
