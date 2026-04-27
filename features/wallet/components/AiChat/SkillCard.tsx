import Colors, { secondary_candidates } from "@/constants/Colors"
import { Item } from "@/features/wallet/components/WalletChart/StatisticsSummary"
import Legend from "@/features/wallet/components/WalletChart/Legend"
import { CustomDayBarChart, DAY_LABELS, BarItem } from "@/features/wallet/components/WalletChart/SpendingsByDayOfWeek"
import { LimitsComparisonComponent } from "@/features/wallet/components/WalletChart/LimitsComparison"
import { AnimatedLineChart } from "@/features/home/components/BalancePredictionChart"
import WalletItem from "@/features/wallet/components/Wallet/WalletItem"
import SubscriptionItem from "@/features/wallet/components/Subscription/SubscriptionItem"
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons"
import { useMemo, useState } from "react"
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native"
import Layout from "@/constants/Layout"
import Text from "@/components/ui/Text/Text"
import Color from "color"
import TimelineItem from "@/features/timeline/components/TimelineItem"
import { AiChatMessageItem } from "../../pages/AiStatsChat"
import GoalCategory from "@/features/goals/components/GoalCategory"
import FlashCardGroup from "@/features/flashcards/components/FlashCardGroup"
import { gql, useMutation } from "@apollo/client"
import { CREATE_EVENT } from "@/features/timeline/hooks/schemas/schemas"
import { GET_OCCURRENCES_QUERY } from "@/features/timeline/hooks/query/useGetOccurrencesQuery"
import { GET_MONTHLY_OCCURRENCES } from "@/features/timeline/hooks/general/useTimeline"
import moment from "moment"
import GlassView from "@/components/ui/GlassView"
import { invalidateGetMainScreen } from "@/utils/schemas/GET_MAIN_SCREEN"
import { navigationRef } from "@/navigation"

const NOOP = () => {}

interface SkillCardProps {
    skill: AiChatMessageItem
    startDate: string
    endDate: string
    onNavigate?: () => void
}

export default function SkillCard({ skill, startDate, endDate, onNavigate }: SkillCardProps) {
    const data = useMemo(() => {
        return parseJson(skill.data || "")
    }, [skill.data])

    if (skill.type === "expense") {
        return (
            <View style={s.stretch}>
                <WalletItem
                    {...data}
                    handlePress={() => {
                        onNavigate?.()
                        navigationRef.current?.navigate("WalletScreens", {
                            screen: "Expense",
                            params: { expense: data },
                        } as any)
                    }}
                    animatedStyle={{}}
                />
            </View>
        )
    }
    if (skill.type === "subscription") {
        return (
            <View style={[]}>
                <SubscriptionItem
                    index={0}
                    onPress={() => {
                        onNavigate?.()

                        navigationRef.current?.navigate("WalletScreens", {
                            screen: "Subscription",
                            params: { ...data },
                        } as any)
                    }}
                    subscription={data}
                />
            </View>
        )
    }

    if (skill.type === "event") {
        return (
            <View style={{ minHeight: 120, overflow: "hidden", width: "100%" }}>
                <TimelineItem styles={{ minHeight: 120 }} {...data} onPress={onNavigate} />
            </View>
        )
    }
    if (skill.type === "goals") return <GoalCategory {...data} />
    if (skill.type === "flashcards") return <FlashCardGroup {...data} />

    if (skill.type === "timelineWidget") return <TimelineWidget data={data} />

    if (skill.type === "form_expense_new") return <FormExpenseNew data={data} onNavigate={onNavigate} />
    if (skill.type === "form_expense_edit") return <FormExpenseEdit data={data} onNavigate={onNavigate} />
    if (skill.type === "form_event_new") return <FormEventNew data={data} onNavigate={onNavigate} />
    if (skill.type === "form_event_edit") return <FormEventEdit data={data} onNavigate={onNavigate} />

    if (skill.type === "chart" && skill.data) {
        return (
            <View style={{ marginBottom: 15, maxHeight: 400, overflow: "hidden", alignSelf: "stretch" }}>
                <SkillWidget skill={skill} startDate={startDate} endDate={endDate} />
            </View>
        )
    }

    return (
        <GlassView tintColor={Colors.error}>
            <Text style={{ color: "#fff", padding: 12 }}>Unsupported skill type: {skill?.type ?? "UNDEFINED"}</Text>
            <Text style={{ color: "#fff", padding: 12 }}>Data: {JSON.stringify(skill?.data ?? {})}</Text>
        </GlassView>
    )
}

const SkillWidget = ({ skill, startDate, endDate }: SkillCardProps) => {
    const data = useMemo(() => parseJson(skill?.data || ""), [skill?.data])

    if (!data) return null

    switch (skill.subtype) {
        case "legend":
            return <LegendView data={data} startDate={startDate} endDate={endDate} />
        case "dayOfWeek":
            return <DayOfWeekView data={data} />
        case "dailySpendings":
            return <DailySpendingsView data={data} />
        case "dailyBreakdown":
            return <DailyBreakdownView data={data} />
        case "zeroExpenseDays":
            return <ZeroExpenseDaysView data={data} />
        case "spendingsLimits":
            return (
                <View style={s.stretch}>
                    <LimitsComparisonComponent dateRange={[startDate, endDate]} />
                </View>
            )
        case "balancePrediction":
            return <BalancePredictionView data={data} />
        case "recentExpenses":
            return <RecentExpensesView data={data} />
        default:
            return null
    }
}

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
}

function resolveTask(task: AiTask): ResolvedTask {
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
    }
}

function TimelineWidget({ data }: { data: any }) {
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
                        ...(task.isRepeat &&
                            task.repeatFrequency && {
                                repeat: {
                                    repeatOn: task.repeatFrequency,
                                    repeatEveryNth: task.repeatEveryNth ?? 1,
                                    repeatCount: task.repeatCount ?? 1,
                                    startDate: task.date,
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
    taskName: { color: Colors.foreground, fontSize: 14, fontWeight: "600" },
    taskMeta: { color: Colors.secondary, fontSize: 12, fontWeight: "500" },
    taskDesc: { color: Colors.foreground_secondary, fontSize: 12 },
    todoList: { gap: 4, marginTop: 4 },
    todoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    todoDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.foreground_secondary },
    todoText: { color: Colors.foreground_secondary, fontSize: 11, flex: 1 },
    addBtn: { borderRadius: 20, minWidth: 54, height: 40, overflow: "hidden" },
    addBtnInner: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 12 },
    addBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
})

const CREATE_EXPENSE_MUTATION = gql`
    mutation CreateExpenseForm($input: CreateExpenseInput!) {
        createExpense(input: $input) {
            id
            amount
            description
            date
            type
            category
        }
    }
`

const EDIT_EXPENSE_MUTATION = gql`
    mutation EditExpenseForm($input: EditExpenseInput!) {
        editExpense(input: $input) {
            id
        }
    }
`

const EDIT_OCCURRENCE_MUTATION = gql`
    mutation EditOccurrenceForm($input: EditOccurrenceArgsInput!) {
        editOccurrence(input: $input) {
            id
            title
            date
            beginTime
            endTime
        }
    }
`

function ActionRow({
    status,
    onSave,
    onEdit,
}: {
    status: "idle" | "loading" | "done" | "error"
    onSave: () => void
    onEdit: () => void
}) {
    return (
        <View style={sb.row}>
            <GlassView style={sb.editBtn}>
                <Pressable style={sb.btnInner} onPress={onEdit}>
                    <Ionicons name="create-outline" size={15} color={Colors.foreground} />
                    <Text style={sb.editBtnText}>Edit</Text>
                </Pressable>
            </GlassView>
            {status === "done" ? (
                <View style={sb.doneRow}>
                    <Ionicons name="checkmark-circle" size={18} color={Colors.secondary} />
                    <Text style={sb.doneText}>Saved</Text>
                </View>
            ) : (
                <GlassView
                    tintColor={status === "error" ? Colors.error : Colors.secondary}
                    style={[sb.saveBtn, status === "loading" && { opacity: 0.6 }]}
                >
                    <Pressable style={sb.btnInner} onPress={onSave} disabled={status === "loading"}>
                        {status === "loading" ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={sb.btnText}>{status === "error" ? "Retry" : "Save"}</Text>
                        )}
                    </Pressable>
                </GlassView>
            )}
        </View>
    )
}

const sb = StyleSheet.create({
    row: { flexDirection: "row", justifyContent: "flex-end", gap: 8, alignItems: "center" },
    saveBtn: { borderRadius: 20, height: 36, overflow: "hidden", minWidth: 90 },
    editBtn: { borderRadius: 20, height: 36, overflow: "hidden", minWidth: 72 },
    btnInner: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 14,
    },
    btnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
    editBtnText: { color: Colors.foreground, fontSize: 13, fontWeight: "600" },
    doneRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 4 },
    doneText: { color: Colors.secondary, fontSize: 13, fontWeight: "600" },
})

function FormExpenseNew({ data, onNavigate }: { data: any; onNavigate?: () => void }) {
    const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle")
    const [createExpense] = useMutation(CREATE_EXPENSE_MUTATION, {
        refetchQueries: ["GetWallet", invalidateGetMainScreen()],
    })

    const onConfirm = async () => {
        setStatus("loading")
        try {
            await createExpense({
                variables: {
                    input: {
                        amount: data.amount,
                        description: data.description,
                        date: data.date,
                        type: data.type ?? "expense",
                        category: data.category ?? "OTHER",
                    },
                },
            })
            setStatus("done")
        } catch {
            setStatus("error")
        }
    }

    const preview = { id: "preview", balanceBeforeInteraction: 0, type: "expense", category: "OTHER", ...data }

    const onEdit = () => {
        onNavigate?.()
        navigationRef.current?.navigate("WalletScreens", { screen: "Wallet" } as any)
        setTimeout(() => {
            navigationRef.current?.navigate("WalletScreens", {
                screen: "CreateExpense",
                params: { ...preview, isEditing: false },
            } as any)
        }, 100)
    }

    return (
        <View style={s.stretch}>
            <WalletItem {...preview} handlePress={NOOP} animatedStyle={{}} containerStyle={{ marginBottom: 0 }} />
            <ActionRow status={status} onSave={onConfirm} onEdit={onEdit} />
        </View>
    )
}

function FormExpenseEdit({ data, onNavigate }: { data: any; onNavigate?: () => void }) {
    const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle")
    const [editExpense] = useMutation(EDIT_EXPENSE_MUTATION, {
        refetchQueries: ["GetWallet", invalidateGetMainScreen()],
    })

    const onConfirm = async () => {
        setStatus("loading")
        try {
            await editExpense({
                variables: {
                    input: {
                        expenseId: data.id,
                        amount: data.amount,
                        description: data.description,
                        date: data.date,
                        type: data.type ?? "expense",
                        category: data.category ?? "OTHER",
                    },
                },
            })
            setStatus("done")
        } catch {
            setStatus("error")
        }
    }

    const preview = {
        balanceBeforeInteraction: 0,
        type: "expense",
        category: "OTHER",
        date: moment().format("YYYY-MM-DD"),
        ...data,
    }

    const onEdit = () => {
        onNavigate?.()
        navigationRef.current?.navigate("WalletScreens", { screen: "Wallet" } as any)
        setTimeout(() => {
            navigationRef.current?.navigate("WalletScreens", {
                screen: "CreateExpense",
                params: { ...preview, isEditing: true },
            } as any)
        }, 100)
    }

    return (
        <View style={s.stretch}>
            <WalletItem {...preview} handlePress={NOOP} animatedStyle={{}} containerStyle={{ marginBottom: 0 }} />
            <ActionRow status={status} onSave={onConfirm} onEdit={onEdit} />
        </View>
    )
}

function FormEventNew({ data, onNavigate }: { data: any; onNavigate?: () => void }) {
    const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle")
    const [createEvent] = useMutation(CREATE_EVENT)

    const begin =
        data.beginTime ??
        moment()
            .add(30 - (moment().minute() % 30), "minutes")
            .startOf("minute")
            .format("HH:mm")
    const end = data.endTime ?? moment(begin, "HH:mm").add(30, "minutes").format("HH:mm")

    const onConfirm = async () => {
        setStatus("loading")
        try {
            await createEvent({
                variables: {
                    input: {
                        input: {
                            title: data.title,
                            description: data.description ?? "",
                            beginTime: begin,
                            endTime: end,
                            date: data.date,
                            tags: data.tags ?? "UNTAGGED",
                            todos: [],
                        },
                    },
                },
                refetchQueries: [
                    { query: GET_OCCURRENCES_QUERY, variables: { date: data.date } },
                    { query: GET_MONTHLY_OCCURRENCES, variables: { date: moment().format("YYYY-MM-DD") } },
                ],
            })
            setStatus("done")
        } catch {
            setStatus("error")
        }
    }

    const preview = {
        id: "preview",
        seriesId: "",
        isCompleted: false,
        isSkipped: false,
        isRepeat: false,
        tags: "UNTAGGED",
        priority: null,
        todos: [],
        images: [],
        position: 0,
        location: "timeline" as const,
        beginTime: begin,
        endTime: end,
        date: moment().format("YYYY-MM-DD"),
        ...data,
    }

    const onEdit = () => {
        onNavigate?.()
        navigationRef.current?.navigate("TimelineScreens", { screen: "Timeline" } as any)
        setTimeout(() => {
            navigationRef.current?.navigate("TimelineScreens", {
                screen: "TimelineCreate",
                params: { selectedDate: preview.date, ...preview },
            } as any)
        }, 100)
    }

    return (
        <View style={{ width: "100%", gap: 8 }}>
            <TimelineItem styles={{ marginBottom: 0, minHeight: 80 }} {...preview} />
            <ActionRow status={status} onSave={onConfirm} onEdit={onEdit} />
        </View>
    )
}

function FormEventEdit({ data, onNavigate }: { data: any; onNavigate?: () => void }) {
    const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle")
    const [editOccurrence] = useMutation(EDIT_OCCURRENCE_MUTATION, {
        refetchQueries: [
            { query: GET_OCCURRENCES_QUERY, variables: { date: data?.date ?? moment().format("YYYY-MM-DD") } },
            { query: GET_MONTHLY_OCCURRENCES, variables: { date: moment().format("YYYY-MM-DD") } },
        ],
    })

    const onConfirm = async () => {
        setStatus("loading")
        try {
            await editOccurrence({
                variables: {
                    input: {
                        id: data.id,
                        input: {
                            ...(data.title && { title: data.title }),
                            ...(data.description && { description: data.description }),
                            ...(data.date && { date: data.date }),
                            ...(data.beginTime && { beginTime: data.beginTime }),
                            ...(data.endTime && { endTime: data.endTime }),
                        },
                        scope: "THIS_ONLY",
                    },
                },
            })
            setStatus("done")
        } catch {
            setStatus("error")
        }
    }

    const preview = {
        id: "preview",
        seriesId: "",
        isCompleted: false,
        isSkipped: false,
        isRepeat: false,
        tags: "UNTAGGED",
        priority: null,
        todos: [],
        images: [],
        position: 0,
        location: "timeline" as const,
        beginTime: "00:00",
        endTime: "00:30",
        date: moment().format("YYYY-MM-DD"),
        ...data,
    }

    const onEdit = () => {
        onNavigate?.()
        navigationRef.current?.navigate("TimelineScreens", { screen: "Timeline" } as any)
        setTimeout(() => {
            navigationRef.current?.navigate("TimelineScreens", {
                screen: "TimelineCreate",
                params: { selectedDate: preview.date, ...preview },
            } as any)
        }, 100)
    }

    return (
        <View style={{ width: "100%", gap: 8 }}>
            <TimelineItem styles={{ marginBottom: 0, minHeight: 80 }} {...preview} />
            <ActionRow status={status} onSave={onConfirm} onEdit={onEdit} />
        </View>
    )
}

function parseJson(str: string): any {
    if (!str) return null
    if (typeof str === "object") return str
    try {
        const first = JSON.parse(str)
        if (typeof first === "string") return JSON.parse(first)
        return first
    } catch {
        return null
    }
}

function safeMaxValue(bars: BarItem[]): number {
    if (!bars.length) return 100
    const m = Math.max(...bars.map((b) => b.value))
    return m > 0 ? m * 1.1 : 1
}

function DayOfWeekView({ data }: { data: any[] }) {
    const items = Array.isArray(data) ? data : []
    const bars: BarItem[] = useMemo(
        () =>
            items.map((item, i) => ({
                label: DAY_LABELS[(item.day ?? i + 1) - 1]?.slice(0, 3) ?? String(item.day ?? i),
                value: item.total ?? item.value ?? 0,
                frontColor: secondary_candidates[i % secondary_candidates.length],
                day: item.day ?? i + 1,
            })),
        [items],
    )
    if (!bars.length) return null
    return <CustomDayBarChart data={bars} maxValue={safeMaxValue(bars)} type="total" />
}

function DailySpendingsView({ data }: { data: any[] }) {
    const items = Array.isArray(data) ? data : []
    const bars: BarItem[] = useMemo(
        () =>
            items
                .filter((item) => (item.total ?? item.amount ?? item.value ?? 0) > 0)
                .map((item, i) => ({
                    label: item.date
                        ? new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        : String(i + 1),
                    value: item.total ?? item.amount ?? item.value ?? 0,
                    frontColor: secondary_candidates[i % secondary_candidates.length],
                    day: i + 1,
                })),
        [items],
    )
    if (!bars.length) return null
    return <CustomDayBarChart data={bars} maxValue={safeMaxValue(bars)} type="total" />
}

function DailyBreakdownView({ data }: { data: any[] }) {
    const items = Array.isArray(data) ? data : []
    const bars: BarItem[] = useMemo(
        () =>
            items.map((item, i) => ({
                label: item.date
                    ? new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    : String(i + 1),
                value: item.total ?? item.amount ?? item.value ?? 0,
                frontColor: secondary_candidates[i % secondary_candidates.length],
                day: i + 1,
            })),
        [items],
    )
    if (!bars.length) return null
    return <CustomDayBarChart data={bars} maxValue={safeMaxValue(bars)} type="total" />
}

function LegendView({ data, startDate, endDate }: { data: any[]; startDate: string; endDate: string }) {
    const items = Array.isArray(data) ? data : []
    const total = items.reduce((s, i) => s + (i.total || 0), 0)
    const [detailed, setDetailed] = useState("general")
    return (
        <Legend
            statisticsLegendData={{ statisticsLegend: items }}
            totalSum={total}
            selected=""
            onPress={NOOP}
            onLongPress={NOOP}
            excluded={[]}
            startDate={startDate}
            endDate={endDate}
            detailed={detailed}
            toggleMode={() => setDetailed((p) => (p === "general" ? "detailed" : "general"))}
        />
    )
}

function ZeroExpenseDaysView({ data }: { data: any }) {
    const days = Array.isArray(data?.days) ? data.days.length : 0
    const saved = data?.saved ?? 0
    const avg = data?.avg ?? 0
    const streaks = Array.isArray(data?.streak) ? data.streak.length : 0

    const width = (Layout.screen.width - 30 - s.grid.gap * 2) / 2
    return (
        <View style={s.grid}>
            <Item
                width={width}
                label="Days saved"
                value={days}
                formatValue={false}
                icon={<MaterialIcons name="event-available" size={24} color={Colors.secondary} />}
            />
            <Item
                width={width}
                label="Money saved"
                value={saved}
                icon={<FontAwesome5 name="piggy-bank" size={24} color="lightgreen" />}
            />
            <Item
                width={width}
                label="Avg/day"
                value={avg}
                icon={<MaterialIcons name="attach-money" size={24} color="orange" />}
            />
            <Item
                width={width}
                label="Streaks"
                value={streaks}
                formatValue={false}
                icon={<Ionicons name="flame" size={24} color="orange" />}
            />
        </View>
    )
}

function BalancePredictionView({ data }: { data: any }) {
    const projections = Array.isArray(data?.projections) ? data.projections : []
    const currentBalance = data?.currentBalance ?? 0
    if (!projections.length) return null
    return (
        <View style={s.stretch}>
            <AnimatedLineChart data={projections} currentBalance={currentBalance} index={0} onPositionChange={NOOP} />
        </View>
    )
}

function RecentExpensesView({ data }: { data: any[] }) {
    const items = Array.isArray(data) ? data.slice(0, 8) : []
    return (
        <View style={s.stretch}>
            {items.map((item: any) => (
                <WalletItem key={item.id} {...item} handlePress={NOOP} animatedStyle={{}} />
            ))}
        </View>
    )
}

const s = StyleSheet.create({
    stretch: { alignSelf: "stretch" },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, alignSelf: "stretch", justifyContent: "space-between" },
    card: {
        backgroundColor: Colors.primary_light,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: Colors.primary_lighter,
        padding: 12,
        gap: 8,
    },
    cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
    cardTitle: { fontSize: 15, fontWeight: "600", color: Colors.foreground, flex: 1 },
    cardSub: { fontSize: 13, color: Colors.foreground_secondary, lineHeight: 18 },
    cardMeta: { fontSize: 12, color: Colors.foreground_secondary },
    badgeRow: { flexDirection: "row", gap: 5 },
    badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100, backgroundColor: Colors.primary_lighter },
    badgeText: { fontSize: 11, color: "#fff", fontWeight: "600" },
    badgeDone: { backgroundColor: Color("#34C759").alpha(0.25).string() },
    badgeTodo: { backgroundColor: Colors.primary_lighter },
    tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
    tag: {
        backgroundColor: Color(Colors.secondary).alpha(0.15).string(),
        borderRadius: 100,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    tagText: { fontSize: 11, color: Colors.secondary },
    goalValueRow: { flexDirection: "row", alignItems: "baseline" },
    goalValue: { fontSize: 22, fontWeight: "700", color: Colors.foreground },
    progressTrack: { height: 5, borderRadius: 100, backgroundColor: Colors.primary_lighter, overflow: "hidden" },
    progressFill: { height: 5, borderRadius: 100 },
    flashcard: { gap: 10 },
    flashcardLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: Colors.secondary,
        textTransform: "uppercase",
        letterSpacing: 0.8,
    },
    flashcardContent: { fontSize: 15, color: Colors.foreground, lineHeight: 22 },
    tapHint: { fontSize: 11, color: Colors.foreground_disabled, fontStyle: "italic" },
})
