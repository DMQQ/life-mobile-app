import Colors from "@/constants/Colors"
import moment from "moment"
import { memo, useCallback, useMemo, useRef, useEffect, useState } from "react"
import { ScrollViewProps, View } from "react-native"
import TimeTable from "react-native-calendar-timetable"
import Animated from "react-native-reanimated"
import DayTimelineItemWrapper from "./DayTimelineItemWrapper"
import Color from "color"

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

    const HOUR_HEIGHT = 150

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

    useEffect(() => {
        const timeout = setTimeout(() => {
            const isToday = moment(selected).isSame(moment(), "day")

            const currentHour = moment().hour()
            const targetHour = isToday ? currentHour : minHour !== Infinity ? minHour : 8

            scrollViewRef.current?.scrollTo({
                y: targetHour * HOUR_HEIGHT + headerHeight,
                animated: false,
            })
        }, 0)

        return () => clearTimeout(timeout)
    }, [selected, headerHeight, minHour])

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

    return (
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
                date={moment(selected).toDate()}
                stickyHours
                style={style}
                enableSnapping
                items={items as any}
                hourHeight={HOUR_HEIGHT}
                renderItem={renderItem}
                scrollViewProps={{
                    horizontal: false,
                }}
            />
            {items?.length > 0 && <View style={{ height: 120 }} />}
        </Animated.ScrollView>
    )
}

export default memo(CalendarTimetable)
