import Colors from "@/constants/Colors"
import Text from "@/components/ui/Text/Text"
import GlassView from "@/components/ui/GlassView"
import { Feather } from "@expo/vector-icons"
import Color from "color"
import { useCallback, useRef, useState } from "react"
import { Dimensions, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native"
import Animated, {
    Extrapolation,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller"
import { AiContextType, useContextAiChat } from "../hooks/useContextAiChat"
import AssistantBubble from "./AssistantBubble"
import ThinkingBubble from "./ThinkingBubble"
import dayjs from "dayjs"

interface Props {
    contextType: AiContextType
    contextId: string
    tint: string
    quickPrompts?: string[]
    placeholder?: string
    label?: string
    bottomOffset?: number
    openBottom?: number
    panelHeight?: number
}

const SPRING_LIQUID = { damping: 14, stiffness: 180, mass: 0.7 }
const { width: SCREEN_W } = Dimensions.get("window")
const BTN_H = 44
const SCALE_CLOSED = BTN_H / (SCREEN_W - 30)

const DEFAULT_PROMPTS: Record<AiContextType, string[]> = {
    expense: ["Summarize this expense", "Is this amount typical?", "Compare to last month"],
    subscription: ["Is this worth keeping?", "How much have I spent on this?", "When is the next charge?"],
    goal: ["Am I on track?", "How long until I reach the goal?", "Tips to progress faster"],
    event: ["Summarize this event", "How often does this repeat?", "What's coming up next?"],
}

export default function AskAiSheet({
    contextType,
    contextId,
    tint,
    quickPrompts,
    placeholder,
    label,
    bottomOffset = 33,
    openBottom = 95,
    panelHeight = 420,
}: Props) {
    const [open, setOpen] = useState(false)
    const [input, setInput] = useState("")
    const scrollRef = useRef<ScrollView>(null)

    const today = dayjs().format("YYYY-MM-DD")

    const { messages, busy, error, send, reset } = useContextAiChat({ contextType, contextId })
    const { height: kbHeight } = useReanimatedKeyboardAnimation()

    const progress = useSharedValue(0)
    const isOpen = useSharedValue(false)

    const panelStyle = useAnimatedStyle(() => {
        const p = progress.value
        const kb = -kbHeight.value
        const lift = p * (openBottom - bottomOffset)
        const btm = bottomOffset + p * (openBottom - bottomOffset)
        const topCorner = interpolate(p, [0, 0.2], [100, 22], Extrapolation.CLAMP)
        const genieCorner = interpolate(p, [0, 0.4], [panelHeight * 0.3, 22], Extrapolation.CLAMP)
        return {
            height: panelHeight,
            borderTopLeftRadius: topCorner,
            borderTopRightRadius: topCorner,
            borderBottomLeftRadius: genieCorner,
            borderBottomRightRadius: genieCorner,
            bottom: btm + kb - Math.min(lift, kb),
            opacity: interpolate(p, [0, 0.02], [0, 1], Extrapolation.CLAMP),
            transform: [
                { scaleX: interpolate(p, [0, 0.3], [SCALE_CLOSED, 1], Extrapolation.CLAMP) },
                { scaleY: interpolate(p, [0.01, 0.3], [0.05, 1], Extrapolation.CLAMP) },
            ],
        }
    })
    const contentStyle = useAnimatedStyle(() => ({
        opacity: interpolate(progress.value, [0.25, 0.5], [0, 1], Extrapolation.CLAMP),
    }))
    const triggerStyle = useAnimatedStyle(() => ({
        opacity: interpolate(progress.value, [0, 0.05], [1, 0], Extrapolation.CLAMP),
        transform: [{ scale: interpolate(progress.value, [0, 0.05], [1, 0.6], Extrapolation.CLAMP) }],
    }))
    const dragHandleStyle = useAnimatedStyle(() => ({
        opacity: interpolate(progress.value, [0.15, 0.35], [0, 1], Extrapolation.CLAMP),
    }))

    const animateOpen = useCallback(() => {
        reset()
        setOpen(true)
        isOpen.value = true
        progress.value = withSpring(1, SPRING_LIQUID)
    }, [reset])

    const animateClose = useCallback(() => {
        isOpen.value = false
        progress.value = withSpring(0, SPRING_LIQUID, (finished) => {
            if (finished) runOnJS(setOpen)(false)
        })
    }, [])

    const closeTap = Gesture.Tap().onEnd(() => runOnJS(animateClose)())
    const collapsePan = Gesture.Pan()
        .onUpdate((e) => {
            const raw = 1 - e.translationY / panelHeight
            progress.value = raw < 0 ? raw * 0.3 : Math.min(1, raw)
        })
        .onEnd((e) => {
            const vel = -e.velocityY / panelHeight
            if (vel > 1.2 || progress.value > 0.3) {
                progress.value = withSpring(1, SPRING_LIQUID)
            } else {
                progress.value = withSpring(0, SPRING_LIQUID)
                isOpen.value = false
                runOnJS(setOpen)(false)
            }
        })
        .enabled(!busy)
        .minDistance(6)
    const collapseGesture = Gesture.Race(collapsePan, closeTap)

    const handleSend = useCallback(
        async (text: string) => {
            const trimmed = text.trim()
            if (!trimmed || busy) return
            setInput("")
            await send(trimmed)
            setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80)
        },
        [busy, send],
    )

    const prompts = quickPrompts ?? DEFAULT_PROMPTS[contextType]

    return (
        <>
            {/* trigger button — tap to open */}
            <Animated.View
                style={[s.triggerContainer, { bottom: bottomOffset }, triggerStyle]}
                pointerEvents={open ? "none" : "auto"}
            >
                <Pressable onPress={animateOpen} hitSlop={8}>
                    <GlassView tintColor={tint} style={s.triggerBtn}>
                        <Feather name="zap" size={17} color="#fff" />
                    </GlassView>
                </Pressable>
            </Animated.View>

            {/* panel — pan down to collapse */}
            <GestureDetector gesture={collapseGesture}>
                <Animated.View
                    style={[s.panel, s.panelOrigin, panelStyle]}
                    pointerEvents={open ? "auto" : "none"}
                >
                    <Animated.View style={[s.content, contentStyle]} pointerEvents={open ? "auto" : "none"}>
                        <Animated.View style={[s.dragHandleWrap, dragHandleStyle]}>
                            <View style={s.dragHandle} />
                        </Animated.View>

                        <View style={s.header}>
                            <Text style={s.headerTitle}>{label ?? "Ask AI"}</Text>
                            <GestureDetector gesture={closeTap}>
                                <GlassView style={s.closeBtn}>
                                    <Feather name="x" size={15} color={Colors.foreground_secondary} />
                                </GlassView>
                            </GestureDetector>
                        </View>

                        <ScrollView
                            ref={scrollRef}
                            style={s.messageList}
                            contentContainerStyle={s.messageContent}
                            showsVerticalScrollIndicator={false}
                            keyboardDismissMode="on-drag"
                        >
                            {messages.length === 0 && !busy && (
                                <View style={s.emptyState}>
                                    <View style={s.emptyIconWrap}>
                                        <GlassView tintColor={tint} style={s.emptyIcon}>
                                            <Feather name="zap" size={18} color="#fff" />
                                        </GlassView>
                                    </View>
                                    <Text style={s.emptyHint}>Ask me anything about this {contextType}</Text>
                                    <View style={s.chipRow}>
                                        {prompts.map((q) => (
                                            <Pressable key={q} onPress={() => handleSend(q)}>
                                                <View style={[s.chip, { borderColor: Color(tint).alpha(0.3).string() }]}>
                                                    <Text style={[s.chipText, { color: tint }]}>{q}</Text>
                                                </View>
                                            </Pressable>
                                        ))}
                                    </View>
                                </View>
                            )}

                            {messages.map((msg) => {
                                if (msg.role === "user") {
                                    return (
                                        <View key={msg.id} style={s.userRow}>
                                            <View style={[s.userBubble, { backgroundColor: Color(tint).alpha(0.18).string(), borderColor: Color(tint).alpha(0.35).string() }]}>
                                                <Text style={s.userText}>{msg.userContent}</Text>
                                            </View>
                                        </View>
                                    )
                                }
                                if (msg.status === "error") return null
                                return (
                                    <AssistantBubble
                                        key={msg.id}
                                        aiMessages={msg.aiMessages}
                                        startDate={today}
                                        endDate={today}
                                    />
                                )
                            })}

                            {busy && <ThinkingBubble tint={tint} />}

                            {!!error && (
                                <View style={s.errorBox}>
                                    <Feather name="alert-circle" size={13} color={Colors.danger} />
                                    <Text style={s.errorText}>{error}</Text>
                                </View>
                            )}
                        </ScrollView>

                        <View style={s.inputRow}>
                            <GlassView style={s.inputWrap}>
                                <TextInput
                                    style={s.textInput}
                                    value={input}
                                    onChangeText={setInput}
                                    placeholder={placeholder ?? `Ask about this ${contextType}…`}
                                    placeholderTextColor={Colors.foreground_disabled}
                                    returnKeyType="send"
                                    onSubmitEditing={() => handleSend(input)}
                                    editable={!busy}
                                />
                                <Pressable
                                    disabled={!input.trim() || busy}
                                    onPress={() => handleSend(input)}
                                >
                                    <GlassView
                                        tintColor={input.trim() && !busy ? tint : undefined}
                                        style={[s.sendBtn, (!input.trim() || busy) && s.sendBtnDim]}
                                    >
                                        <Feather name="send" size={14} color="#fff" />
                                    </GlassView>
                                </Pressable>
                            </GlassView>
                        </View>
                    </Animated.View>
                </Animated.View>
            </GestureDetector>
        </>
    )
}

const s = StyleSheet.create({
    triggerContainer: {
        position: "absolute",
        left: 0,
        right: 0,
        alignItems: "center",
    },
    triggerBtn: {
        width: 44,
        height: 44,
        borderRadius: 100,
        alignItems: "center",
        justifyContent: "center",
    },
    panel: {
        position: "absolute",
        left: 15,
        right: 15,
        overflow: "hidden",
        backgroundColor: Colors.primary_light,
        borderWidth: 1,
        borderColor: Colors.foreground_hairline,
    },
    panelOrigin: {
        transformOrigin: "50% 100%",
    },
    content: { flex: 1 },
    dragHandleWrap: {
        alignItems: "center",
        paddingTop: 8,
        paddingBottom: 2,
    },
    dragHandle: {
        width: 36,
        height: 5,
        borderRadius: 100,
        backgroundColor: Color(Colors.foreground).alpha(0.2).string(),
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.foreground_hairline,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: Colors.foreground,
    },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 100,
        alignItems: "center",
        justifyContent: "center",
    },
    messageList: { flex: 1 },
    messageContent: { padding: 12, gap: 4, flexGrow: 1 },
    emptyState: { flex: 1, justifyContent: "center", alignItems: "center", gap: 14, paddingVertical: 24 },
    emptyIconWrap: { marginBottom: 4 },
    emptyIcon: {
        width: 44,
        height: 44,
        borderRadius: 100,
        alignItems: "center",
        justifyContent: "center",
    },
    emptyHint: { fontSize: 13, color: Colors.foreground_secondary, textAlign: "center" },
    chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" },
    chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, borderWidth: 1 },
    chipText: { fontSize: 12, fontWeight: "500" },
    userRow: { alignItems: "flex-end", marginBottom: 4 },
    userBubble: {
        maxWidth: "80%",
        borderRadius: 14,
        borderBottomRightRadius: 4,
        padding: 10,
        borderWidth: 1,
    },
    userText: { color: Colors.foreground, fontSize: 13, lineHeight: 19 },
    errorBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        borderRadius: 10,
        padding: 10,
        marginTop: 4,
        backgroundColor: Color(Colors.danger).alpha(0.1).string(),
    },
    errorText: { color: Colors.danger, fontSize: 12, flex: 1 },
    inputRow: {
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: Colors.foreground_hairline,
    },
    inputWrap: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 100,
        paddingHorizontal: 14,
        paddingVertical: 5,
        gap: 8,
    },
    textInput: { flex: 1, color: Colors.foreground, fontSize: 14, paddingVertical: 8 },
    sendBtn: { width: 34, height: 34, borderRadius: 100, alignItems: "center", justifyContent: "center" },
    sendBtnDim: { opacity: 0.4 },
})
