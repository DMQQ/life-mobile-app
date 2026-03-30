import Colors from "@/constants/Colors"
import { AntDesign } from "@expo/vector-icons"
import dayjs from "dayjs"
import { memo, useRef, useState } from "react"
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import {
    Calendar,
    CalendarProps,
    CalendarProvider,
    ExpandableCalendar,
    ExpandableCalendarProps,
} from "react-native-calendars"

function ThemedCalendar(props: CalendarProps) {
    return <Calendar {...props} theme={styles.calendar} style={[styles.calendarContainer, props.style]} />
}

export const ExpandableThemedCalendar = memo(function ExpandableThemedCalendar(
    props: ExpandableCalendarProps & { date?: string },
) {
    return (
        <CalendarProvider
            date={props.date || new Date().toISOString().split("T")[0]}
            style={{ backgroundColor: Colors.primary_light, borderRadius: 15 }}
        >
            <ExpandableCalendar
                closeOnDayPress={false}
                {...props}
                style={[styles.expandableContainer, props.style]}
                theme={styles.expandable}
            />
        </CalendarProvider>
    )
})

// Approximate heights from react-native-calendars defaults
const CAL_HEADER_H = 48
const CAL_DAY_NAMES_H = 30
const CAL_WEEK_ROW_H = 46
const WEEK_STRIP_H = 104

function getExpandedHeight(date: string): number {
    const d = dayjs(date)
    const firstDay = d.startOf("month").day() // 0 = Sunday
    const numWeeks = Math.ceil((d.daysInMonth() + firstDay) / 7)
    return CAL_HEADER_H + CAL_DAY_NAMES_H + numWeeks * CAL_WEEK_ROW_H + 12
}

function WeekStrip({ date }: { date: string }) {
    const d = dayjs(date)
    const start = d.startOf("week")
    const days = Array.from({ length: 7 }, (_, i) => start.add(i, "day"))
    const letters = ["S", "M", "T", "W", "T", "F", "S"]

    return (
        <View>
            <View style={weekStyles.header}>
                <Text style={weekStyles.month}>{d.format("MMMM")}</Text>
                <Text style={weekStyles.year}>{d.format("YYYY")}</Text>
            </View>
            <View style={weekStyles.row}>
                {days.map((day, i) => {
                    const isSelected = day.isSame(d, "day")
                    return (
                        <View key={i} style={weekStyles.col}>
                            <Text style={weekStyles.letter}>{letters[i]}</Text>
                            <View style={[weekStyles.circle, isSelected && weekStyles.selectedCircle]}>
                                <Text style={[weekStyles.num, isSelected && weekStyles.selectedNum]}>{day.date()}</Text>
                            </View>
                        </View>
                    )
                })}
            </View>
        </View>
    )
}

export const CollapsibleThemedCalendar = memo(function CollapsibleThemedCalendar({
    date,
    ...props
}: CalendarProps & { date: string }) {
    const [expanded, setExpanded] = useState(false)
    const expandedHeight = getExpandedHeight(date)

    const animHeight = useRef(new Animated.Value(WEEK_STRIP_H)).current
    const calendarOpacity = useRef(new Animated.Value(0)).current
    const weekOpacity = useRef(new Animated.Value(1)).current

    const toggle = () => {
        if (expanded) {
            Animated.parallel([
                Animated.spring(animHeight, { toValue: WEEK_STRIP_H, useNativeDriver: false, bounciness: 2 }),
                Animated.timing(calendarOpacity, { toValue: 0, duration: 120, useNativeDriver: true }),
                Animated.timing(weekOpacity, { toValue: 1, duration: 150, delay: 80, useNativeDriver: true }),
            ]).start(() => setExpanded(false))
        } else {
            setExpanded(true)
            Animated.parallel([
                Animated.spring(animHeight, { toValue: expandedHeight, useNativeDriver: false, bounciness: 2 }),
                Animated.timing(weekOpacity, { toValue: 0, duration: 100, useNativeDriver: true }),
                Animated.timing(calendarOpacity, { toValue: 1, duration: 180, delay: 80, useNativeDriver: true }),
            ]).start()
        }
    }

    return (
        <View style={[styles.collapsibleContainer]}>
            <Animated.View style={{ height: animHeight, overflow: "hidden" }}>
                {/* Week strip — fades out when expanded */}
                <Animated.View style={[StyleSheet.absoluteFill, { opacity: weekOpacity }]}>
                    <WeekStrip date={date} />
                </Animated.View>

                {/* Full calendar — fades in when expanded */}
                <Animated.View style={{ opacity: calendarOpacity }}>
                    <Calendar
                        {...props}
                        current={date}
                        theme={styles.expandable}
                        hideArrows
                        hideExtraDays
                        disableMonthChange
                    />
                </Animated.View>
            </Animated.View>

            <TouchableOpacity onPress={toggle} style={styles.knob} activeOpacity={0.7}>
                <AntDesign name={expanded ? "up" : "down"} size={11} color={Colors.text_dark} />
            </TouchableOpacity>
        </View>
    )
})

export default memo(ThemedCalendar)

const weekStyles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "baseline",
        gap: 6,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 5,
        marginBottom: 4,
    },
    month: {
        fontSize: 18,
        fontWeight: "700",
        color: Colors.secondary,
    },
    year: {
        fontSize: 13,
        fontWeight: "500",
        color: Colors.text_dark,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingTop: 6,
    },
    col: {
        alignItems: "center",
        gap: 4,
    },
    letter: {
        fontSize: 11,
        color: Colors.text_dark,
        fontWeight: "500",
    },
    circle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    selectedCircle: {
        backgroundColor: Colors.secondary,
    },
    num: {
        fontSize: 13,
        color: Colors.foreground,
        fontWeight: "500",
    },
    selectedNum: {
        color: "#fff",
        fontWeight: "700",
    },
})

const styles = StyleSheet.create({
    calendar: {
        backgroundColor: Colors.primary_light,
        calendarBackground: Colors.primary_light,
        dayTextColor: Colors.foreground,
        textDisabledColor: "#5e5e5e",
        monthTextColor: Colors.secondary,
        textMonthFontSize: 20,
        textMonthFontWeight: "bold",
        selectedDayBackgroundColor: Colors.secondary,
        arrowColor: Colors.secondary,
    },

    expandable: {
        backgroundColor: Colors.primary_light,
        calendarBackground: Colors.primary_light,
        dayTextColor: Colors.foreground,
        textSectionTitleColor: Colors.foreground,
        selectedDayBackgroundColor: Colors.secondary,
        selectedDayTextColor: "#fff",
        monthTextColor: Colors.secondary,
        arrowColor: Colors.secondary,
        "stylesheet.calendar.list": {
            container: { backgroundColor: Colors.primary_light },
        },
        "stylesheet.calendar.main": {
            container: { backgroundColor: Colors.primary_light },
        },
    },

    calendarContainer: { borderRadius: 15, paddingBottom: 5 },
    expandableContainer: { borderRadius: 15 },
    collapsibleContainer: {
        borderRadius: 15,
        backgroundColor: Colors.primary_light,
        overflow: "hidden",
    },
    knob: {
        alignItems: "center",
        paddingVertical: 7,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: "rgba(255,255,255,0.07)",
    },
})
