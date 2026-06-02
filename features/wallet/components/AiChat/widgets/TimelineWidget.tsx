import { FONTS } from "@/constants/Fonts"
import Colors from "@/constants/Colors"
import { useMemo, useState } from "react"
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native"
import Text from "@/components/ui/Text/Text"
import GlassView from "@/components/ui/GlassView"
import { Ionicons } from "@expo/vector-icons"
import { useMutation } from "@apollo/client"
import moment from "moment"
import { CREATE_EVENT } from "@/features/timeline/hooks/schemas/schemas"
import { GET_OCCURRENCES_QUERY } from "@/features/timeline/hooks/query/useGetOccurrencesQuery"
import { GET_MONTHLY_OCCURRENCES } from "@/features/timeline/hooks/general/useTimeline"

interface AiTodo {
    title: string
    isCompleted: boolean
}

interface AiTask {
    titleOverride: string
    descriptionOverride: string | null
    date: string | null
    beginTimeOverride: string | null
    endTimeOverride: string | null
    isRepeat: boolean
    repeatFrequency: string | null
    repeatEveryNth: number | null
    repeatCount: number | null
    repeatType: string | null
    repeatDaysOfWeek: number[] | null
    repeatInterval: number | null
    repeatUntil: string | null
    reminderBeforeMinutes: number | null
    todos: AiTodo[] | null
}

interface ResolvedTask {
    title: string
    desc: string
    begin: string
    end: string
    date: string
    todos: string[]
    isRepeat: boolean
    repeatFrequency: string | null
    repeatEveryNth: number | null
    repeatCount: number | null
    repeatType: string | null
    repeatDaysOfWeek: number[] | null
    repeatInterval: number | null
    repeatUntil: string | null
    reminderBeforeMinutes: number | null
}

export function resolveTask(task: AiTask): ResolvedTask {
    const date = task.date ?? moment().format("YYYY-MM-DD")
    const begin =
        task.beginTimeOverride ??
        moment()
            .add(30 - (moment().minute() % 30), "minutes")
            .startOf("minute")
            .format("HH:mm")
    const end = task.endTimeOverride ?? moment(begin, "HH:mm").add(30, "minutes").format("HH:mm")
    return {
        title: task.titleOverride || "Task",
        desc: task.descriptionOverride ?? "",
        begin,
        end,
        date,
        todos: (task.todos ?? []).map((t) => t.title),
        isRepeat: task.isRepeat,
        repeatFrequency: task.repeatFrequency,
        repeatEveryNth: task.repeatEveryNth,
        repeatCount: task.repeatCount,
        repeatType: task.repeatType,
        repeatDaysOfWeek: task.repeatDaysOfWeek,
        repeatInterval: task.repeatInterval,
        repeatUntil: task.repeatUntil,
        reminderBeforeMinutes: task.reminderBeforeMinutes,
    }
}

export function TimelineWidget({ data }: { data: any }) {
    const tasks: ResolvedTask[] = useMemo(() => {
        const raw: AiTask[] = Array.isArray(data?.tasks) ? data.tasks : []
        return raw.map(resolveTask)
    }, [data])

    if (!tasks.length) return null

    return (
        <View style={tw.widgetWrap}>
            {!!data?.message && (
                <View style={tw.msgBubble}>
                    <Text style={tw.msgBubbleText}>{data.message}</Text>
                </View>
            )}
            {tasks.map((task, i) => (
                <TaskCard key={i} task={task} />
            ))}
        </View>
    )
}

function TaskCard({ task }: { task: ResolvedTask }) {
    const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle")
    const [createEvent] = useMutation(CREATE_EVENT)

    const onAdd = async () => {
        setStatus("loading")
        try {
            await createEvent({
                variables: {
                    input: {
                        input: {
                            title: task.title,
                            description: task.desc,
                            beginTime: task.begin,
                            endTime: task.end,
                            date: task.date,
                            tags: "UNTAGGED",
                            todos: task.todos,
                        },
                        ...(task.isRepeat && {
                            repeat: {
                                repeatCount: task.repeatCount ?? undefined,
                                repeatOn: task.repeatFrequency ?? undefined,
                                repeatEveryNth: task.repeatEveryNth ?? undefined,
                                startDate: task.date,
                                ...(task.repeatType && {
                                    repeatType: task.repeatType,
                                    repeatDaysOfWeek: task.repeatDaysOfWeek ?? undefined,
                                    repeatInterval: task.repeatInterval ?? undefined,
                                    repeatUntil: task.repeatUntil ?? undefined,
                                }),
                                ...(task.reminderBeforeMinutes != null && {
                                    reminderBeforeMinutes: task.reminderBeforeMinutes,
                                }),
                            },
                        }),
                    },
                },
                refetchQueries: [
                    { query: GET_OCCURRENCES_QUERY, variables: { date: task.date } },
                    { query: GET_MONTHLY_OCCURRENCES, variables: { date: moment().format("YYYY-MM-DD") } },
                ],
            })
            setStatus("done")
        } catch {
            setStatus("error")
        }
    }

    return (
        <View style={tw.taskCard}>
            <View style={tw.taskInfo}>
                <Text style={tw.taskName}>{task.title}</Text>
                <Text style={tw.taskMeta}>
                    {task.begin}–{task.end} · {moment(task.date).format("DD MMM")}
                    {task.isRepeat && task.repeatFrequency ? ` · ${task.repeatFrequency}` : ""}
                </Text>
                {!!task.desc && <Text style={tw.taskDesc}>{task.desc}</Text>}
                {task.todos.length > 0 && (
                    <View style={tw.todoList}>
                        {task.todos.map((todo, i) => (
                            <View key={i} style={tw.todoRow}>
                                <View style={tw.todoDot} />
                                <Text style={tw.todoText}>{todo}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
            {status === "done" ? (
                <Ionicons name="checkmark-circle" size={26} color={Colors.secondary} />
            ) : (
                <GlassView
                    tintColor={status === "loading" || status === "error" ? undefined : Colors.secondary}
                    style={[tw.addBtn, (status === "loading" || status === "error") && { opacity: 0.6 }]}
                >
                    <Pressable style={tw.addBtnInner} onPress={onAdd} disabled={status === "loading"}>
                        {status === "loading" ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : status === "error" ? (
                            <Ionicons name="refresh" size={14} color="#fff" />
                        ) : (
                            <Text style={tw.addBtnText}>Add</Text>
                        )}
                    </Pressable>
                </GlassView>
            )}
        </View>
    )
}

const tw = StyleSheet.create({
    widgetWrap: { gap: 8, alignSelf: "stretch" },
    msgBubble: {
        backgroundColor: Colors.primary_light,
        borderRadius: 16,
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: Colors.primary_lighter,
        padding: 12,
        alignSelf: "stretch",
    },
    msgBubbleText: { fontSize: 14, lineHeight: 20, color: Colors.foreground },
    taskCard: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: Colors.primary_light,
        borderRadius: 14,
        padding: 12,
        borderWidth: 1,
        borderColor: Colors.primary_lighter,
        gap: 10,
    },
    taskInfo: { flex: 1, gap: 3 },
    taskName: { color: Colors.foreground, fontSize: 14, fontFamily: FONTS.semibold },
    taskMeta: { color: Colors.secondary, fontSize: 12, fontFamily: FONTS.medium },
    taskDesc: { color: Colors.foreground_secondary, fontSize: 12 },
    todoList: { gap: 4, marginTop: 4 },
    todoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    todoDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.foreground_secondary },
    todoText: { color: Colors.foreground_secondary, fontSize: 11, flex: 1 },
    addBtn: { borderRadius: 20, minWidth: 54, height: 40, overflow: "hidden" },
    addBtnInner: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 12 },
    addBtnText: { color: "#fff", fontSize: 13, fontFamily: FONTS.bold },
})
