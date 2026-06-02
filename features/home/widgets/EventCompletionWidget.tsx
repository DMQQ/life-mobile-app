import { FONTS } from "@/constants/Fonts"
import Section from "@/components/ui/Section"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import { Feather } from "@expo/vector-icons"
import { gql, useQuery } from "@apollo/client"
import Color from "color"
import { LinearGradient } from "expo-linear-gradient"
import dayjs from "dayjs"
import { useMemo } from "react"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import { useNavigation } from "@react-navigation/native"

const COMPLETION_QUERY = gql`
    query EventCompletion($date: String, $endDate: String) {
        occurrences(date: $date, endDate: $endDate) {
            id
            date
            isCompleted
        }
    }
`

const DAYS = 14
const BAR_MAX = 52

export default function EventCompletionWidget() {
    const navigation = useNavigation<any>()

    const range = useMemo(
        () => ({
            date: dayjs().subtract(DAYS - 1, "day").format("YYYY-MM-DD"),
            endDate: dayjs().format("YYYY-MM-DD"),
        }),
        [],
    )

    const { data } = useQuery(COMPLETION_QUERY, { variables: range, fetchPolicy: "cache-and-network" })

    const days = useMemo(() => {
        const occurrences: { id: string; date: string; isCompleted: boolean }[] = data?.occurrences ?? []
        return Array.from({ length: DAYS }, (_, i) => {
            const date = dayjs().subtract(DAYS - 1 - i, "day")
            const dateStr = date.format("YYYY-MM-DD")
            const dayEvents = occurrences.filter((e) => e.date === dateStr)
            const total = dayEvents.length
            const completed = dayEvents.filter((e) => e.isCompleted).length
            return { date, dateStr, total, completed }
        })
    }, [data])

    const { totalCompleted, totalEvents, pct, streak } = useMemo(() => {
        const total = days.reduce((a, d) => a + d.total, 0)
        const completed = days.reduce((a, d) => a + d.completed, 0)
        let s = 0
        for (let i = days.length - 1; i >= 0; i--) {
            const d = days[i]
            if (d.total > 0 && d.completed === d.total) s++
            else break
        }
        return {
            totalCompleted: completed,
            totalEvents: total,
            pct: total > 0 ? Math.round((completed / total) * 100) : 0,
            streak: s,
        }
    }, [days])

    const pctColor = pct >= 80 ? Colors.positive : pct >= 50 ? Colors.warning : Colors.negative
    return (
        <Section
            title="Completion"
            headerRight={
                <TouchableOpacity onPress={() => navigation.navigate("TimelineScreens")} activeOpacity={0.65}>
                    <Feather name="chevron-right" size={14} color={Colors.text_dark} />
                </TouchableOpacity>
            }
        >
            <View style={s.card}>
                <View style={s.statsRow}>
                    <View style={s.statItem}>
                        <Text style={[s.statValue, { color: pctColor }]}>{pct}%</Text>
                        <Text variant="caption" style={s.statLabel}>done</Text>
                    </View>
                    <View style={s.statDivider} />
                    <View style={s.statItem}>
                        <Text style={s.statValue}>
                            {totalCompleted}
                            <Text style={s.statSub}>/{totalEvents}</Text>
                        </Text>
                        <Text variant="caption" style={s.statLabel}>events</Text>
                    </View>
                    {streak > 0 && (
                        <>
                            <View style={s.statDivider} />
                            <View style={s.statItem}>
                                <View style={s.streakRow}>
                                    <Text style={[s.statValue, { color: Colors.warning }]}>{streak}</Text>
                                    <Feather name="zap" size={11} color={Colors.warning} />
                                </View>
                                <Text variant="caption" style={s.statLabel}>streak</Text>
                            </View>
                        </>
                    )}
                </View>

                <View style={s.chartRow}>
                    {days.map((day) => {
                        const ratio = day.total > 0 ? day.completed / day.total : -1
                        const fillH = ratio >= 0 ? Math.max(ratio * BAR_MAX, ratio > 0 ? 6 : 0) : 0
                        const barColor =
                            ratio === 1
                                ? Colors.positive
                                : ratio >= 0.5
                                  ? Colors.secondary
                                  : ratio > 0
                                    ? Colors.warning
                                    : Colors.negative
                        const isToday = day.dateStr === dayjs().format("YYYY-MM-DD")

                        return (
                            <View key={day.dateStr} style={s.barCol}>
                                <View style={[s.barTrack, isToday && s.barTrackToday]}>
                                    {fillH > 0 ? (
                                        <LinearGradient
                                            colors={[barColor, Color(barColor).lighten(0.35).string()]}
                                            start={{ x: 0, y: 1 }}
                                            end={{ x: 0, y: 0 }}
                                            style={[s.barFill, { height: fillH }]}
                                        />
                                    ) : (
                                        <View style={s.noEventMark} />
                                    )}
                                </View>
                                <Text style={[s.barLabel, isToday && s.barLabelToday]}>
                                    {day.date.format("dd")[0]}
                                </Text>
                            </View>
                        )
                    })}
                </View>
            </View>
        </Section>
    )
}

const s = StyleSheet.create({
    card: {
        padding: 18,
        gap: 16,
        overflow: "hidden",
    },
    statsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    statItem: {
        alignItems: "center",
        gap: 2,
    },
    statValue: {
        fontSize: 22,
        fontFamily: FONTS.extrabold,
        color: Colors.foreground,
        letterSpacing: -0.5,
    },
    statSub: {
        fontSize: 14,
        fontFamily: FONTS.semibold,
        color: Colors.foreground_secondary,
        letterSpacing: 0,
    },
    statLabel: {
        color: Colors.foreground_secondary,
    },
    statDivider: {
        width: StyleSheet.hairlineWidth,
        height: 28,
        backgroundColor: "rgba(255,255,255,0.12)",
    },
    streakRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
    },
    chartRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 3,
    },
    barCol: {
        flex: 1,
        alignItems: "center",
        gap: 5,
    },
    barTrack: {
        width: "100%",
        height: BAR_MAX,
        borderRadius: 5,
        backgroundColor: "rgba(255,255,255,0.07)",
        justifyContent: "flex-end",
        overflow: "hidden",
    },
    barTrackToday: {
        backgroundColor: "rgba(255,255,255,0.13)",
    },
    barFill: {
        width: "100%",
        borderRadius: 5,
    },
    noEventMark: {
        width: "100%",
        height: 2,
        backgroundColor: "rgba(255,255,255,0.08)",
    },
    barLabel: {
        fontSize: 9,
        fontFamily: FONTS.semibold,
        color: Colors.foreground_secondary,
        textTransform: "uppercase",
    },
    barLabelToday: {
        color: Colors.secondary,
        fontFamily: FONTS.extrabold,
    },
})
