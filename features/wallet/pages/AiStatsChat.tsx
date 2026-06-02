import { FONTS } from "@/constants/Fonts"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import { AntDesign, Ionicons } from "@expo/vector-icons"
import { gql, useMutation, useQuery } from "@apollo/client"
import Color from "color"
import { useCallback, useMemo, useRef, useState } from "react"
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Header, IconButton } from "@/components"
import GlassView from "@/components/ui/GlassView"
import { WalletScreens } from "../Main"
import SkillCard from "../components/AiChat/SkillCard"
import DatePicker from "@/components/DatePicker"
import dayjs from "dayjs"

export interface AiChatMessageItem {
    type: string
    data: any
    subtype?: string
}

const MESSAGE_FIELDS = gql`
    fragment AiChatMessageFields on AiChatMessageItem {
        type
        data
        subtype
    }
`

export const STATISTICS_AI_CHAT = gql`
    ${MESSAGE_FIELDS}
    mutation StatisticsAiChat($input: AiChatInput!) {
        aiChat(input: $input) {
            messages {
                ...AiChatMessageFields
            }
        }
    }
`

export const GET_AI_HISTORY = gql`
    ${MESSAGE_FIELDS}
    query GetStatisticsAiChatHistory {
        aiChatHistory {
            messages {
                ...AiChatMessageFields
            }
        }
    }
`

const THINKING_MESSAGES = [
    "Interrogating your wallet…",
    "Reading financial tea leaves…",
    "Crunching numbers (ew)…",
    "Consulting the oracle…",
    "Staring intensely at charts…",
    "Doing math so you don't have to…",
    "Summoning fiscal insights…",
    "Judging your spending habits…",
    "Pretending to be an accountant…",
    "Finding patterns in the chaos…",
]

interface ChatMessage {
    id: string
    role: "user" | "assistant"
    content: string
    items?: AiChatMessageItem[]
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

function AssistantBubble({ msg, startDate, endDate }: { msg: ChatMessage; startDate: string; endDate: string }) {
    const groups = groupItems(msg.items || [])
    return (
        <View style={{ gap: 6, alignItems: "flex-start", marginBottom: 10 }}>
            {groups.map((group, gi) => {
                if (group.kind === "group") {
                    return (
                        <View key={gi} style={{ alignSelf: "stretch" }}>
                            {group.items.map(({ item, index }) => (
                                <SkillCard key={index} skill={item} startDate={startDate} endDate={endDate} />
                            ))}
                        </View>
                    )
                }
                const { item, index } = group
                if (item.type === "text") {
                    const text = item.data?.trim()
                    if (!text) return null
                    return (
                        <View key={index} style={[s.bubble, s.bubbleAssistant]}>
                            <Text style={[s.bubbleText, s.bubbleTextAssistant]}>{text}</Text>
                        </View>
                    )
                }
                return <SkillCard key={index} skill={item} startDate={startDate} endDate={endDate} />
            })}
        </View>
    )
}

export default function AiStatsChat({ route, navigation }: WalletScreens<"AiStatsChat">) {
    const { startDate, endDate } = route.params
    const [date, setDate] = useState({ start: dayjs(startDate).toDate(), end: dayjs(endDate).toDate() })
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [inputText, setInputText] = useState("")
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState("")
    const [thinkingMsg] = useState(() => THINKING_MESSAGES[Math.floor(Math.random() * THINKING_MESSAGES.length)])
    const [showHistory, setShowHistory] = useState(false)

    const scrollRef = useRef<FlatList>(null)
    const [chat] = useMutation(STATISTICS_AI_CHAT)

    const scrollToBottom = useCallback(() => {
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80)
    }, [])

    const send = useCallback(
        async (text: string) => {
            const trimmed = text.trim()
            if (!trimmed || busy) return

            const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: trimmed }
            setMessages((prev) => [...prev, userMsg])
            setBusy(true)
            setError("")
            scrollToBottom()

            try {
                const history = messages.map((m) => ({
                    role: m.role,
                    content:
                        m.role === "assistant"
                            ? (m.items || [])
                                  .filter((it) => it.type === "text")
                                  .map((it) => it.data)
                                  .join(" ")
                            : m.content,
                }))
                const { data, errors } = await chat({
                    variables: {
                        input: { message: trimmed, startDate, endDate, history },
                    },
                })
                if (errors) {
                    console.log(JSON.stringify(errors, null, 2))
                }
                const result = data?.aiChat
                if (!result) throw new Error("Empty response")
                setMessages((prev) => [
                    ...prev,
                    {
                        id: (Date.now() + 1).toString(),
                        role: "assistant",
                        content: "",
                        items: result.messages ?? [],
                    },
                ])
                scrollToBottom()
            } catch (e: any) {
                console.log("Chat error", JSON.stringify(e, null, 2))
                setError(e?.graphQLErrors?.[0]?.message ?? e?.message ?? "Connection failed.")
            } finally {
                setBusy(false)
            }
        },
        [busy, messages, chat, startDate, endDate, scrollToBottom],
    )

    const canSend = inputText.trim().length > 0 && !busy

    const { data } = useQuery(GET_AI_HISTORY)

    const memoMessages = useMemo(() => {
        if (!showHistory) return messages
        return (data?.aiChatHistory || []).map((item: any, index: number) => ({
            id: `history-${index}`,
            role: "assistant" as const,
            content: "",
            items: item.messages || [],
        }))
    }, [data, messages, showHistory])

    return (
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: Colors.primary }}>
            <SafeAreaView style={s.container} edges={["top"]}>
                <Header
                    shadow={false}
                    backIcon={<AntDesign name="close" size={20} color="#fff" />}
                    goBack
                    isScreenModal
                    initialHeight={80}
                    buttons={[
                        {
                            onPress() {},
                            icon: "",
                            children: (
                                <DatePicker
                                    buttonComponent={() => (
                                        <IconButton icon={<Ionicons name="calendar" size={20} color="#fff" />} />
                                    )}
                                    dates={date}
                                    setDates={setDate}
                                    mode="period"
                                />
                            ),
                        },
                    ]}
                >
                    <View style={s.headerCenter}>
                        <Ionicons name="sparkles" size={16} color={Colors.secondary} />
                        <Text style={s.headerTitle}>AI Statistics</Text>
                    </View>
                </Header>

                <View style={[s.divider, { marginTop: 80 }]} />

                <View style={s.statsSection}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
                        <Pressable
                            style={[s.chip, showHistory && s.chipActive]}
                            onPress={() => setShowHistory(!showHistory)}
                        >
                            <Text style={[s.chipText, showHistory && s.chipTextActive]}>Show previous</Text>
                        </Pressable>
                    </ScrollView>
                </View>

                <View style={s.divider} />

                <FlatList
                    ref={scrollRef}
                    style={s.chat}
                    contentContainerStyle={s.chatContent}
                    data={memoMessages}
                    keyExtractor={(m) => m.id}
                    onContentSizeChange={scrollToBottom}
                    ListEmptyComponent={
                        <View style={s.emptyHint}>
                            <Text style={s.hintText}>Ask anything about your finances.</Text>
                        </View>
                    }
                    renderItem={({ item: msg }) => {
                        if (msg.role === "user") {
                            return (
                                <View style={{ alignItems: "flex-end", marginBottom: 10 }}>
                                    <View style={[s.bubble, s.bubbleUser]}>
                                        <Text style={[s.bubbleText, s.bubbleTextUser]}>{msg.content}</Text>
                                    </View>
                                </View>
                            )
                        }
                        return <AssistantBubble msg={msg} startDate={startDate} endDate={endDate} />
                    }}
                    ListFooterComponent={
                        <>
                            {busy && (
                                <View style={s.thinkingBubble}>
                                    <ActivityIndicator size="small" color={Colors.secondary} />
                                    <Text style={s.streamText}>{thinkingMsg}</Text>
                                </View>
                            )}
                            {!!error && (
                                <View style={s.errorBox}>
                                    <AntDesign name="exclamation-circle" size={14} color={Colors.danger} />
                                    <Text style={s.errorText}>{error}</Text>
                                </View>
                            )}
                        </>
                    }
                />

                <KeyboardAvoidingView
                    style={s.inputRow}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={120}
                >
                    <GlassView style={s.textInput}>
                        <TextInput
                            style={s.textInputInner}
                            value={inputText}
                            onChangeText={setInputText}
                            placeholder="Ask about your spending…"
                            placeholderTextColor={Colors.foreground_disabled}
                            onSubmitEditing={() => {
                                const t = inputText
                                setInputText("")
                                send(t)
                            }}
                            returnKeyType="send"
                            editable={!busy}
                            multiline
                        />
                    </GlassView>
                    <GlassView
                        tintColor={canSend ? Colors.secondary : undefined}
                        style={[s.iconBtn, !canSend && { opacity: 0.4 }]}
                    >
                        <Pressable
                            style={s.iconBtnInner}
                            disabled={!canSend}
                            onPress={() => {
                                const t = inputText
                                setInputText("")
                                send(t)
                            }}
                        >
                            <Ionicons name="send" size={20} color="#fff" />
                        </Pressable>
                    </GlassView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </KeyboardAvoidingView>
    )
}

const s = StyleSheet.create({
    container: { flex: 1 },
    headerCenter: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        position: "absolute",
        left: 0,
        right: 0,
        justifyContent: "center",
    },
    headerTitle: { color: Colors.secondary, fontFamily: FONTS.bold, fontSize: 16 },
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: "rgba(255,255,255,0.08)" },
    statsSection: { paddingTop: 10, paddingBottom: 8 },
    chips: { paddingHorizontal: 16, gap: 8, flexDirection: "row" },
    chip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: Colors.primary_light,
        borderWidth: 1,
        borderColor: Colors.primary_lighter,
    },
    chipActive: { backgroundColor: Color(Colors.secondary).alpha(0.2).string(), borderColor: Colors.secondary },
    chipText: { color: Colors.foreground_secondary, fontSize: 12 },
    chipTextActive: { color: Colors.secondary, fontFamily: FONTS.semibold },
    chat: { flex: 1 },
    chatContent: { padding: 16, paddingBottom: 24 },
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
        marginBottom: 8,
    },
    streamText: { color: Colors.foreground_secondary, fontSize: 12 },
    errorBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: Color(Colors.danger).alpha(0.1).string(),
        borderRadius: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: Color(Colors.danger).alpha(0.3).string(),
        marginBottom: 8,
    },
    errorText: { color: Colors.danger, fontSize: 13, flex: 1 },
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
})
