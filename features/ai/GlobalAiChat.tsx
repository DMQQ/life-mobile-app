import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import { Feather } from "@expo/vector-icons"
import { SymbolView } from "expo-symbols"
import { gql, useMutation, useQuery } from "@apollo/client"
import Color from "color"
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition"
import { useCallback, useEffect, useRef, useState } from "react"
import { ActivityIndicator, FlatList, Pressable, StyleSheet, TextInput, View } from "react-native"
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller"
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import GlassView from "@/components/ui/GlassView"
import { router } from "expo-router"
import SkillCard from "@/features/wallet/components/AiChat/SkillCard"
import { AiChatMessageItem, GET_AI_HISTORY } from "@/features/wallet/pages/AiStatsChat"
import dayjs from "dayjs"
import DatePicker from "@/components/DatePicker"
import { IconButton } from "@/components"
import IconBackButton from "@/components/ui/Button/IconBackButton"

const AI_CHAT = gql`
    mutation GlobalAiChat($input: AiChatInput!) {
        aiChat(input: $input) {
            messages {
                type
                data
                subtype
            }
        }
    }
`

const THINKING_MESSAGES = [
    "Thinking…",
    "Working on it…",
    "Consulting the oracle…",
    "Crunching data…",
    "On it…",
    "Processing…",
    "Consulting my digital crystal ball...",
    "Herding 1s and 0s into a straight line...",
    "Teaching a robot how to love (and calculate)...",
    "Searching the couch cushions of the internet...",
    "Loading the good response, please wait...",
    "Pondering life, the universe, and your query...",
    "Buffering my common sense...",
    "Asking the local mainframe for a favor...",
    "untangling thoughts...",
    "gathering context...",
    "squinting at data...",
    "checking the math...",
    "consulting the void...",
    "finding the thread...",
    "reading between lines...",
    "polishing the gears...",
    "overthinking it...",
    "guessing confidently...",
    "shuffling the deck...",
    "squinting at logic...",
    "untangling noodles...",
    "feeding the hamsters...",
    "checking my ego...",
    "ignoring distractions...",
    "loading personality...",
]

type InputMode = "voice" | "text"

interface ChatMessage {
    id: string
    role: "user" | "assistant"
    content: string
    items?: AiChatMessageItem[]
    status: "success" | "error" | "pending"
}

type ItemGroup =
    | { kind: "single"; item: AiChatMessageItem; index: number }
    | { kind: "group"; subtype: string; items: { item: AiChatMessageItem; index: number }[] }

function groupItems(items: AiChatMessageItem[]): ItemGroup[] {
    const groups: ItemGroup[] = []
    let i = 0
    while (i < items.length) {
        const item = items[i]
        if (item.type === "data") {
            const subtype = item.subtype ?? ""
            const group: { item: AiChatMessageItem; index: number }[] = [{ item, index: i }]
            while (i + 1 < items.length && items[i + 1].type === "data" && items[i + 1].subtype === subtype) {
                i++
                group.push({ item: items[i], index: i })
            }
            groups.push(
                group.length === 1 ? { kind: "single", item, index: i } : { kind: "group", subtype, items: group },
            )
        } else {
            groups.push({ kind: "single", item, index: i })
        }
        i++
    }
    return groups
}

function AssistantBubble({
    msg,
    startDate,
    endDate,
    onNavigate,
}: {
    msg: ChatMessage
    startDate: string
    endDate: string
    onNavigate?: () => void
}) {
    const groups = groupItems(msg.items || [])
    return (
        <View style={{ gap: 6, alignItems: "flex-start", marginBottom: 10 }}>
            {groups.map((group, gi) => {
                if (group.kind === "group") {
                    return (
                        <GlassView key={gi} style={{ alignSelf: "stretch" }}>
                            {group.items.map(({ item, index }) => (
                                <SkillCard
                                    key={index}
                                    skill={item}
                                    startDate={startDate}
                                    endDate={endDate}
                                    onNavigate={onNavigate}
                                />
                            ))}
                        </GlassView>
                    )
                }
                const { item, index } = group
                if (item.type === "text") {
                    const text = item.data?.trim()
                    if (!text) return null
                    return (
                        <GlassView key={index} style={[s.bubble, s.bubbleAssistant, { backgroundColor: undefined }]}>
                            <Text selectable style={[s.bubbleText, s.bubbleTextAssistant]}>
                                {text}
                            </Text>
                        </GlassView>
                    )
                }
                return (
                    <SkillCard
                        key={index}
                        skill={item}
                        startDate={startDate}
                        endDate={endDate}
                        onNavigate={onNavigate}
                    />
                )
            })}
        </View>
    )
}

export default function GlobalAiChat() {
    const close = () => router.back()
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [inputText, setInputText] = useState("")
    const [inputMode, setInputMode] = useState<InputMode>("text")
    const [partialText, setPartialText] = useState("")
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState("")
    const [showHistory, setShowHistory] = useState(false)
    const [dates, setDates] = useState<{ start: Date; end: Date }>({
        start: dayjs().startOf("month").toDate(),
        end: dayjs().toDate(),
    })

    const { height: keyboardHeight } = useReanimatedKeyboardAnimation()
    const insets = useSafeAreaInsets()

    const listRef = useRef<FlatList>(null)
    const finalTranscriptRef = useRef("")

    const [chat] = useMutation(AI_CHAT)
    const { data: historyData } = useQuery(GET_AI_HISTORY)

    const pulse = useSharedValue(1)
    useEffect(() => {
        pulse.value =
            inputMode === "voice" && busy
                ? withRepeat(withTiming(1.025, { duration: 700, easing: Easing.inOut(Easing.ease) }), -1, true)
                : withTiming(1, { duration: 200 })
    }, [inputMode, busy])
    const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }))
    const inputRowAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: keyboardHeight.value }],
    }))

    const scrollToBottom = useCallback(() => {
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80)
    }, [])

    const send = useCallback(
        async (text: string) => {
            const trimmed = text.trim()
            if (!trimmed || busy) return

            setInputText("")
            setMessages((prev) => [
                ...prev,
                { id: Date.now().toString(), role: "user", content: trimmed, status: "success" },
            ])
            setBusy(true)
            setError("")
            setPartialText("")
            scrollToBottom()

            try {
                const history = messages
                    .filter((m) => m.status === "success")
                    .map((m) => ({
                        role: m.role,
                        content:
                            m.role === "assistant"
                                ? (m.items || [])
                                      .filter((it) => it.type === "text")
                                      .map((it) => it.data)
                                      .join(" ")
                                : m.content,
                    }))
                const { data } = await chat({
                    variables: {
                        input: {
                            message: trimmed,
                            history,
                            startDate: dayjs(dates.start).format("YYYY-MM-DD"),
                            endDate: dayjs(dates.end).format("YYYY-MM-DD"),
                        },
                    },
                })
                const result = data?.aiChat
                if (!result) throw new Error("Empty response")

                setMessages((prev) => [
                    ...prev,
                    {
                        id: (Date.now() + 1).toString(),
                        role: "assistant",
                        content: "",
                        items: result.messages ?? [],
                        status: "success",
                    },
                ])
                scrollToBottom()
            } catch (e: any) {
                const errorMessage = e?.graphQLErrors?.[0]?.message ?? e?.message ?? "Connection failed."
                setError(errorMessage)
                setInputText(trimmed)
                setMessages((prev) => [
                    ...prev,
                    {
                        id: (Date.now() + 1).toString(),
                        role: "assistant",
                        content: errorMessage,
                        items: [],
                        status: "error",
                    },
                ])
            } finally {
                setBusy(false)
            }
        },
        [busy, messages, chat, scrollToBottom, dates],
    )

    useSpeechRecognitionEvent("result", (event) => {
        const best = event.results[0]?.transcript ?? ""
        if (event.isFinal) {
            finalTranscriptRef.current = best
            setPartialText("")
        } else {
            setPartialText(best)
        }
    })

    useSpeechRecognitionEvent("end", () => {
        const text = finalTranscriptRef.current
        if (!text) return
        finalTranscriptRef.current = ""
        setInputText(text)
        setInputMode("text")
        setPartialText("")
    })

    useSpeechRecognitionEvent("error", (e) => {
        setError(e.message || e.error)
        setBusy(false)
    })

    const startVoice = useCallback(async () => {
        const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync()
        if (!granted) {
            setError("Microphone permission denied.")
            return
        }
        finalTranscriptRef.current = ""
        setPartialText("")
        setError("")
        setInputMode("voice")
        ExpoSpeechRecognitionModule.start({
            lang: "pl-PL",
            interimResults: true,
            continuous: false,
            requiresOnDeviceRecognition: true,
            addsPunctuation: true,
        })
    }, [])

    const stopVoice = useCallback(() => {
        ExpoSpeechRecognitionModule.stop()
        setInputMode("text")
    }, [])

    const isRecording = inputMode === "voice" && !busy
    const canSend = inputText.trim().length > 0 && !busy

    const displayMessages = showHistory
        ? (historyData?.aiChatHistory || []).map((item: any, i: number) => ({
              id: `h-${i}`,
              role: "assistant" as const,
              content: "",
              items: item.messages || [],
              status: "success" as const,
          }))
        : messages

    return (
        <View style={[s.container, { paddingTop: insets.top }]}>
            <View style={s.header}>
                <IconBackButton onPress={close} />
                <View style={s.headerCenter}>
                    <SymbolView name="sparkle" size={16} tintColor={Colors.secondary} />
                    <Text style={s.headerTitle}>AI Assistant</Text>
                </View>
                <View style={{ flexDirection: "row", gap: 6 }}>
                    <GlassView style={s.iconBtn}>
                        <DatePicker
                            buttonComponent={() => (
                                <Pressable style={s.iconBtnInner}>
                                    <Feather name="calendar" size={20} color={Colors.foreground_secondary} />
                                </Pressable>
                            )}
                            dates={dates}
                            setDates={setDates}
                            mode="period"
                        />
                    </GlassView>
                    <GlassView style={s.iconBtn} {...(showHistory && { tintColor: Colors.secondary })}>
                        <Pressable style={s.iconBtnInner} onPress={() => setShowHistory((p) => !p)}>
                            <Feather
                                name="clock"
                                size={20}
                                color={showHistory ? "#fff" : Colors.foreground_secondary}
                            />
                        </Pressable>
                    </GlassView>
                </View>
            </View>

            <View style={s.divider} />

            <FlatList
                ref={listRef}
                style={s.chat}
                contentContainerStyle={[s.chatContent, { paddingBottom: insets.bottom + 110 }]}
                data={displayMessages}
                keyExtractor={(m) => m.id}
                onContentSizeChange={scrollToBottom}
                ListEmptyComponent={
                    <View style={s.emptyHint}>
                        <SymbolView name="sparkle" size={32} tintColor={Colors.secondary} style={{ marginBottom: 12 }} />
                        <Text style={s.hintText}>Ask me anything — finances, schedule, tasks, goals.</Text>
                    </View>
                }
                renderItem={({ item: msg, index }) => {
                    if (msg.role === "user") {
                        return (
                            <View style={s.userRow}>
                                <GlassView style={{ padding: 2, borderRadius: 100 }}>
                                    <IconButton
                                        onPress={() => send(msg.content)}
                                        icon={<Feather name="refresh-cw" size={15} color="#fff" />}
                                    />
                                </GlassView>
                                <GlassView
                                    tintColor={Colors.secondary}
                                    style={[s.bubble, s.bubbleUser, { backgroundColor: undefined }]}
                                >
                                    <Text style={[s.bubbleText, s.bubbleTextUser]}>{msg.content}</Text>
                                </GlassView>
                            </View>
                        )
                    }
                    return (
                        <AssistantBubble
                            msg={msg}
                            startDate={dayjs(dates.start).format("YYYY-MM-DD")}
                            endDate={dayjs(dates.end).format("YYYY-MM-DD")}
                            onNavigate={close}
                        />
                    )
                }}
                ListFooterComponent={
                    <>
                        {inputMode === "voice" && partialText ? (
                            <View style={{ alignItems: "flex-end", marginBottom: 8 }}>
                                <GlassView style={[s.bubble, s.bubbleUser, { opacity: 0.55 }]}>
                                    <Text style={[s.bubbleText, s.bubbleTextUser]}>{partialText}</Text>
                                </GlassView>
                            </View>
                        ) : null}
                        {busy ? <ThinkingBubble /> : null}
                        {!!error ? (
                            <GlassView tintColor={s.errorBox.backgroundColor} style={s.errorBox}>
                                <Feather name="alert-circle" size={14} color={Colors.error} />
                                <Text style={s.errorText}>{error}</Text>
                            </GlassView>
                        ) : null}
                        {!busy && !partialText && displayMessages.length > 0 && (
                            <View style={{ alignItems: "center", marginBottom: 20 }}>
                                <GlassView
                                    tintColor={Colors.primary_lighter}
                                    style={{ padding: 8, paddingHorizontal: 16, borderRadius: 100 }}
                                >
                                    <Pressable onPress={() => setMessages([])}>
                                        <Text style={{ color: "#fff", fontSize: 14 }}>Clear conversation</Text>
                                    </Pressable>
                                </GlassView>
                            </View>
                        )}
                    </>
                }
            />

            <Animated.View style={[s.inputRow, { bottom: insets.bottom + 15 }, inputRowAnimatedStyle]}>
                <GlassView style={s.inputInner}>
                    {isRecording ? (
                        <Animated.View style={[pulseStyle, { flex: 1 }]}>
                            <GlassView tintColor={Colors.error} style={s.voiceActiveRow}>
                                <Pressable style={s.voiceActiveInner} onPress={stopVoice}>
                                    <Feather name="square" size={20} color="#fff" />
                                    <Text style={s.voiceActiveText}>{partialText || "Listening… tap to stop"}</Text>
                                </Pressable>
                            </GlassView>
                        </Animated.View>
                    ) : (
                        <>
                            <GlassView style={s.iconBtn}>
                                <Pressable style={s.iconBtnInner} onPress={startVoice} disabled={busy}>
                                    <Feather name="mic" size={20} color={Colors.foreground_secondary} />
                                </Pressable>
                            </GlassView>
                            <GlassView style={s.textInput}>
                                <TextInput
                                    style={s.textInputInner}
                                    value={inputText}
                                    onChangeText={setInputText}
                                    placeholder="Ask anything…"
                                    placeholderTextColor={Colors.foreground_disabled}
                                    onSubmitEditing={() => send(inputText)}
                                    returnKeyType="send"
                                    editable={!busy}
                                    multiline
                                />
                            </GlassView>
                            <GlassView
                                tintColor={canSend ? Colors.secondary : undefined}
                                style={[s.iconBtn, !canSend && { opacity: 0.4 }]}
                            >
                                <Pressable style={s.iconBtnInner} disabled={!canSend} onPress={() => send(inputText)}>
                                    <Feather name="send" size={20} color="#fff" />
                                </Pressable>
                            </GlassView>
                        </>
                    )}
                </GlassView>
            </Animated.View>
        </View>
    )
}

const ThinkingBubble = () => {
    const [thinkingMsg, setThinkingMsg] = useState(
        () => THINKING_MESSAGES[Math.floor(Math.random() * THINKING_MESSAGES.length)],
    )

    useEffect(() => {
        const interval = setInterval(() => {
            setThinkingMsg(THINKING_MESSAGES[Math.floor(Math.random() * THINKING_MESSAGES.length)])
        }, 1500)
        return () => clearInterval(interval)
    }, [])

    return (
        <GlassView style={s.thinkingBubble}>
            <ActivityIndicator size="small" color={Colors.secondary} />
            <Text style={s.streamText}>{thinkingMsg}</Text>
        </GlassView>
    )
}

const s = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 8,
        justifyContent: "space-between",
    },
    headerCenter: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        position: "absolute",
        left: 0,
        right: 0,
    },
    headerTitle: { color: Colors.secondary, fontWeight: "700", fontSize: 16 },
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: "rgba(255,255,255,0.08)" },
    chat: { flex: 1 },
    chatContent: { padding: 16 },
    emptyHint: { paddingVertical: 60, alignItems: "center", paddingHorizontal: 32 },
    hintText: { color: Colors.foreground_secondary, fontSize: 14, lineHeight: 22, textAlign: "center" },
    userRow: { alignItems: "center", marginBottom: 10, flexDirection: "row", gap: 8, justifyContent: "flex-end" },
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
        marginBottom: 8,
    },
    streamText: { color: Colors.foreground_secondary, fontSize: 12 },
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
        position: "absolute",
        left: 15,
        right: 15,
    },
    inputInner: {
        borderRadius: 30,
        flexDirection: "row",
        alignItems: "flex-start",
        padding: 15,
        gap: 8,
        height: 90,
    },
    textInput: { flex: 1, borderRadius: 100 },
    textInputInner: { color: "#fff", paddingHorizontal: 16, paddingVertical: 12, height: 50 },
    iconBtn: {
        width: 50,
        height: 50,
        borderRadius: 100,
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
    },
    iconBtnInner: { width: "100%", height: "100%", justifyContent: "center", alignItems: "center" },
    voiceActiveRow: { borderRadius: 100, height: 60, overflow: "hidden" },
    voiceActiveInner: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 15 },
    voiceActiveText: { flex: 1, color: "#fff", fontSize: 13, opacity: 0.9 },
})
