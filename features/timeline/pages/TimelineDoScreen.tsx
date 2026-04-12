import Colors from "@/constants/Colors"
import { AntDesign, Ionicons } from "@expo/vector-icons"
import moment from "moment"
import { useEffect, useRef } from "react"
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from "react-native"
import Svg, { Circle, Defs, G, LinearGradient, Polygon, Stop } from "react-native-svg"
import Text from "@/components/ui/Text/Text"
import { Header } from "@/components"
import useGetOccurrenceById from "../hooks/query/useGetOccurrenceById"
import useCompleteOccurrence from "../hooks/mutation/useCompleteOccurrence"
import useCompleteTodo from "../hooks/mutation/useCompleteTodo"
import { TimelineScreenProps } from "../types"
import Checkbox from "@/components/ui/Checkbox"
import { useState } from "react"
import lowOpacity from "@/utils/functions/lowOpacity"

const RADIUS = 110
const STROKE = 28
const SIZE = (RADIUS + STROKE) * 2 + 8
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function formatTime(seconds: number) {
    const s = Math.max(0, seconds)
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    if (h > 0) return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
}

function TodoRow({
    todo,
    timelineId,
}: {
    todo: { id: string; title: string; isCompleted: boolean }
    timelineId: string
}) {
    const [complete, { loading }] = useCompleteTodo({
        todoId: todo.id,
        timelineId,
        currentlyCompleted: todo.isCompleted,
    })

    return (
        <TouchableOpacity onPress={() => complete()} style={styles.todoRow} activeOpacity={0.7}>
            {loading ? (
                <ActivityIndicator size="small" color={Colors.secondary} style={{ width: 26, height: 26 }} />
            ) : (
                <Checkbox checked={todo.isCompleted} onPress={() => complete()} size={26} />
            )}
            <Text
                style={[
                    styles.todoTitle,
                    todo.isCompleted && { color: Colors.text_dark, textDecorationLine: "line-through" },
                ]}
                numberOfLines={2}
            >
                {todo.title}
            </Text>
        </TouchableOpacity>
    )
}

export default function TimelineDoScreen({ route, navigation }: TimelineScreenProps<"TimelineDo">) {
    const { timelineId } = route.params
    const { data: occurrence, loading } = useGetOccurrenceById(timelineId)
    const [completeOccurrence, { loading: completing }] = useCompleteOccurrence(timelineId)

    const [remaining, setRemaining] = useState(0)
    const [totalSeconds, setTotalSeconds] = useState(1)
    const [isRunning, setIsRunning] = useState(true)
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    useEffect(() => {
        if (!occurrence) return
        const end = moment(`${occurrence.date} ${occurrence.endTime}`, "YYYY-MM-DD HH:mm")
        const begin = moment(`${occurrence.date} ${occurrence.beginTime}`, "YYYY-MM-DD HH:mm")
        const total = Math.max(1, end.diff(begin, "seconds"))
        const rem = Math.max(0, end.diff(moment(), "seconds"))
        setTotalSeconds(total)
        setRemaining(rem)
    }, [occurrence])

    useEffect(() => {
        if (intervalRef.current) clearInterval(intervalRef.current)
        if (!isRunning) return
        intervalRef.current = setInterval(() => {
            setRemaining((prev) => {
                if (prev <= 0) {
                    clearInterval(intervalRef.current!)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(intervalRef.current!)
    }, [isRunning])

    const progress = Math.max(0, Math.min(1, remaining / totalSeconds))
    const dashOffset = CIRCUMFERENCE * (1 - progress)
    const isExpired = remaining <= 0
    const arcColor = isExpired ? Colors.error : Colors.secondary

    const todos: any[] = occurrence?.todos || []
    const completedCount = todos.filter((t) => t.isCompleted).length

    const handleFinish = async () => {
        await completeOccurrence({ variables: { id: timelineId, isCompleted: true } })
        navigation.goBack()
    }

    return (
        <View style={styles.container}>
            <Header
                shadow={false}
                backIcon={<AntDesign name="close" size={20} color="#fff" />}
                goBack
                isScreenModal
                initialHeight={80}
            />

            {loading || !occurrence ? (
                <ActivityIndicator color={Colors.secondary} size="large" style={{ flex: 1 }} />
            ) : (
                <FlatList
                    data={todos}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <>
                            <View style={styles.timerSection}>
                                <Text style={styles.taskTitle} numberOfLines={2}>
                                    {occurrence.title}
                                </Text>
                                <Text style={styles.taskTimeRange}>
                                    {moment(occurrence.beginTime, "HH:mm").format("HH:mm")} –{" "}
                                    {moment(occurrence.endTime, "HH:mm").format("HH:mm")}
                                </Text>

                                <View style={styles.circleBackground}>
                                    <Svg width={SIZE} height={SIZE}>
                                        <Defs>
                                            <LinearGradient id="arcGrad" x1="0" y1="0" x2={SIZE} y2={SIZE} gradientUnits="userSpaceOnUse">
                                                <Stop offset="0" stopColor={Colors.secondary_light_2} stopOpacity="1" />
                                                <Stop offset="1" stopColor={Colors.secondary} stopOpacity="1" />
                                            </LinearGradient>
                                        </Defs>
                                        <Circle
                                            cx={SIZE / 2}
                                            cy={SIZE / 2}
                                            r={RADIUS}
                                            stroke={lowOpacity(arcColor, 0.15)}
                                            strokeWidth={STROKE}
                                            fill="none"
                                        />
                                        <G transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
                                            <Circle
                                                cx={SIZE / 2}
                                                cy={SIZE / 2}
                                                r={RADIUS}
                                                stroke={isExpired ? Colors.error : "url(#arcGrad)"}
                                                strokeWidth={STROKE}
                                                fill="none"
                                                strokeDasharray={CIRCUMFERENCE}
                                                strokeDashoffset={dashOffset}
                                                strokeLinecap="round"
                                            />
                                            {progress > 0.02 && (() => {
                                                const endAngle = progress * 2 * Math.PI
                                                const cx = SIZE / 2
                                                const cy = SIZE / 2
                                                const px = cx + RADIUS * Math.cos(endAngle)
                                                const py = cy + RADIUS * Math.sin(endAngle)
                                                const tx = -Math.sin(endAngle)
                                                const ty = Math.cos(endAngle)
                                                const nx = Math.cos(endAngle)
                                                const ny = Math.sin(endAngle)
                                                const sz = STROKE * 0.28
                                                const tip = `${px + tx * sz},${py + ty * sz}`
                                                const bl = `${px - tx * sz * 0.4 + nx * sz * 0.7},${py - ty * sz * 0.4 + ny * sz * 0.7}`
                                                const br = `${px - tx * sz * 0.4 - nx * sz * 0.7},${py - ty * sz * 0.4 - ny * sz * 0.7}`
                                                return <Polygon points={`${tip} ${bl} ${br}`} fill="rgba(255,255,255,0.7)" />
                                            })()}
                                        </G>
                                    </Svg>
                                    <View style={{ position: "absolute", top: 0, left: 0, width: SIZE, height: SIZE, alignItems: "center", justifyContent: "center" }} pointerEvents="none">
                                        <Ionicons
                                            name={isExpired ? "checkmark-circle" : !isRunning ? "pause-circle" : "time-outline"}
                                            size={48}
                                            color={isExpired ? Colors.error : Colors.secondary}
                                        />
                                    </View>
                                </View>

                                <View style={styles.countdownRow}>
                                    <Text style={styles.timerText}>{formatTime(remaining)}</Text>
                                    <Text style={styles.timerLabel}>
                                        {isExpired ? "Time's up" : !isRunning ? "Paused" : "remaining"}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.controls}>
                                <TouchableOpacity
                                    onPress={() => navigation.goBack()}
                                    style={[styles.controlPill, { backgroundColor: lowOpacity(Colors.error, 0.15) }]}
                                >
                                    <Ionicons name="stop" size={20} color={Colors.error} />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => setIsRunning((r) => !r)}
                                    style={[
                                        styles.controlPill,
                                        styles.controlPillLarge,
                                        { backgroundColor: Colors.primary_lighter },
                                    ]}
                                >
                                    <Ionicons name={isRunning ? "pause" : "play"} size={22} color={Colors.foreground} />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleFinish}
                                    disabled={completing}
                                    style={[
                                        styles.controlPill,
                                        { backgroundColor: lowOpacity(Colors.secondary, 0.18) },
                                    ]}
                                >
                                    {completing ? (
                                        <ActivityIndicator size="small" color={Colors.secondary} />
                                    ) : (
                                        <Ionicons name="checkmark-done" size={20} color={Colors.secondary} />
                                    )}
                                </TouchableOpacity>
                            </View>

                            <View style={styles.todosHeader}>
                                <Text style={styles.todosTitle}>Todos</Text>
                                {todos.length > 0 && (
                                    <View style={styles.todosBadge}>
                                        <Text style={styles.todosBadgeText}>
                                            {completedCount}/{todos.length}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {todos.length === 0 && (
                                <View style={styles.emptyState}>
                                    <Ionicons name="checkbox-outline" size={40} color={Colors.text_dark} />
                                    <Text style={styles.emptyText}>No todos for this task</Text>
                                    <TouchableOpacity
                                        style={styles.addTodoBtn}
                                        onPress={() =>
                                            (navigation as any).navigate("CreateTimelineTodos", { timelineId })
                                        }
                                    >
                                        <Ionicons name="add" size={16} color={Colors.secondary} />
                                        <Text style={styles.addTodoBtnText}>Add todos</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </>
                    }
                    renderItem={({ item }) => <TodoRow todo={item} timelineId={timelineId} />}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    scrollContent: {
        paddingBottom: 60,
        paddingTop: 70,
    },
    timerSection: {
        alignItems: "center",
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    taskTitle: {
        fontSize: 35,
        fontWeight: "700",
        color: Colors.foreground,
        textAlign: "center",
        letterSpacing: 0.3,
        marginBottom: 6,
    },
    taskTimeRange: {
        fontSize: 13,
        color: Colors.text_dark,
        letterSpacing: 0.5,
        marginBottom: 24,
    },
    countdownRow: {
        alignItems: "center",
        marginTop: 8,
        gap: 2,
    },
    circleBackground: {
        width: SIZE,
        height: SIZE,
    },
    timerText: {
        fontSize: 52,
        fontWeight: "bold",
        letterSpacing: 2,
        fontVariant: ["tabular-nums"],
        color: Colors.foreground,
    },
    timerLabel: {
        fontSize: 12,
        color: Colors.text_dark,
        textTransform: "uppercase",
        letterSpacing: 1.5,
    },
    controls: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 18,
        paddingHorizontal: 30,
        marginBottom: 32,
    },
    controlPill: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: "center",
        justifyContent: "center",
    },
    controlPillLarge: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    todosHeader: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingBottom: 14,
        borderTopWidth: 1,
        borderTopColor: Colors.primary_lighter,
        paddingTop: 20,
        gap: 10,
    },
    todosTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: Colors.foreground,
    },
    todosBadge: {
        backgroundColor: Colors.secondary,
        borderRadius: 100,
        paddingHorizontal: 10,
        paddingVertical: 2,
    },
    todosBadgeText: {
        fontSize: 12,
        fontWeight: "700",
        color: Colors.primary,
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: 32,
        gap: 10,
    },
    emptyText: {
        fontSize: 14,
        color: Colors.text_dark,
    },
    addTodoBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: lowOpacity(Colors.secondary, 0.12),
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 100,
        marginTop: 4,
    },
    addTodoBtnText: {
        color: Colors.secondary,
        fontSize: 14,
        fontWeight: "600",
    },
    todoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    todoTitle: {
        flex: 1,
        fontSize: 15,
        color: Colors.text_light,
    },
    separator: {
        height: 1,
        backgroundColor: Colors.primary_lighter,
        marginHorizontal: 20,
    },
})
