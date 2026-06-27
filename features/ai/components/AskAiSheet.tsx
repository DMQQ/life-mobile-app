import Colors from "@/constants/Colors"
import Text from "@/components/ui/Text/Text"
import GlassView from "@/components/ui/GlassView"
import { Feather } from "@expo/vector-icons"
import Color from "color"
import { useCallback, useRef, useState } from "react"
import { Dimensions, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native"
import Animated, {
    Easing,
    Extrapolation,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withSpring,
    withTiming,
} from "react-native-reanimated"
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
    /** Bottom offset relative to the parent — matches where the trigger button sits */
    bottomOffset?: number
    /** Bottom position when panel is fully open — should clear the toolbar */
    openBottom?: number
    panelHeight?: number
}

const SPRING_OPEN = { damping: 18, stiffness: 200, mass: 0.6 }
const EASE_OUT = Easing.out(Easing.cubic)

const { width: SCREEN_W } = Dimensions.get("window")
const BTN_H = 44
const SCALE_CLOSED = BTN_H / (SCREEN_W - 30) // panel is left:15 right:15

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

    const animH = useSharedValue(0)
    const animR = useSharedValue(100)
    const animScaleX = useSharedValue(SCALE_CLOSED)
    const animBottom = useSharedValue(bottomOffset)
    const contentOp = useSharedValue(0)
    const triggerOp = useSharedValue(1)
    const triggerScale = useSharedValue(1)

    const panelStyle = useAnimatedStyle(() => {
        // When keyboard opens, subtract the open-lift from the keyboard push so the panel
        // sits at bottomOffset + kbOffset instead of openBottom + kbOffset.
        const kbOffset = -kbHeight.value // positive when keyboard is up
        const lift = animBottom.value - bottomOffset // 0 when closed, ~62 when open
        return {
            height: animH.value,
            borderRadius: animR.value,
            bottom: animBottom.value + kbOffset - Math.min(lift, kbOffset),
            transform: [{ scaleX: animScaleX.value }],
            opacity: interpolate(animH.value, [0, 12], [0, 1], Extrapolation.CLAMP),
        }
    })
    const contentStyle = useAnimatedStyle(() => ({ opacity: contentOp.value }))
    const triggerStyle = useAnimatedStyle(() => ({
        opacity: triggerOp.value,
        transform: [{ scale: triggerScale.value }],
    }))

    const handleOpen = () => {
        reset()
        setOpen(true)
        triggerOp.value = withTiming(0, { duration: 90 })
        triggerScale.value = withTiming(0.55, { duration: 110 })
        // Height: 0 → BTN_H (pill fades in from bubble, 80ms) → panelHeight (full panel, 210ms)
        // Width and height grow simultaneously from the start so the bubble visibly expands
        animH.value = withSequence(
            withTiming(BTN_H, { duration: 80, easing: EASE_OUT }),
            withTiming(panelHeight, { duration: 210, easing: EASE_OUT }),
        )
        animScaleX.value = withTiming(1, { duration: 220, easing: EASE_OUT })
        animBottom.value = withDelay(80, withTiming(openBottom, { duration: 230, easing: EASE_OUT }))
        animR.value = withDelay(80, withSpring(20, SPRING_OPEN))
        contentOp.value = withDelay(230, withTiming(1, { duration: 180 }))
    }

    const handleClose = () => {
        contentOp.value = withTiming(0, { duration: 50 })
        // All collapse simultaneously — no spring, no overshoot/jump
        animScaleX.value = withTiming(SCALE_CLOSED, { duration: 160, easing: EASE_OUT })
        animBottom.value = withTiming(bottomOffset, { duration: 160, easing: EASE_OUT })
        animR.value = withTiming(100, { duration: 140, easing: EASE_OUT })
        animH.value = withTiming(0, { duration: 170, easing: EASE_OUT }, () => {
            runOnJS(setOpen)(false)
        })
        triggerOp.value = withDelay(110, withTiming(1, { duration: 140 }))
        triggerScale.value = withDelay(110, withSpring(1, { damping: 14, stiffness: 220 }))
    }

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
            <Animated.View
                style={[s.triggerContainer, { bottom: bottomOffset }, triggerStyle]}
                pointerEvents={open ? "none" : "box-none"}
            >
                <Pressable onPress={handleOpen}>
                    <GlassView tintColor={tint} style={s.triggerBtn}>
                        <Feather name="zap" size={17} color="#fff" />
                    </GlassView>
                </Pressable>
            </Animated.View>

            <Animated.View style={[s.panel, panelStyle]}>
                <Animated.View
                    style={[s.content, contentStyle]}
                    pointerEvents={open ? "auto" : "none"}
                >
                    <View style={s.header}>
                        <View style={s.headerLeft}>
                            <Feather name="zap" size={14} color={tint} />
                            <Text style={s.headerTitle}>{label ?? "Ask AI"}</Text>
                        </View>
                        <Pressable hitSlop={12} onPress={handleClose}>
                            <Feather name="x" size={17} color={Colors.foreground_secondary} />
                        </Pressable>
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
                                <Text style={s.emptyHint}>Ask me anything about this {contextType}</Text>
                                <View style={s.chipRow}>
                                    {prompts.map((q) => (
                                        <Pressable key={q} onPress={() => handleSend(q)}>
                                            <GlassView style={[s.chip, { borderColor: Color(tint).alpha(0.3).string() }]}>
                                                <Text style={[s.chipText, { color: tint }]}>{q}</Text>
                                            </GlassView>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>
                        )}

                        {messages.map((msg) => {
                            if (msg.role === "user") {
                                return (
                                    <View key={msg.id} style={s.userRow}>
                                        <GlassView tintColor={tint} style={s.userBubble}>
                                            <Text style={s.userText}>{msg.userContent}</Text>
                                        </GlassView>
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

                        {busy && <ThinkingBubble />}

                        {!!error && (
                            <GlassView tintColor={Color(Colors.danger).alpha(0.1).string()} style={s.errorBox}>
                                <Feather name="alert-circle" size={13} color={Colors.danger} />
                                <Text style={s.errorText}>{error}</Text>
                            </GlassView>
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
                            <Pressable disabled={!input.trim() || busy} onPress={() => handleSend(input)}>
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
        backgroundColor: Colors.primary_lighter,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.foreground_hairline,
    },
    content: { flex: 1 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.foreground_hairline,
    },
    headerLeft: { flexDirection: "row", alignItems: "center", gap: 7 },
    headerTitle: { fontSize: 14, fontWeight: "600", color: Colors.foreground },
    messageList: { flex: 1 },
    messageContent: { padding: 12, gap: 6, flexGrow: 1 },
    emptyState: { flex: 1, justifyContent: "center", alignItems: "center", gap: 14, paddingVertical: 24 },
    emptyHint: { fontSize: 13, color: Colors.foreground_secondary, textAlign: "center" },
    chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" },
    chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, borderWidth: 1 },
    chipText: { fontSize: 12, fontWeight: "500" },
    userRow: { alignItems: "flex-end", marginBottom: 6 },
    userBubble: { maxWidth: "80%", borderRadius: 14, borderBottomRightRadius: 4, padding: 10 },
    userText: { color: "#fff", fontSize: 13, lineHeight: 19 },
    errorBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        borderRadius: 10,
        padding: 10,
        marginTop: 4,
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
