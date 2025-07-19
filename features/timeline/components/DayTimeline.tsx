import Colors, { secondary_candidates } from "@/constants/Colors"
import Color from "color"
import moment from "moment"
import { useMemo } from "react"
import { View } from "react-native"
import TimeTable from "react-native-calendar-timetable"
import Animated from "react-native-reanimated"
import DayTimelineItem from "./DayTimelineItem"

interface TimelineEvent {
    id: string
    title: string
    description: string
    beginTime: string
    endTime: string
    date: string
    isCompleted: boolean
}

interface CustomTimelineProps {
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

const CalendarTimetable = ({ events, selected, onScroll, onLongPress, children }: CustomTimelineProps) => {
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

    if (items?.length === 0) return <View style={{ paddingTop: 215, flex: 1 }}>{children}</View>

    return (
        <Animated.ScrollView
            keyboardDismissMode={"on-drag"}
            style={{ flex: 1, paddingBottom: items?.length > 0 ? 100 : 0, paddingTop: 215 }}
            onScroll={onScroll}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            bounces={items.length > 4}
            overScrollMode={items.length > 4 ? "always" : "never"}
        >
            {children}
            <TimeTable
                fromHour={Math.max(minHour, 0)}
                toHour={Math.min(maxHour + 2, 24)}
                date={moment(selected).toDate()}
                stickyHours
                style={{
                    container: {
                        backgroundColor: Colors.primary,
                        flex: 1,
                    },
                    time: {
                        color: "#fff",
                        fontSize: 15,
                    },
                    timeContainer: {
                        backgroundColor: Colors.ternary,
                        borderRadius: 5,
                        padding: 5,
                        zIndex: 100,
                    },
                    lines: {
                        borderColor: Color("#fff").darken(0.8).string(),
                    },

                    nowLine: {
                        line: {
                            backgroundColor: "red",
                        },
                        dot: {
                            backgroundColor: "red",
                        },
                    },
                }}
                enableSnapping
                items={items as any}
                hourHeight={150}
                renderItem={(props) => {
                    const backgroundColor = secondary_candidates[props.item.id % secondary_candidates.length]

                    const textColor = "#fff"

                    return (
                        <View
                            key={props.key}
                            style={[
                                props.style,
                                {
                                    backgroundColor: backgroundColor,
                                    borderRadius: 5,
                                    overflow: "hidden",
                                    width: props.style.width - 25,
                                },
                                props.item.timeline.isCompleted && {
                                    opacity: 0.5,
                                },
                            ]}
                        >
                            <DayTimelineItem
                                {...props.item.timeline}
                                location="timeline"
                                textColor={textColor}
                                styles={{
                                    padding: 5,
                                    paddingHorizontal: 10,
                                    flex: 1,
                                    alignItems: "flex-start",
                                }}
                                isSmall={props.style.height < 100}
                                onLongPress={() => onLongPress?.(props.item.timeline)}
                            />
                        </View>
                    )
                }}
            />
            {items?.length > 0 && <View style={{ height: 120 }} />}
        </Animated.ScrollView>
    )
}

export default CalendarTimetable
