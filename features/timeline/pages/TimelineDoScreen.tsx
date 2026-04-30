import Colors from "@/constants/Colors"
import { AntDesign, Ionicons } from "@expo/vector-icons"
import moment from "moment"
import { useEffect, useRef, useState } from "react"
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from "react-native"
import Svg, { Circle, Defs, G, LinearGradient, Stop } from "react-native-svg"
import Text from "@/components/ui/Text/Text"
import { Header } from "@/components"
import useGetOccurrenceById from "../hooks/query/useGetOccurrenceById"
import useCompleteOccurrence from "../hooks/mutation/useCompleteOccurrence"
import useCompleteTodo from "../hooks/mutation/useCompleteTodo"
import { TimelineScreenProps } from "../types"
import Checkbox from "@/components/ui/Checkbox"
import lowOpacity from "@/utils/functions/lowOpacity"
import Color from "color"

const RADIUS = 90
const STROKE = 12
const SIZE = (RADIUS + STROKE) * 2 + 16
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function formatTime(seconds: number) {
    const s = Math.max(0, seconds)
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    if (h > 0) return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
}

function TodoRow({ todo, timelineId }: { todo: { id: string; title: string; isCompleted: boolean }; timelineId: string }) {
    const [complete, { loading }] = useCompleteTodo({
        todoId: todo.id,
        timelineId,
        currentlyCompleted: todo.isCompleted,
    })

    return (
        <TouchableOpacity onPress={() => complete()} style={[styles.todoRow, todo.isCompleted && styles.todoRowDone]} activeOpacity={0.7}>
            {loading ? (
                <ActivityIndicator size="small" color={Colors.secondary} style={{ width: 24, height: 24 }} />
            ) : (
                <Checkbox checked={todo.isCompleted} onPress={() => complete()} size={24} />
            )}
            <Text style={[styles.todoTitle, todo.isCompleted && styles.todoTitleDone]} numberOfLines={2}>
                {todo.title}
            </Text>
            {todo.isCompleted && <Ionicons name="checkmark" size={16} color={Colors.secondary} />}
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
                if (prev <= 0) { clearInterval(intervalRef.current!); return 0 }
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
    const todoPct = todos.length > 0 ? completedCount / todos.length : 0

    const handleFinish = async () => {
        await completeOccurrence({ variables: { input: { id: timelineId, isCompleted: true } } })
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
                            <View style={styles.titleCard}>
                                <Text style={styles.taskTitle} numberOfLines={2}>
                                    {occurrence.title}
                                </Text>
                                <View style={styles.timeRangeRow}>
                                    <Ionicons name="time-outline" size={13} color={Colors.foreground_secondary} />
                                    <Text style={styles.taskTimeRange}>
                                        {moment(occurrence.beginTime, "HH:mm").format("HH:mm")} – {moment(occurrence.endTime, "HH:mm").format("HH:mm")}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.timerSection}>
                                <View style={styles.ringWrapper}>
                                    <Svg width={SIZE} height={SIZE}>
                                        <Defs>
                                            <LinearGradient id="arcGrad" x1="0" y1="0" x2={SIZE} y2={SIZE} gradientUnits="userSpaceOnUse">
                                                <Stop offset="0" stopColor={Colors.secondary_light_2} stopOpacity="1" />
                                                <Stop offset="1" stopColor={Colors.secondary} stopOpacity="1" />
                                            </LinearGradient>
                                        </Defs>
                                        <Circle
                                            cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
                                            stroke={lowOpacity(arcColor, 0.12)}
                                            strokeWidth={STROKE}
                                            fill="none"
                                        />
                                        <G transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
                                            <Circle
                                                cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
                                                stroke={isExpired ? Colors.error : "url(#arcGrad)"}
                                                strokeWidth={STROKE}
                                                fill="none"
                                                strokeDasharray={CIRCUMFERENCE}
                                                strokeDashoffset={dashOffset}
                                                strokeLinecap="round"
                                            />
                                        </G>
                                    </Svg>
                                    <View style={styles.ringInner} pointerEvents="none">
                                        <Text style={[styles.timerText, isExpired && { color: Colors.error }]}>
                                            {formatTime(remaining)}
                                        </Text>
                                        <Text style={[styles.timerLabel, isExpired && { color: Colors.error }]}>
                                            {isExpired ? "time's up" : !isRunning ? "paused" : "remaining"}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.controls}>
                                <TouchableOpacity
                                    onPress={() => navigation.goBack()}
                                    style={styles.sideBtn}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.sideBtnIcon, { backgroundColor: lowOpacity(Colors.error, 0.12) }]}>
                                        <Ionicons name="stop" size={18} color={Colors.error} />
                                    </View>
                                    <Text style={styles.sideBtnLabel}>Stop</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => setIsRunning((r) => !r)}
                                    style={styles.playBtn}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name={isRunning ? "pause" : "play"} size={28} color={Colors.primary} />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleFinish}
                                    disabled={completing}
                                    style={styles.sideBtn}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.sideBtnIcon, { backgroundColor: lowOpacity(Colors.secondary, 0.12) }]}>
                                        {completing ? (
                                            <ActivityIndicator size="small" color={Colors.secondary} />
                                        ) : (
                                            <Ionicons name="checkmark-done" size={18} color={Colors.secondary} />
                                        )}
                                    </View>
                                    <Text style={styles.sideBtnLabel}>Done</Text>
                                </TouchableOpacity>
                            </View>

                            {todos.length > 0 && (
                                <View style={styles.todosHeader}>
                                    <View style={styles.todosHeaderTop}>
                                        <Text style={styles.todosTitle}>Tasks</Text>
                                        <Text style={styles.todosCount}>
                                            <Text style={{ color: Colors.secondary, fontWeight: "700" }}>{completedCount}</Text>
                                            {"/" + todos.length}
                                        </Text>
                                    </View>
                                    <View style={styles.todoProgress}>
                                        <View style={[styles.todoProgressFill, { width: `${todoPct * 100}%` as any }]} />
                                    </View>
                                </View>
                            )}

                            {todos.length === 0 && (
                                <View style={styles.emptyState}>
                                    <View style={styles.emptyIcon}>
                                        <Ionicons name="checkbox-outline" size={28} color={Colors.foreground_secondary} />
                                    </View>
                                    <Text style={styles.emptyText}>No tasks added</Text>
                                    <TouchableOpacity
                                        style={styles.addTodoBtn}
                                        onPress={() => (navigation as any).navigate("CreateTimelineTodos", { timelineId })}
                                    >
                                        <Ionicons name="add" size={15} color={Colors.secondary} />
                                        <Text style={styles.addTodoBtnText}>Add tasks</Text>
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
        paddingTop: 100,
    },
    titleCard: {
        marginHorizontal: 20,
        marginBottom: 32,
        gap: 6,
    },
    taskTitle: {
        fontSize: 30,
        fontWeight: "800",
        color: Colors.foreground,
        letterSpacing: -0.3,
        lineHeight: 36,
    },
    timeRangeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    taskTimeRange: {
        fontSize: 13,
        color: Colors.foreground_secondary,
        fontWeight: "500",
    },
    timerSection: {
        alignItems: "center",
        marginBottom: 32,
    },
    ringWrapper: {
        width: SIZE,
        height: SIZE,
        alignItems: "center",
        justifyContent: "center",
    },
    ringInner: {
        position: "absolute",
        top: 0,
        left: 0,
        width: SIZE,
        height: SIZE,
        alignItems: "center",
        justifyContent: "center",
    },
    timerText: {
        fontSize: 44,
        fontWeight: "700",
        letterSpacing: 1,
        fontVariant: ["tabular-nums"],
        color: Colors.foreground,
    },
    timerLabel: {
        fontSize: 11,
        color: Colors.foreground_secondary,
        textTransform: "uppercase",
        letterSpacing: 1.5,
        marginTop: 2,
    },
    controls: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 28,
        marginBottom: 36,
    },
    playBtn: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: Colors.secondary,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: Colors.secondary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 12,
    },
    sideBtn: {
        alignItems: "center",
        gap: 6,
    },
    sideBtnIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
    },
    sideBtnLabel: {
        fontSize: 11,
        color: Colors.foreground_secondary,
        fontWeight: "500",
    },
    todosHeader: {
        paddingHorizontal: 20,
        paddingTop: 4,
        paddingBottom: 16,
        gap: 10,
    },
    todosHeaderTop: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    todosTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: Colors.foreground_secondary,
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    todosCount: {
        fontSize: 13,
        color: Colors.foreground_secondary,
        fontWeight: "500",
    },
    todoProgress: {
        height: 3,
        borderRadius: 3,
        backgroundColor: Color(Colors.secondary).alpha(0.15).string(),
        overflow: "hidden",
    },
    todoProgressFill: {
        height: "100%",
        borderRadius: 3,
        backgroundColor: Colors.secondary,
    },
    todoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        paddingVertical: 14,
        paddingHorizontal: 20,
    },
    todoRowDone: {
        opacity: 0.5,
    },
    todoTitle: {
        flex: 1,
        fontSize: 15,
        color: Colors.foreground,
        fontWeight: "500",
    },
    todoTitleDone: {
        textDecorationLine: "line-through",
        color: Colors.foreground_secondary,
    },
    separator: {
        height: 1,
        backgroundColor: Color(Colors.foreground).alpha(0.05).string(),
        marginHorizontal: 20,
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: 36,
        paddingHorizontal: 40,
        gap: 10,
    },
    emptyIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Color(Colors.foreground).alpha(0.05).string(),
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 4,
    },
    emptyText: {
        fontSize: 14,
        color: Colors.foreground_secondary,
        fontWeight: "500",
    },
    addTodoBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: lowOpacity(Colors.secondary, 0.12),
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderRadius: 100,
        marginTop: 6,
    },
    addTodoBtnText: {
        color: Colors.secondary,
        fontSize: 13,
        fontWeight: "600",
    },
})
