import Section from "@/components/ui/Section"
import Text from "@/components/ui/Text/Text"
import Colors, { secondary_candidates } from "@/constants/Colors"
import { GET_GOALS, useUpsertGoalEntry } from "@/features/goals/hooks/hooks"
import { Feather } from "@expo/vector-icons"
import { useQuery } from "@apollo/client"
import { useNavigation } from "@react-navigation/native"
import Color from "color"
import dayjs from "dayjs"
import { useCallback, useEffect, useMemo, useState } from "react"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import Feedback from "react-native-haptic-feedback"

export default function GoalsGridWidget() {
    const navigation = useNavigation<any>()
    const { data } = useQuery(GET_GOALS)
    const goals = data?.goals ?? []

    const weekDays = useMemo(() => {
        const start = dayjs().startOf("week")
        return Array.from({ length: 7 }, (_, i) => start.add(i, "day"))
    }, [])

    const today = dayjs().format("YYYY-MM-DD")

    if (!goals.length) return null

    return (
        <Section
            title="Goals"
            headerRight={
                <TouchableOpacity onPress={() => navigation.navigate("GoalsScreens")} activeOpacity={0.65}>
                    <Feather name="chevron-right" size={14} color={Colors.text_dark} />
                </TouchableOpacity>
            }
        >
            <View style={s.card}>
                <View style={s.headerRow}>
                    <View style={s.iconPH} />
                    {weekDays.map((day) => (
                        <Text
                            key={day.format("D")}
                            style={[s.dayLabel, day.format("YYYY-MM-DD") === today && s.todayLabel]}
                        >
                            {day.format("dd")[0]}
                        </Text>
                    ))}
                </View>

                {goals.slice(0, 5).map((goal: any, idx: number) => (
                    <GoalRow
                        key={goal.id}
                        goal={goal}
                        weekDays={weekDays}
                        today={today}
                        color={secondary_candidates[idx % secondary_candidates.length]}
                        isLast={idx === Math.min(goals.length, 5) - 1}
                    />
                ))}
            </View>
        </Section>
    )
}

function GoalRow({
    goal,
    weekDays,
    today,
    color,
    isLast,
}: {
    goal: any
    weekDays: dayjs.Dayjs[]
    today: string
    color: string
    isLast: boolean
}) {
    const [update] = useUpsertGoalEntry()
    const [localDeltas, setLocalDeltas] = useState<Record<string, number>>({})

    const entryMap = useMemo(() => {
        const map: Record<string, number> = {}
        goal.entries?.forEach((e: any) => {
            map[dayjs(e.date).format("YYYY-MM-DD")] = e.value
        })
        return map
    }, [goal.entries])

    useEffect(() => {
        setLocalDeltas({})
    }, [entryMap])

    const handleTap = useCallback(
        (date: string) => {
            Feedback.trigger("impactLight")
            setLocalDeltas((prev) => ({ ...prev, [date]: (prev[date] ?? 0) + 1 }))
            update({ variables: { input: { value: 1, goalsId: goal.id, date } } })
        },
        [update, goal.id],
    )

    return (
        <View style={[s.goalRow, !isLast && s.goalBorder]}>
            <View style={s.goalIcon}>
                <Feather name={goal.icon as any} size={13} color={Colors.foreground_secondary} />
            </View>
            {weekDays.map((day) => {
                const dateStr = day.format("YYYY-MM-DD")
                const value = (entryMap[dateStr] ?? 0) + (localDeltas[dateStr] ?? 0)
                const met = value >= goal.target
                const isToday = dateStr === today
                const progress = goal.target > 1 ? Math.min(value / goal.target, 1) : 0
                const bgColor = met
                    ? color
                    : progress > 0
                      ? Color(color).alpha(0.1 + progress * 0.55).string()
                      : Color(color).alpha(0.12).string()
                return (
                    <TouchableOpacity
                        key={dateStr}
                        style={[s.cell, { backgroundColor: bgColor }, isToday && !met && s.todayCell]}
                        onPress={() => handleTap(dateStr)}
                        activeOpacity={0.6}
                    >
                        {met ? (
                            <Feather name="check" size={10} color={Colors.primary} />
                        ) : progress > 0 ? (
                            <Text style={s.cellCount}>{value}</Text>
                        ) : null}
                    </TouchableOpacity>
                )
            })}
        </View>
    )
}

const s = StyleSheet.create({
    card: {
        padding: 14,
        gap: 2,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
        gap: 5,
    },
    iconPH: {
        width: 26,
    },
    dayLabel: {
        flex: 1,
        textAlign: "center",
        fontSize: 10,
        fontWeight: "600",
        color: Colors.text_dark,
        textTransform: "uppercase",
    },
    todayLabel: {
        color: Colors.secondary,
    },
    goalRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 5,
        gap: 5,
    },
    goalBorder: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "rgba(255,255,255,0.06)",
    },
    goalIcon: {
        width: 26,
        alignItems: "center",
    },
    cell: {
        flex: 1,
        aspectRatio: 1,
        borderRadius: 7,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 32,
    },
    todayCell: {
        borderWidth: 1.5,
        borderColor: Colors.secondary,
    },
    cellCount: {
        fontSize: 9,
        fontWeight: "700",
        color: "#fff",
    },
})
