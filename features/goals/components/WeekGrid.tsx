import { Feather } from "@expo/vector-icons"
import { useMemo, useCallback } from "react"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import dayjs from "dayjs"
import Colors, { secondary_candidates } from "@/constants/Colors"
import Text from "@/components/ui/Text/Text"
import { useUpsertGoalEntry } from "../hooks/hooks"
import Feedback from "react-native-haptic-feedback"
import lowOpacity from "@/utils/functions/lowOpacity"

interface GoalItem {
    id: string
    name: string
    icon: string
    target: number
    min: number
    entries?: { id: string; value: number; date: string }[]
}

interface WeekGridProps {
    goals: GoalItem[]
    onGoalPress: (id: string) => void
}

export default function WeekGrid({ goals, onGoalPress }: WeekGridProps) {
    const weekDays = useMemo(() => {
        const start = dayjs().startOf("week")
        return Array.from({ length: 7 }, (_, i) => start.add(i, "day"))
    }, [])

    const today = dayjs().format("YYYY-MM-DD")

    return (
        <View style={styles.container}>
            {goals.map((goal, idx) => (
                <GoalWeekCard
                    key={goal.id}
                    goal={goal}
                    weekDays={weekDays}
                    today={today}
                    color={secondary_candidates[idx % secondary_candidates.length]}
                    onPress={() => onGoalPress(goal.id)}
                />
            ))}
        </View>
    )
}

function GoalWeekCard({
    goal,
    weekDays,
    today,
    color,
    onPress,
}: {
    goal: GoalItem
    weekDays: dayjs.Dayjs[]
    today: string
    color: string
    onPress: () => void
}) {
    const [update] = useUpsertGoalEntry()

    const entryMap = useMemo(() => {
        const map: Record<string, number> = {}
        goal.entries?.forEach((e) => {
            map[dayjs(e.date).format("YYYY-MM-DD")] = e.value
        })
        return map
    }, [goal.entries])

    const handleIncrement = useCallback(
        async (date: string) => {
            Feedback.trigger("impactLight")
            await update({
                variables: {
                    input: { value: 1, goalsId: goal.id, date },
                },
            })
        },
        [update, goal.id],
    )

    const isLimit = goal.min === 1

    return (
        <View style={styles.card}>
            <TouchableOpacity style={styles.cardHeader} onPress={onPress} activeOpacity={0.7}>
                <View style={styles.iconContainer}>
                    <Feather name={goal.icon as any} size={14} color={Colors.foreground} />
                </View>
                <Text style={styles.goalName}>{goal.name}</Text>
            </TouchableOpacity>

            <View style={styles.weekRow}>
                {weekDays.map((day) => {
                    const dateStr = day.format("YYYY-MM-DD")
                    const value = entryMap[dateStr] || 0
                    const isToday = dateStr === today
                    const hasValue = value > 0

                    const goalMet = isLimit ? value > 0 && value <= goal.target : value >= goal.target
                    const overLimit = isLimit && value > goal.target

                    const cellColor = overLimit
                        ? "#F44336"
                        : hasValue && goalMet
                          ? color
                          : hasValue
                            ? lowOpacity(color, 0.15)
                            : Colors.primary

                    return (
                        <TouchableOpacity
                            key={dateStr}
                            style={[styles.dayTile, isToday && styles.todayTile]}
                            onPress={() => handleIncrement(dateStr)}
                            activeOpacity={0.6}
                        >
                            <Text style={[styles.dayLabel, isToday && styles.todayText]}>
                                {day.format("dd")[0]}
                            </Text>
                            <Text style={[styles.dayNum, isToday && styles.todayText]}>
                                {day.format("D")}
                            </Text>
                            <View style={[styles.valueCell, { backgroundColor: cellColor }]}>
                                <Text
                                    style={[
                                        styles.valueText,
                                        hasValue && { color: Colors.foreground, fontWeight: "700" },
                                    ]}
                                >
                                    {value || "-"}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )
                })}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 300,
        paddingBottom: 100,
        paddingHorizontal: 15,
    },
    card: {
        backgroundColor: Colors.primary_light,
        borderRadius: 15,
        padding: 15,
        marginBottom: 10,
        gap: 12,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    iconContainer: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: Colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    goalName: {
        fontSize: 14,
        fontWeight: "bold",
        color: Colors.foreground,
    },
    weekRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    dayTile: {
        alignItems: "center",
        gap: 4,
        paddingVertical: 4,
        paddingHorizontal: 2,
        borderRadius: 10,
        flex: 1,
    },
    todayTile: {
        backgroundColor: Colors.primary_lighter,
    },
    todayText: {
        color: Colors.secondary,
        fontWeight: "700",
    },
    dayLabel: {
        fontSize: 10,
        color: Colors.text_dark,
        fontWeight: "600",
        textTransform: "uppercase",
    },
    dayNum: {
        fontSize: 12,
        color: Colors.foreground_secondary,
        fontWeight: "500",
    },
    valueCell: {
        width: "100%",
        aspectRatio: 1,
        borderRadius: 6,
        alignItems: "center",
        justifyContent: "center",
    },
    valueText: {
        fontSize: 13,
        fontWeight: "600",
        color: Colors.text_dark,
    },
})
