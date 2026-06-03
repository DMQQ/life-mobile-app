import Colors from "@/constants/Colors"
import Text from "@/components/ui/Text/Text"
import GlassView from "@/components/ui/GlassView"
import { Header, IconButton } from "@/components"
import { Feather } from "@expo/vector-icons"
import DatePicker from "@/components/DatePicker"
import Color from "color"
import dayjs from "dayjs"
import { useCallback, useRef, useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"
import Animated, { useAnimatedStyle } from "react-native-reanimated"
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller"
import { SafeAreaView } from "react-native-safe-area-context"
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition"
import { useAiChat } from "../hooks/useAiChat"
import AssistantBubble from "../components/AssistantBubble"
import ThinkingBubble from "../components/ThinkingBubble"
import ChatInput from "../components/ChatInput"
import type { Personality, Effort } from "../types"

export default function AiChatScreen({ route }: any) {
    const conversationId = route?.params?.conversationId as string | undefined

    const {
        messages,
        busy,
        error,
        send,
        reset,
        conversationId: activeConversationId,
        title,
    } = useAiChat(conversationId)
    const [inputText, setInputText] = useState("")
    const [isVoice, setIsVoice] = useState(false)
    const [partialText, setPartialText] = useState("")
    const [dates, setDates] = useState({ start: dayjs().startOf("month").toDate(), end: dayjs().toDate() })
    const [personality, setPersonality] = useState<Personality>("playful")
    const [effort, setEffort] = useState<Effort>("high")

    const { height } = useReanimatedKeyboardAnimation()
    const keyboardStyle = useAnimatedStyle(() => ({ transform: [{ translateY: height.value }] }))
    const listRef = useRef<any>(null)
    const finalTranscriptRef = useRef("")

    const scrollToBottom = useCallback(() => {
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80)
    }, [])

    const handleSend = useCallback(
        async (text: string) => {
            const trimmed = text.trim()
            if (!trimmed || busy) return
            setInputText("")
            const success = await send(
                trimmed,
                dayjs(dates.start).format("YYYY-MM-DD"),
                dayjs(dates.end).format("YYYY-MM-DD"),
                personality,
                effort,
            )
            if (!success) setInputText(trimmed)
            scrollToBottom()
        },
        [send, busy, dates, personality, effort, scrollToBottom],
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
        setIsVoice(false)
        setPartialText("")
    })

    useSpeechRecognitionEvent("error", () => {
        setIsVoice(false)
    })

    const startVoice = useCallback(async () => {
        const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync()
        if (!granted) return
        finalTranscriptRef.current = ""
        setPartialText("")
        setIsVoice(true)
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
        setIsVoice(false)
    }, [])

    const startDate = dayjs(dates.start).format("YYYY-MM-DD")
    const endDate = dayjs(dates.end).format("YYYY-MM-DD")

    return (
        <SafeAreaView style={s.container} edges={["top"]}>
            <Header
                animated={false}
                goBack
                title={title}
                buttons={[
                    {
                        icon: "slider.horizontal.3",
                        disabled: !!activeConversationId,
                        contextMenu: {
                            items: [
                                {
                                    title: "Personality",
                                    systemImage: "person.fill",
                                    children: [
                                        {
                                            title: "Playful",
                                            systemImage: "face.smiling",
                                            onPress: () => setPersonality("playful"),
                                            checked: personality === "playful",
                                        },
                                        {
                                            title: "Finance",
                                            systemImage: "chart.bar.fill",
                                            onPress: () => setPersonality("finance"),
                                            checked: personality === "finance",
                                        },
                                        {
                                            title: "Helpful",
                                            systemImage: "lightbulb.fill",
                                            onPress: () => setPersonality("helpful"),
                                            checked: personality === "helpful",
                                        },
                                    ],
                                },
                                {
                                    title: "Effort",
                                    systemImage: "bolt.fill",
                                    children: [
                                        {
                                            title: "High — GPT-4o",
                                            systemImage: "bolt.fill",
                                            onPress: () => setEffort("high"),
                                            checked: effort === "high",
                                        },
                                        {
                                            title: "Low — GPT-4o mini",
                                            systemImage: "bolt",
                                            onPress: () => setEffort("low"),
                                            checked: effort === "low",
                                        },
                                    ],
                                },
                            ],
                        },
                    },
                ]}
            />

            <View style={s.divider} />

            <Animated.View style={[{ flex: 1 }, keyboardStyle]}>
                <Animated.FlatList
                    ref={listRef}
                    style={s.list}
                    contentContainerStyle={s.listContent}
                    data={messages}
                    keyExtractor={(m) => m.id}
                    onContentSizeChange={scrollToBottom}
                    ListEmptyComponent={
                        <View style={s.emptyHint}>
                            <Feather name="zap" size={32} color={Colors.secondary} style={{ marginBottom: 12 }} />
                            <Text style={s.hintText}>Ask me anything — finances, schedule, tasks, goals.</Text>
                        </View>
                    }
                    renderItem={({ item: msg }) => {
                        if (msg.role === "user") {
                            return (
                                <View style={s.userRow}>
                                    <GlassView style={{ padding: 2, borderRadius: 100 }}>
                                        <IconButton
                                            onPress={() => handleSend(msg.userContent)}
                                            icon={<Feather name="refresh-cw" size={14} color="#fff" />}
                                        />
                                    </GlassView>
                                    <GlassView tintColor={Colors.secondary} style={[s.bubble, s.bubbleUser]}>
                                        <Text style={[s.bubbleText, s.bubbleTextUser]}>{msg.userContent}</Text>
                                    </GlassView>
                                </View>
                            )
                        }
                        if (msg.status === "error") return null
                        return <AssistantBubble aiMessages={msg.aiMessages} startDate={startDate} endDate={endDate} />
                    }}
                    ListFooterComponent={
                        <>
                            {isVoice && partialText ? (
                                <View style={{ alignItems: "flex-end", marginBottom: 8 }}>
                                    <GlassView style={[s.bubble, s.bubbleUser, { opacity: 0.55 }]}>
                                        <Text style={[s.bubbleText, s.bubbleTextUser]}>{partialText}</Text>
                                    </GlassView>
                                </View>
                            ) : null}
                            {busy ? <ThinkingBubble /> : null}
                            {!!error ? (
                                <GlassView tintColor={s.errorBox.backgroundColor} style={s.errorBox}>
                                    <Feather name="alert-circle" size={14} color={Colors.danger} />
                                    <Text style={s.errorText}>{error}</Text>
                                </GlassView>
                            ) : null}
                            {!busy && messages.length > 0 && (
                                <View style={{ alignItems: "center", marginBottom: 20 }}>
                                    <GlassView tintColor={Colors.primary_lighter} style={s.clearBtn}>
                                        <Pressable onPress={reset}>
                                            <Text style={s.clearBtnText}>New conversation</Text>
                                        </Pressable>
                                    </GlassView>
                                </View>
                            )}
                        </>
                    }
                />

                <Animated.View style={s.inputRow}>
                    <ChatInput
                        value={inputText}
                        onChangeText={setInputText}
                        onSend={() => handleSend(inputText)}
                        onStartVoice={startVoice}
                        onStopVoice={stopVoice}
                        isRecording={isVoice && !busy}
                        partialText={partialText}
                        busy={busy}
                    />
                </Animated.View>
            </Animated.View>
        </SafeAreaView>
    )
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.primary },
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: "rgba(255,255,255,0.08)" },
    list: { flex: 1 },
    listContent: { padding: 16, paddingTop: 80, paddingBottom: 100 },
    emptyHint: { paddingVertical: 60, alignItems: "center", paddingHorizontal: 32 },
    hintText: { color: Colors.foreground_secondary, fontSize: 14, lineHeight: 22, textAlign: "center" },
    userRow: { alignItems: "center", marginBottom: 10, flexDirection: "row", gap: 8, justifyContent: "flex-end" },
    bubble: { maxWidth: "82%", borderRadius: 16, padding: 12 },
    bubbleUser: { borderBottomRightRadius: 4 },
    bubbleText: { fontSize: 14, lineHeight: 20 },
    bubbleTextUser: { color: "#fff" },
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
        paddingHorizontal: 15,
        paddingBottom: 15,
        paddingTop: 8,
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
    },
    calendarBtn: { width: 35, height: 35, alignItems: "center", justifyContent: "center" },
    clearBtn: { padding: 8, paddingHorizontal: 16, borderRadius: 100 },
    clearBtnText: { color: "#fff", fontSize: 14 },
})
