import Section from "@/components/ui/Section"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import TimelineItem from "@/features/timeline/components/TimelineItem"
import { useWeekEvents } from "@/features/timeline/hooks/query/useGetOccurrencesQuery"
import { Feather } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import Color from "color"
import dayjs from "dayjs"
import { useMemo } from "react"
import { StyleSheet, TouchableOpacity, View } from "react-native"

export default function EventsCalendarWidget() {
    const navigation = useNavigation<any>()

    const weekDays = useMemo(() => {
        const start = dayjs().startOf("week")
        return Array.from({ length: 7 }, (_, i) => start.add(i, "day").format("YYYY-MM-DD"))
    }, [])

    const dayData = useWeekEvents(weekDays)
    const today = dayjs().format("YYYY-MM-DD")
    const todayEvents = dayData.find((d) => d.date === today)?.events ?? []

    return (
        <Section title="Week">
            <View style={s.card}>
                <View style={s.weekRow}>
                    {dayData.map(({ date, events }) => {
                        const isToday = date === today
                        const d = dayjs(date)
                        return (
                            <TouchableOpacity
                                key={date}
                                style={[s.dayTile, isToday && s.todayTile]}
                                onPress={() =>
                                    navigation.navigate("TimelineScreens", {
                                        screen: "Timeline",
                                        params: { date },
                                    })
                                }
                                activeOpacity={0.65}
                            >
                                <Text style={[s.dayLetter, isToday && s.todayText]}>{d.format("dd")[0]}</Text>
                                <Text style={[s.dayNum, isToday && s.todayText]}>{d.format("D")}</Text>
                                <View style={s.dotRow}>
                                    {events.length > 0 ? (
                                        events.slice(0, 3).map((e) => (
                                            <View
                                                key={e.id}
                                                style={[
                                                    s.dot,
                                                    {
                                                        backgroundColor: e.isCompleted
                                                            ? Colors.positive
                                                            : Colors.secondary,
                                                    },
                                                ]}
                                            />
                                        ))
                                    ) : (
                                        <View style={s.dotEmpty} />
                                    )}
                                </View>
                            </TouchableOpacity>
                        )
                    })}
                </View>

                <View style={s.separator} />

                {todayEvents.length === 0 ? (
                    <TouchableOpacity
                        style={s.emptyRow}
                        onPress={() => navigation.navigate("TimelineScreens")}
                        activeOpacity={0.65}
                    >
                        <Text variant="caption" style={s.emptyText}>
                            Nothing scheduled today
                        </Text>
                        <Feather name="chevron-right" size={13} color={Colors.text_dark} />
                    </TouchableOpacity>
                ) : (
                    <View style={s.eventList}>
                        {todayEvents.slice(0, 3).map((event, i) => (
                            <TimelineItem
                                styles={{
                                    borderWidth: 0,
                                    borderBottomWidth: todayEvents.slice(0, 3).length - 1 === i ? 0 : 1,
                                    paddingVertical: 15,
                                    paddingHorizontal: 0,
                                }}
                                {...(event as any)}
                            />
                        ))}
                    </View>
                )}
            </View>
        </Section>
    )
}

const s = StyleSheet.create({
    card: {
        padding: 14,
    },
    weekRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingBottom: 12,
    },
    dayTile: {
        flex: 1,
        alignItems: "center",
        gap: 3,
        paddingVertical: 6,
        borderRadius: 10,
    },
    todayTile: {
        backgroundColor: Color(Colors.secondary).alpha(0.1).string(),
    },
    dayLetter: {
        fontSize: 10,
        fontWeight: "600",
        color: Colors.text_dark,
        textTransform: "uppercase",
    },
    dayNum: {
        fontSize: 13,
        fontWeight: "600",
        color: Colors.foreground_secondary,
    },
    todayText: {
        color: Colors.secondary,
        fontWeight: "700",
    },
    dotRow: {
        flexDirection: "row",
        gap: 2,
        height: 5,
        alignItems: "center",
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
    },
    dotEmpty: {
        width: 4,
        height: 4,
    },
    separator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: "rgba(255,255,255,0.07)",
        marginBottom: 10,
    },
    emptyRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 10,
    },
    emptyText: {
        color: Colors.text_dark,
    },
    eventList: {},
    eventRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 8,
    },
    eventBorder: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "rgba(255,255,255,0.07)",
    },
    eventAccent: {
        width: 3,
        height: 22,
        borderRadius: 2,
    },
    eventTitle: {
        flex: 1,
        color: Colors.text_light,
    },
    eventTime: {
        color: Colors.text_dark,
    },
})
