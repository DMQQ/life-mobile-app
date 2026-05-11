import Colors from "@/constants/Colors"
import moment from "moment"
import { memo, useCallback, useMemo, useRef, useEffect, useState } from "react"
import { ScrollViewProps, View } from "react-native"
import TimeTable from "react-native-calendar-timetable"
import Animated, { useSharedValue } from "react-native-reanimated"
import DayTimelineItemWrapper from "./DayTimelineItemWrapper"
import Color from "color"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import { runOnJS } from "react-native-worklets"
import dayjs from "dayjs"

interface TimelineEvent {
    id: string
    title: string
    description: string
    beginTime: string
    endTime: string
    date: string
    isCompleted: boolean
}

interface CustomTimelineProps extends Partial<ScrollViewProps> {
    events: TimelineEvent[]
    date: string
    theme: any
    onEventPress?: (event: TimelineEvent) => void

    selected: string

    onScroll?: (event: any) => void

    onLongPress?: (event: TimelineEvent) => void

    children?: React.ReactNode
}

const CalendarTimetable = ({
    events,
    selected,
    onScroll,
    onLongPress,
    children,
    ...listProps
}: CustomTimelineProps) => {
    const scrollViewRef = useRef<Animated.ScrollView>(null)
    const [headerHeight, setHeaderHeight] = useState(0)
    const [hourHeight, setHourHeight] = useState(60)
    const hourHeightShared = useSharedValue(60)
    const hourHeightBase = useSharedValue(60)

    const items = useMemo(
        () =>
            events.map((t, index) => ({
                title: t.title,
                startDate: moment(selected + "T" + t.beginTime)
                    .add(1, "minute")
                    .startOf("minute")
                    .toDate(),
                endDate: moment(selected + "T" + t.endTime)
                    .startOf("minute")
                    .subtract(1, "minute")
                    .toDate(),
                timeline: t,
                id: index,
            })),
        [events, selected],
    )

    const trimTime = (t: string, range = 2) => t.split(":").slice(0, range).join(":")

    const minHour = Math.min(...(events.map((v) => +trimTime(v.beginTime, 1)) || []))

    const scrollToCurrentHour = useCallback(() => {
        console.log("Scrolling to current hour, minHour:", minHour)
        const isToday = moment(selected).isSame(moment(), "day")

        const currentHour = moment().hour()
        const targetHour = isToday ? currentHour : minHour !== Infinity ? minHour : 8

        scrollViewRef.current?.scrollTo({
            y: targetHour * hourHeight + headerHeight,
            animated: false,
        })
    }, [selected, headerHeight, minHour, hourHeight])

    useEffect(() => {
        const timeout = setTimeout(scrollToCurrentHour, 0)

        return () => clearTimeout(timeout)
    }, [scrollToCurrentHour])

    const renderItem = useCallback(
        (props: any) => {
            return (
                <DayTimelineItemWrapper
                    key={props.item.id}
                    item={props.item}
                    style={props.style}
                    onLongPress={onLongPress}
                />
            )
        },
        [onLongPress],
    )

    const style = useMemo(
        () => ({
            container: {
                backgroundColor: Colors.primary,
                flex: 1,
            },
            time: {
                color: Color(Colors.primary_lighter).lighten(5).toString(),
                fontSize: 16,
            },
            timeContainer: {
                backgroundColor: Colors.primary_dark,
                zIndex: 100,
            },
            lines: {
                borderColor: Color(Colors.primary).lighten(2).toString(),
            },
            nowLine: {
                line: {
                    backgroundColor: Colors.secondary,
                    height: 2,
                },
                dot: {
                    backgroundColor: Colors.secondary,
                },
            },
        }),
        [],
    )

    const updateHourHeight = useCallback((val: number) => {
        hourHeightShared.value = val
        setHourHeight(val)
    }, [])

    const gesture = Gesture.Pinch()
        .onStart(() => {
            hourHeightBase.value = hourHeightShared.value
        })
        .onChange((event) => {
            const next = Math.max(60, Math.min(200, hourHeightBase.value * event.scale))
            runOnJS(updateHourHeight)(next)
        })

    return (
        <GestureDetector gesture={gesture}>
            <Animated.ScrollView
                ref={scrollViewRef}
                keyboardDismissMode={"on-drag"}
                style={{ flex: 1, paddingBottom: items?.length > 0 ? 100 : 0, backgroundColor: "transparent" }}
                onScroll={onScroll}
                showsVerticalScrollIndicator={false}
                overScrollMode={"never"}
                bounces={false}
                {...listProps}
            >
                <View onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}>{children}</View>

                <TimeTable
                    date={dayjs(selected).toDate()}
                    stickyHours
                    style={style}
                    enableSnapping
                    items={items as any}
                    hourHeight={hourHeight}
                    renderItem={renderItem}
                    scrollViewProps={{
                        horizontal: false,
                    }}
                />
                {items?.length > 0 && <View style={{ height: 120 }} />}
            </Animated.ScrollView>
        </GestureDetector>
    )
}

export default memo(CalendarTimetable)
