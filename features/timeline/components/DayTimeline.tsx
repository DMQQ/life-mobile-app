import Colors, { secondary_candidates } from "@/constants/Colors"
import moment from "moment"
import { memo, useCallback, useMemo } from "react"
import { ScrollViewProps, View } from "react-native"
import TimeTable from "react-native-calendar-timetable"
import Animated from "react-native-reanimated"
import DayTimelineItemWrapper from "./DayTimelineItemWrapper"
import Text from "@/components/ui/Text/Text"
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

    onScroll: (event: any) => void

    onLongPress?: (event: TimelineEvent) => void

    /**
     * Header
     */
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
        [events],
    )

    const trimTime = (t: string, range = 2) => t.split(":").slice(0, range).join(":")

    const minHour = Math.min(...(events.map((v) => +trimTime(v.beginTime, 1)) || []))

    const maxHour = Math.max(...(events.map((v) => +trimTime(v.endTime, 1)) || []))

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
            keyboardDismissMode={"on-drag"}
            style={{ flex: 1, paddingBottom: items?.length > 0 ? 100 : 0, paddingTop: 300 }}
            onScroll={onScroll}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            {...listProps}
        >
            {children}
            <TimeTable
                fromHour={Math.max(minHour, 0)}
                toHour={Math.min(maxHour + 1, 24)}
                date={moment(selected).toDate()}
                stickyHours
                style={style}
                enableSnapping
                items={items as any}
                hourHeight={150}
                renderItem={renderItem}
            />
            {items?.length > 0 && <View style={{ height: 120 }} />}
        </Animated.ScrollView>
    )
}

export default memo(CalendarTimetable)
