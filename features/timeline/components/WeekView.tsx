import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native"
import PagerView from "react-native-pager-view"
import moment from "moment"
import Feedback from "react-native-haptic-feedback"
import Animated from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Colors from "@/constants/Colors"
import Text from "@/components/ui/Text/Text"
import { navigationRef } from "@/navigation"
import { useWeekEvents } from "../hooks/query/useGetOccurrencesQuery"

const { width } = Dimensions.get("window")
const TIME_COL_W = 44
const DAY_COL_W = (width - TIME_COL_W) / 7
const HOUR_H = 56
const HOURS = Array.from({ length: 24 }, (_, i) => i)
const TODAY = moment().format("YYYY-MM-DD")
const TAB_BAR_H = 60

const EPOCH = moment().startOf("isoWeek")

function weekStartForPage(pageIndex: number) {
    return EPOCH.clone().add(pageIndex, "weeks").format("YYYY-MM-DD")
}

function pageForWeekStart(weekStart: string) {
    return moment(weekStart).startOf("isoWeek").diff(EPOCH, "weeks")
}

const WINDOW_SIZE = 3
const WINDOW_CENTER = Math.floor(WINDOW_SIZE / 2)

// ─── Week day header ──────────────────────────────────────────────────────────

interface WeekDayHeaderProps {
    weekStart: string
    selectedDate: string
    onDayPress: (date: string) => void
    paddingTop: number
}

const WeekDayHeader = memo(({ weekStart, selectedDate, onDayPress, paddingTop }: WeekDayHeaderProps) => {
    const days = Array.from({ length: 7 }, (_, i) => moment(weekStart).add(i, "days").format("YYYY-MM-DD"))
    return (
        <View style={[styles.weekHeader, { paddingTop: paddingTop + 10 }]}>
            <View style={{ width: TIME_COL_W }} />
            {days.map((date) => {
                const isSelected = date === selectedDate
                const isToday = date === TODAY
                return (
                    <TouchableOpacity
                        key={date}
                        onPress={() => onDayPress(date)}
                        style={[styles.dayHeaderCell, { width: DAY_COL_W }]}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.dayName, isToday && { color: Colors.secondary }]}>
                            {moment(date).format("dd")[0]}
                        </Text>
                        <View
                            style={[
                                styles.dayCircle,
                                isSelected && { backgroundColor: Colors.secondary },
                                isToday && !isSelected && { borderWidth: 1.5, borderColor: Colors.secondary },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.dayNumberText,
                                    isToday && !isSelected && { color: Colors.secondary },
                                    isSelected && { color: Colors.foreground },
                                ]}
                            >
                                {moment(date).format("D")}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )
            })}
        </View>
    )
})

// ─── Single week page ─────────────────────────────────────────────────────────

interface WeekPageProps {
    weekStart: string
    selectedDate: string
    onDayPress: (date: string) => void
    onScroll?: (...args: any[]) => void
    bottomPad: number
}

const WeekPage = memo(({ weekStart, selectedDate, onDayPress, onScroll, bottomPad }: WeekPageProps) => {
    const days = useMemo(
        () => Array.from({ length: 7 }, (_, i) => moment(weekStart).add(i, "days").format("YYYY-MM-DD")),
        [weekStart],
    )
    const dayData = useWeekEvents(days)
    const nowH = moment().hour()
    const nowM = moment().minute()
    const nowTop = nowH * HOUR_H + (nowM / 60) * HOUR_H
    const scrollRef = useRef<Animated.ScrollView>(null)

    useEffect(() => {
        const timeout = setTimeout(() => {
            const isCurrentWeek = days.includes(TODAY)
            const targetH = isCurrentWeek ? Math.max(0, nowH - 1) : 7
            scrollRef.current?.scrollTo({ y: targetH * HOUR_H, animated: false })
        }, 50)
        return () => clearTimeout(timeout)
    }, [weekStart])

    return (
        <Animated.ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={onScroll}
            contentContainerStyle={{ paddingBottom: bottomPad }}
            overScrollMode={"never"}
            bounces={false}
        >
            <View style={{ position: "relative" }}>
                <View style={{ flexDirection: "row" }}>
                    {/* Time gutter */}
                    <View style={{ width: TIME_COL_W, backgroundColor: Colors.primary, zIndex: 100 }}>
                        {HOURS.map((h) => (
                            <View key={h} style={styles.hourGutterCell}>
                                {h > 0 && <Text style={styles.timeLabel}>{`${String(h).padStart(2, "0")}:00`}</Text>}
                            </View>
                        ))}
                    </View>

                    {/* Day columns */}
                    {dayData.map(({ date, events }) => {
                        const isSelected = date === selectedDate

                        return (
                            <TouchableOpacity
                                key={date}
                                activeOpacity={1}
                                onPress={() => onDayPress(date)}
                                style={{ width: DAY_COL_W }}
                            >
                                <View style={styles.dayColumnContent}>
                                    {HOURS.map((h) => (
                                        <View key={h} style={[styles.hourLine, { top: h * HOUR_H }]} />
                                    ))}

                                    {isSelected && (
                                        <View
                                            style={[
                                                StyleSheet.absoluteFill,
                                                { backgroundColor: Colors.primary_lighter },
                                            ]}
                                        />
                                    )}

                                    {events.map((event) => {
                                        const [sh = 8, sm = 0] = (event.beginTime ?? "08:00").split(":").map(Number)
                                        const [eh = sh + 1, em = 0] = (event.endTime ?? "09:00").split(":").map(Number)
                                        const top = sh * HOUR_H + (sm / 60) * HOUR_H + 1
                                        const durationMin = eh * 60 + em - (sh * 60 + sm)
                                        const height = Math.max(18, (durationMin / 60) * HOUR_H - 2)

                                        return (
                                            <TouchableOpacity
                                                key={event.id}
                                                activeOpacity={0.8}
                                                onPress={() =>
                                                    navigationRef.current?.navigate("TimelineScreens", {
                                                        screen: "TimelineDetails",
                                                        params: { timelineId: event.id },
                                                    } as any)
                                                }
                                                style={[
                                                    styles.eventBlock,
                                                    {
                                                        top,
                                                        height,
                                                        backgroundColor: event.isCompleted
                                                            ? "#34C759CC"
                                                            : Colors.secondary + "DD",
                                                    },
                                                ]}
                                            >
                                                <Text numberOfLines={1} style={styles.eventTitle}>
                                                    {event.title}
                                                </Text>
                                                {height > 30 && <Text style={styles.eventTime}>{event.beginTime}</Text>}
                                            </TouchableOpacity>
                                        )
                                    })}
                                </View>
                            </TouchableOpacity>
                        )
                    })}
                </View>

                {/* Screen-wide now line — only on week containing today */}
                {days.includes(TODAY) && (
                    <View pointerEvents="none" style={[styles.nowLine, { top: nowTop }]}>
                        <View style={styles.nowDot} />
                    </View>
                )}
            </View>
        </Animated.ScrollView>
    )
})

// ─── Week view ────────────────────────────────────────────────────────────────

interface WeekViewProps {
    selectedDate: string
    setSelected: (date: string) => void
    contentPaddingTop: number
    onScroll?: (...args: any[]) => void
    onDayPress?: (date: string) => void
}

export default function WeekView({ selectedDate, setSelected, contentPaddingTop, onScroll, onDayPress }: WeekViewProps) {
    const { bottom } = useSafeAreaInsets()
    const pagerRef = useRef<PagerView>(null)
    const currentWeekStart = moment(selectedDate).startOf("isoWeek").format("YYYY-MM-DD")
    const targetGlobalPage = pageForWeekStart(currentWeekStart)
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

            const weekStart = weekStartForPage(globalPage)
            Feedback.trigger("impactLight")
            const dayOfWeek = moment(selectedDate).isoWeekday() - 1
            const newDate = moment(weekStart).add(dayOfWeek, "days").format("YYYY-MM-DD")

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

    const bottomPad = TAB_BAR_H + bottom + 20

    return (
        <View style={{ flex: 1 }}>
            <WeekDayHeader
                weekStart={currentWeekStart}
                selectedDate={selectedDate}
                onDayPress={onDayPress ?? setSelected}
                paddingTop={contentPaddingTop}
            />
            <PagerView
                key={pagerKey}
                ref={pagerRef}
                style={{ flex: 1 }}
                initialPage={initialLocalPage}
                offscreenPageLimit={2}
                onPageSelected={handlePageSelected}
            >
                {pages.map((globalPage) => (
                    <View key={`w${globalPage}`} style={{ flex: 1 }}>
                        <WeekPage
                            weekStart={weekStartForPage(globalPage)}
                            selectedDate={selectedDate}
                            onDayPress={onDayPress ?? setSelected}
                            onScroll={onScroll}
                            bottomPad={bottomPad}
                        />
                    </View>
                ))}
            </PagerView>
        </View>
    )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    weekHeader: {
        flexDirection: "row",
        backgroundColor: Colors.primary + "F2",
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: "rgba(255,255,255,0.15)",
        paddingBottom: 8,
    },
    dayHeaderCell: {
        alignItems: "center",
        gap: 4,
    },
    dayName: {
        fontSize: 11,
        fontWeight: "600",
        color: Colors.text_dark,
        letterSpacing: 0.5,
    },
    dayCircle: {
        width: 26,
        height: 26,
        borderRadius: 13,
        alignItems: "center",
        justifyContent: "center",
    },
    dayNumberText: {
        fontSize: 13,
        fontWeight: "600",
        color: Colors.foreground,
    },
    hourGutterCell: {
        height: HOUR_H,
        alignItems: "flex-end",
        paddingRight: 6,
        paddingTop: 2,
    },
    timeLabel: {
        fontSize: 10,
        color: Colors.foreground_secondary,
        fontWeight: "700",
    },
    dayColumnContent: {
        position: "relative",
        height: 24 * HOUR_H,
        borderLeftWidth: StyleSheet.hairlineWidth,
        borderColor: "rgba(255,255,255,0.15)",
    },
    hourLine: {
        position: "absolute",
        left: 0,
        right: 0,
        height: StyleSheet.hairlineWidth,
        backgroundColor: "rgba(255,255,255,0.15)",
    },
    nowLine: {
        position: "absolute",
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: Colors.secondary,
        zIndex: 20,
        flexDirection: "row",
        alignItems: "center",
    },
    nowDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.secondary,
        marginLeft: TIME_COL_W - 4,
        marginTop: -3,
    },
    eventBlock: {
        position: "absolute",
        left: 1,
        right: 1,
        borderRadius: 4,
        paddingHorizontal: 3,
        paddingVertical: 2,
        overflow: "hidden",
        zIndex: 5,
    },
    eventTitle: {
        fontSize: 9,
        fontWeight: "700",
        color: Colors.foreground,
    },
    eventTime: {
        fontSize: 8,
        color: Colors.foreground_secondary,
        marginTop: 1,
    },
})
