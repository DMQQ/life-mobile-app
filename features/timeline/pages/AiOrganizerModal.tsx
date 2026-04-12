import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import { AntDesign, Ionicons } from "@expo/vector-icons"
import { gql, useMutation } from "@apollo/client"
import Color from "color"
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition"
import moment from "moment"
import { useCallback, useEffect, useRef, useState } from "react"
import {
    ActivityIndicator,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Pressable,
    StyleSheet,
    TextInput,
    View,
} from "react-native"
import Animated, {
    Easing,
    useAnimatedKeyboard,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated"
import type { TimelineScreenProps } from "../types"
import { CREATE_EVENT } from "../hooks/schemas/schemas"
import { GET_OCCURRENCES_QUERY } from "../hooks/query/useGetOccurrencesQuery"
import { GET_MONTHLY_OCCURRENCES } from "../hooks/general/useTimeline"
import { SafeAreaView } from "react-native-safe-area-context"
import { Header } from "@/components"
import GlassView from "@/components/ui/GlassView"
import useKeyboard from "@/utils/hooks/useKeyboard"

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

type Phase = "idle" | "recording" | "busy" | "ready" | "error"
type InputMode = "voice" | "text"

interface ChatMessage {
    id: string
    role: "user" | "assistant"
    content: string
    tasks?: AiTask[]
}

const EXTRACT_TASKS = gql`
    mutation ExtractTasks($content: String!, $currentDate: String, $history: [TaskHistory!]!) {
        timelineExtractTasks(content: $content, currentDate: $currentDate, history: $history) {
            message
            tasks {
                titleOverride
                descriptionOverride
                date
                beginTimeOverride
                endTimeOverride
                isRepeat
                repeatFrequency
                repeatEveryNth
                repeatCount
                todos {
                    title
                    isCompleted
                }
            }
        }
    }
`

function resolveTask(task: AiTask, selectedDate: string): ResolvedTask {
    const date = task.date ?? selectedDate
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

export default function AiOrganizerModal({ route, navigation }: TimelineScreenProps<"AiOrganizer">) {
    const { selectedDate } = route.params

    const [phase, setPhase] = useState<Phase>("idle")
    const [inputMode, setInputMode] = useState<InputMode>("voice")
    const [inputText, setInputText] = useState("")
    const [partialText, setPartialText] = useState("")
    const [errorMsg, setErrorMsg] = useState("")
    const [messages, setMessages] = useState<ChatMessage[]>([])

    const listRef = useRef<FlatList>(null)
    const finalTranscriptRef = useRef("")

    const [extract] = useMutation(EXTRACT_TASKS, {
        onError: (e) => console.error("AI extract:", JSON.stringify(e, null, 2)),
    })

    const [createEvent] = useMutation(CREATE_EVENT)

    const pulse = useSharedValue(1)
    useEffect(() => {
        pulse.value =
            phase === "recording"
                ? withRepeat(withTiming(1.05, { duration: 700, easing: Easing.inOut(Easing.ease) }), -1, true)
                : withTiming(1, { duration: 200 })
    }, [phase])
    const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }))

    const scrollToBottom = useCallback(() => {
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80)
    }, [])

    const sendMessage = useCallback(
        async (text: string) => {
            const trimmed = text.trim()
            if (!trimmed) return
            setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", content: trimmed }])
            setPhase("busy")
            setPartialText("")
            setErrorMsg("")
            scrollToBottom()
            try {
                const { data } = await extract({
                    variables: {
                        content: trimmed,
                        currentDate: moment().format("YYYY-MM-DD"),
                        history: messages.map((m) => ({ role: m.role, content: m.content })),
                    },
                })
                if (!data?.timelineExtractTasks) throw new Error("Empty response from server.")
                setMessages((prev) => [
                    ...prev,
                    {
                        id: (Date.now() + 1).toString(),
                        role: "assistant",
                        content: data.timelineExtractTasks.message || "Here are your tasks:",
                        tasks: data.timelineExtractTasks.tasks ?? [],
                    },
                ])
                setPhase("ready")
                scrollToBottom()
            } catch (e: any) {
                setErrorMsg(e?.graphQLErrors?.[0]?.message ?? e?.message ?? "Connection failed.")
                setPhase("error")
            }
        },
        [extract, messages, scrollToBottom],
    )

    useSpeechRecognitionEvent("result", (event) => {
        const best = event.results[0]?.transcript ?? ""
        if (event.isFinal) {
            finalTranscriptRef.current = best
            setPartialText("")
        } else setPartialText(best)
    })

    useSpeechRecognitionEvent("end", () => {
        const text = finalTranscriptRef.current
        if (!text) return
        finalTranscriptRef.current = ""
        sendMessage(text)
    })

    useSpeechRecognitionEvent("error", (e) => {
        setErrorMsg(e.message || e.error)
        setPhase("error")
    })

    const startVoice = useCallback(async () => {
        const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync()
        if (!granted) {
            setErrorMsg("Microphone permission denied.")
            setPhase("error")
            return
        }
        finalTranscriptRef.current = ""
        setPartialText("")
        setErrorMsg("")
        setPhase("recording")
        ExpoSpeechRecognitionModule.start({
            lang: "pl-PL",
            interimResults: true,
            continuous: false,
            requiresOnDeviceRecognition: true,
            addsPunctuation: true,
        })
    }, [])

    const stopVoice = useCallback(() => ExpoSpeechRecognitionModule.stop(), [])

    const switchToVoice = useCallback(() => {
        setInputMode("voice")
        startVoice()
    }, [startVoice])

    const handleCreate = useCallback(
        async (task: ResolvedTask) => {
            await createEvent({
                variables: {
                    title: task.title,
                    desc: task.desc,
                    begin: task.begin,
                    end: task.end,
                    date: task.date,
                    tags: "UNTAGGED",
                    todos: task.todos,
                    ...(task.isRepeat &&
                        task.repeatFrequency && {
                            repeatOn: task.repeatFrequency,
                            repeatEveryNth: task.repeatEveryNth ?? 1,
                            repeatCount: task.repeatCount ?? 1,
                            startDate: task.date,
                        }),
                },
                refetchQueries: [
                    { query: GET_OCCURRENCES_QUERY, variables: { date: task.date } },
                    { query: GET_MONTHLY_OCCURRENCES, variables: { date: moment().format("YYYY-MM-DD") } },
                ],
            })
        },
        [createEvent],
    )

    const isBusy = phase === "busy"
    const isRecording = phase === "recording"

    const keyboard = useKeyboard()

    return (
        <SafeAreaView style={s.container} edges={["top"]}>
            <Header
                shadow={false}
                backIcon={<AntDesign name="close" size={20} color="#fff" />}
                goBack
                isScreenModal
                initialHeight={80}
                buttons={[
                    {
                        icon: (
                            <Ionicons
                                name="chatbubble-ellipses"
                                size={20}
                                color={inputMode === "text" ? Colors.secondary : Colors.foreground_secondary}
                            />
                        ),
                        onPress: () => setInputMode("text"),
                    },
                    {
                        icon: (
                            <Ionicons
                                name="mic"
                                size={20}
                                color={inputMode === "voice" ? Colors.secondary : Colors.foreground_secondary}
                            />
                        ),
                        onPress: switchToVoice,
                    },
                ]}
            >
                <View style={[s.headerCenter, { position: "absolute", left: 0, right: 0, justifyContent: "center" }]}>
                    <Ionicons name="sparkles" size={16} color={Colors.secondary} />
                    <Text style={s.headerTitle}>AI Organizer</Text>
                </View>
            </Header>

            <View style={[s.divider, { marginTop: 80 }]} />

            <FlatList
                ref={listRef}
                style={s.chat}
                contentContainerStyle={s.chatContent}
                data={messages}
                keyExtractor={(m) => m.id}
                onContentSizeChange={scrollToBottom}
                ListEmptyComponent={
                    phase === "idle" ? (
                        <View style={s.emptyHint}>
                            <Text style={s.hintText}>
                                {inputMode === "voice"
                                    ? "Tap the microphone and describe your tasks or daily plan."
                                    : "Type your tasks or daily plan below."}
                            </Text>
                        </View>
                    ) : null
                }
                renderItem={({ item: msg }) => (
                    <MessageRow msg={msg} selectedDate={selectedDate} onCreate={handleCreate} />
                )}
                ListFooterComponent={
                    <>
                        {isRecording && partialText ? (
                            <View style={{ alignItems: "flex-end", marginBottom: 8 }}>
                                <View style={[s.bubble, s.bubbleUser, { opacity: 0.55 }]}>
                                    <Text style={[s.bubbleText, s.bubbleTextUser]}>{partialText}</Text>
                                </View>
                            </View>
                        ) : null}
                        {isBusy ? (
                            <View style={s.thinkingBubble}>
                                <ActivityIndicator size="small" color={Colors.secondary} />
                                <Text style={s.streamText}>Processing…</Text>
                            </View>
                        ) : null}
                        {phase === "error" ? (
                            <View style={s.errorBox}>
                                <AntDesign name="exclamation-circle" size={14} color={Colors.error} />
                                <Text style={s.errorText}>{errorMsg}</Text>
                            </View>
                        ) : null}
                    </>
                }
            />

            <KeyboardAvoidingView style={[s.inputRow]} behavior="padding" keyboardVerticalOffset={120}>
                {inputMode === "text" ? (
                    <>
                        <GlassView style={s.iconBtn}>
                            <Pressable style={s.iconBtnInner} onPress={switchToVoice}>
                                <Ionicons name="mic" size={20} color={Colors.foreground_secondary} />
                            </Pressable>
                        </GlassView>
                        <GlassView style={s.textInput}>
                            <TextInput
                                numberOfLines={3}
                                style={{
                                    color: "#fff",
                                    paddingHorizontal: 16,
                                    paddingVertical: 12,
                                    height: 50,
                                }}
                                value={inputText}
                                onChangeText={setInputText}
                                placeholder="Type a message…"
                                placeholderTextColor={Colors.foreground_disabled}
                                onSubmitEditing={() => {
                                    const t = inputText
                                    setInputText("")
                                    sendMessage(t)
                                }}
                                returnKeyType="send"
                                editable={!isBusy}
                                multiline
                            />
                        </GlassView>
                        <GlassView
                            tintColor={!inputText.trim() || isBusy ? undefined : Colors.secondary}
                            style={[s.iconBtn, (!inputText.trim() || isBusy) && { opacity: 0.4 }]}
                        >
                            <Pressable
                                style={s.iconBtnInner}
                                onPress={() => {
                                    const t = inputText
                                    setInputText("")
                                    sendMessage(t)
                                }}
                                disabled={!inputText.trim() || isBusy}
                            >
                                <Ionicons name="send" size={20} color="#fff" />
                            </Pressable>
                        </GlassView>
                    </>
                ) : (
                    <View style={s.voiceRow}>
                        {isRecording ? (
                            <Animated.View style={pulseStyle}>
                                <GlassView tintColor={Colors.error} style={s.micBtn}>
                                    <Pressable style={s.micBtnInner} onPress={stopVoice}>
                                        <Ionicons name="stop" size={26} color="#fff" />
                                    </Pressable>
                                </GlassView>
                            </Animated.View>
                        ) : (
                            <GlassView
                                tintColor={isBusy ? undefined : Colors.secondary}
                                style={[s.micBtn, isBusy && { opacity: 0.4 }]}
                            >
                                <Pressable style={s.micBtnInner} onPress={startVoice} disabled={isBusy}>
                                    <Ionicons
                                        name="mic"
                                        size={26}
                                        color={isBusy ? Colors.foreground_disabled : "#fff"}
                                    />
                                    <Text style={s.micHint}>{isBusy ? "Processing…" : "Tap to speak"}</Text>
                                </Pressable>
                            </GlassView>
                        )}

                        <GlassView style={s.iconBtn}>
                            <Pressable style={s.iconBtnInner} onPress={() => setInputMode("text")}>
                                <Ionicons name="chatbubble-ellipses" size={18} color={Colors.foreground_secondary} />
                            </Pressable>
                        </GlassView>
                    </View>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const MessageRow = ({
    msg,
    selectedDate,
    onCreate,
}: {
    msg: ChatMessage
    selectedDate: string
    onCreate: (task: ResolvedTask) => Promise<void>
}) => {
    const isUser = msg.role === "user"
    const tasks = !isUser && msg.tasks ? msg.tasks.map((t) => resolveTask(t, selectedDate)) : []
    return (
        <View style={{ gap: 6, alignItems: isUser ? "flex-end" : "flex-start", marginBottom: 10 }}>
            <View style={[s.bubble, isUser ? s.bubbleUser : s.bubbleAssistant]}>
                <Text style={[s.bubbleText, isUser ? s.bubbleTextUser : s.bubbleTextAssistant]}>{msg.content}</Text>
            </View>
            {tasks.map((task, i) => (
                <TaskCard key={i} task={task} onCreate={() => onCreate(task)} />
            ))}
        </View>
    )
}

const TaskCard = ({ task, onCreate }: { task: ResolvedTask; onCreate: () => Promise<void> }) => {
    const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle")

    const onAdd = async () => {
        setStatus("loading")
        try {
            await onCreate()
            setStatus("done")
        } catch {
            setStatus("error")
        }
    }

    return (
        <View style={s.taskCard}>
            <View style={s.taskInfo}>
                <Text style={s.taskName}>{task.title}</Text>
                <Text style={s.taskMeta}>
                    {task.begin}–{task.end} · {moment(task.date).format("DD MMM")}
                    {task.isRepeat && task.repeatFrequency ? ` · repeats ${task.repeatFrequency}` : ""}
                </Text>
                {!!task.desc && <Text style={s.taskDesc}>{task.desc}</Text>}
                {task.todos.length > 0 && (
                    <View style={s.todoList}>
                        {task.todos.map((todo, i) => (
                            <View key={i} style={s.todoRow}>
                                <View style={s.todoDot} />
                                <Text style={s.todoText}>{todo}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
            {status === "done" ? (
                <Ionicons name="checkmark-circle" size={26} color={Colors.secondary} />
            ) : status === "error" ? (
                <GlassView tintColor={Colors.error} style={s.addBtn}>
                    <Pressable style={s.iconBtnInner} onPress={onAdd}>
                        <Ionicons name="refresh" size={14} color="#fff" />
                    </Pressable>
                </GlassView>
            ) : (
                <GlassView
                    tintColor={status === "loading" ? undefined : Colors.secondary}
                    style={[s.addBtn, status === "loading" && { opacity: 0.6 }, { height: 40 }]}
                >
                    <Pressable style={s.iconBtnInner} onPress={onAdd} disabled={status === "loading"}>
                        {status === "loading" ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={s.addBtnText}>Add</Text>
                        )}
                    </Pressable>
                </GlassView>
            )}
        </View>
    )
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.primary },
    headerCenter: { flexDirection: "row", alignItems: "center", gap: 6 },
    headerTitle: { color: Colors.secondary, fontWeight: "700", fontSize: 16 },
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: "rgba(255,255,255,0.08)" },
    chat: { flex: 1 },
    chatContent: { padding: 16, paddingBottom: 8 },
    emptyHint: { paddingVertical: 40, alignItems: "center" },
    hintText: { color: Colors.foreground_secondary, fontSize: 14, lineHeight: 22, textAlign: "center" },
    bubble: { maxWidth: "82%", borderRadius: 16, padding: 12 },
    bubbleUser: { backgroundColor: Colors.secondary, borderBottomRightRadius: 4 },
    bubbleAssistant: {
        backgroundColor: Colors.primary_light,
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: Colors.primary_lighter,
    },
    bubbleText: { fontSize: 14, lineHeight: 20 },
    bubbleTextUser: { color: "#fff" },
    bubbleTextAssistant: { color: Colors.foreground },
    thinkingBubble: {
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: Colors.primary_light,
        borderRadius: 16,
        borderBottomLeftRadius: 4,
        padding: 12,
        borderWidth: 1,
        borderColor: Colors.primary_lighter,
        maxWidth: "82%",
        marginBottom: 8,
    },
    streamText: { color: Colors.foreground_secondary, fontSize: 12 },
    taskCard: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: Colors.primary_light,
        borderRadius: 14,
        padding: 12,
        borderWidth: 1,
        borderColor: Colors.primary_lighter,
        gap: 10,
        width: "100%",
    },
    taskInfo: { flex: 1, gap: 3 },
    taskName: { color: Colors.foreground, fontSize: 14, fontWeight: "600" },
    taskMeta: { color: Colors.secondary, fontSize: 12, fontWeight: "500" },
    taskDesc: { color: Colors.foreground_secondary, fontSize: 12 },
    todoList: { gap: 4, marginTop: 4 },
    todoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    todoDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.foreground_secondary },
    todoText: { color: Colors.foreground_secondary, fontSize: 11, flex: 1 },
    addBtn: {
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        minWidth: 54,
        alignItems: "center",
        overflow: "hidden",
    },
    addBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
    errorBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: Color(Colors.error).alpha(0.1).string(),
        borderRadius: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: Color(Colors.error).alpha(0.3).string(),
        marginBottom: 8,
    },
    errorText: { color: Colors.error, fontSize: 13, flex: 1 },
    inputRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
        backgroundColor: Colors.primary_lighter,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: Color(Colors.primary_lighter).lighten(2.5).string(),
        height: 90,
    },
    textInput: {
        flex: 1,
        borderRadius: 100,
        fontSize: 16,
        maxHeight: 80,
    },
    iconBtn: {
        width: 50,
        height: 50,
        borderRadius: 100,
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
    },
    iconBtnInner: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    voiceRow: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12, justifyContent: "space-between" },
    micBtn: {
        flexDirection: "row",
        alignItems: "center",
        width: 150,
        height: 56,
        borderRadius: 28,
        overflow: "hidden",
        justifyContent: "center",
    },
    micBtnInner: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingHorizontal: 16,
    },
    micHint: { flex: 1, color: Colors.foreground_secondary, fontSize: 13 },
})
