import Colors from "@/constants/Colors"
import Text from "@/components/ui/Text/Text"
import GlassView from "@/components/ui/GlassView"
import { Feather } from "@expo/vector-icons"
import Color from "color"
import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react"
import { FlatList, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native"
import Animated, { useAnimatedStyle } from "react-native-reanimated"
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller"
import { BottomSheet, Group, Host, RNHostView } from "@expo/ui/swift-ui"
import {
    presentationDetents,
    presentationDragIndicator,
    background,
    containerRelativeFrame,
} from "@expo/ui/swift-ui/modifiers"
import { AiContextType, useContextAiChat } from "../hooks/useContextAiChat"
import AssistantBubble from "./AssistantBubble"
import ThinkingBubble from "./ThinkingBubble"
import dayjs from "dayjs"

export interface AskAiSheetNativeRef {
    open: () => void
    close: () => void
}

interface Props {
    contextType: AiContextType
    contextId: string
    tint: string
    quickPrompts?: string[]
    placeholder?: string
    label?: string
}

const DEFAULT_PROMPTS: Record<AiContextType, string[]> = {
    expense: ["Summarize this expense", "Is this amount typical?", "Compare to last month"],
    subscription: ["Is this worth keeping?", "How much have I spent on this?", "When is the next charge?"],
    goal: ["Am I on track?", "How long until I reach the goal?", "Tips to progress faster"],
    event: ["Summarize this event", "How often does this repeat?", "What's coming up next?"],
}

const AskAiSheetNative = forwardRef<AskAiSheetNativeRef, Props>(function AskAiSheetNative(
    { contextType, contextId, tint, quickPrompts, placeholder, label },
    ref,
) {
    const [open, setOpen] = useState(false)
    const [input, setInput] = useState("")
    const scrollRef = useRef<ScrollView>(null)

    const today = dayjs().format("YYYY-MM-DD")

    const { messages, busy, error, send, reset, title } = useContextAiChat({ contextType, contextId })

    const keyboard = useReanimatedKeyboardAnimation()

    const rootStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: keyboard.height.value / 2 }],
    }))

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

    useImperativeHandle(
        ref,
        () => ({
            open() {
                reset()
                setOpen(true)
            },
            close() {
                setOpen(false)
            },
        }),
        [reset],
    )

    const prompts = quickPrompts ?? DEFAULT_PROMPTS[contextType]
    const hasMessages = messages.length > 0 || busy

    return (
        <Host style={{ position: "absolute" }}>
            <BottomSheet
                isPresented={open}
                onIsPresentedChange={(presented) => {
                    if (!presented) setOpen(false)
                }}
            >
                <Group
                    modifiers={[
                        containerRelativeFrame({ axes: "both" }),
                        presentationDetents(["medium", "large"]),
                        presentationDragIndicator("visible"),
                        background(Colors.primary),
                    ]}
                >
                    <RNHostView>
                        <View style={[s.root]}>
                            {title && (
                                <View style={s.header}>
                                    <Text variant="subtitle" weight="600" color={Colors.foreground}>
                                        {title ?? label ?? "Ask AI"}
                                    </Text>
                                </View>
                            )}

                            <ScrollView
                                ref={scrollRef}
                                style={s.messageList}
                                contentContainerStyle={s.messageContent}
                                showsVerticalScrollIndicator={false}
                                keyboardDismissMode="interactive"
                            >
                                {!hasMessages && (
                                    <View style={s.emptyState}>
                                        <View style={s.orbWrap}>
                                            <View
                                                style={[
                                                    s.orbRingOuter,
                                                    { backgroundColor: Color(tint).alpha(0.07).string() },
                                                ]}
                                            />
                                            <View
                                                style={[
                                                    s.orbRingInner,
                                                    { backgroundColor: Color(tint).alpha(0.14).string() },
                                                ]}
                                            />
                                            <GlassView tintColor={tint} style={s.orbCore}>
                                                <Feather name="zap" size={18} color="#fff" />
                                            </GlassView>
                                        </View>

                                        <View style={s.emptyText}>
                                            <Text
                                                variant="subtitle"
                                                weight="600"
                                                color={Colors.foreground}
                                                align="center"
                                            >
                                                What do you want to know?
                                            </Text>
                                            <Text variant="caption" align="center" muted>
                                                Ask me anything about this {contextType}
                                            </Text>
                                        </View>

                                        <FlatList
                                            data={prompts}
                                            horizontal
                                            showsHorizontalScrollIndicator={false}
                                            keyExtractor={(q) => q}
                                            contentContainerStyle={s.chipRow}
                                            renderItem={({ item: q }) => (
                                                <Pressable
                                                    onPress={() => handleSend(q)}
                                                    style={({ pressed }) => (pressed ? s.chipPressed : undefined)}
                                                >
                                                    <View
                                                        style={[
                                                            s.chip,
                                                            {
                                                                backgroundColor: Color(tint).alpha(0.1).string(),
                                                                borderColor: Color(tint).alpha(0.28).string(),
                                                            },
                                                        ]}
                                                    >
                                                        <Feather name="zap" size={11} color={tint} />
                                                        <Text size={13} weight="500" color={tint}>
                                                            {q}
                                                        </Text>
                                                    </View>
                                                </Pressable>
                                            )}
                                        />
                                    </View>
                                )}

                                {messages.map((msg) => {
                                    if (msg.role === "user") {
                                        return (
                                            <View key={msg.id} style={s.userRow}>
                                                <View
                                                    style={[
                                                        s.userBubble,
                                                        {
                                                            backgroundColor: Color(tint).alpha(0.18).string(),
                                                            borderColor: Color(tint).alpha(0.35).string(),
                                                        },
                                                    ]}
                                                >
                                                    <Text variant="body">{msg.userContent}</Text>
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
                                        <Feather name="alert-circle" size={14} color={Colors.danger} />
                                        <Text variant="caption" color={Colors.danger} flex={1}>
                                            {error}
                                        </Text>
                                    </View>
                                )}
                            </ScrollView>

                            <Animated.View style={[s.inputRow, rootStyle]}>
                                <View style={s.inputWrap}>
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
                                </View>
                            </Animated.View>
                        </View>
                    </RNHostView>
                </Group>
            </BottomSheet>
        </Host>
    )
})

export default AskAiSheetNative

const s = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    header: {
        flexDirection: "row",

        gap: 8,
        paddingTop: 18,
        paddingBottom: 14,
        paddingHorizontal: 20,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.foreground_hairline,
    },
    headerDot: {
        width: 26,
        height: 26,
        borderRadius: 100,
        alignItems: "center",
        justifyContent: "center",
    },

    messageList: { flex: 1 },
    messageContent: {
        padding: 14,
        gap: 4,
        flex: 1,
    },

    emptyState: {
        alignItems: "center",
        paddingTop: 36,
        gap: 16,
        flex: 1,
        justifyContent: "center",
        backgroundColor: "blue",
    },
    orbWrap: {
        width: 86,
        height: 86,
        alignItems: "center",
        justifyContent: "center",
    },
    orbRingOuter: {
        position: "absolute",
        width: 86,
        height: 86,
        borderRadius: 100,
    },
    orbRingInner: {
        position: "absolute",
        width: 60,
        height: 60,
        borderRadius: 100,
    },
    orbCore: {
        width: 42,
        height: 42,
        borderRadius: 100,
        alignItems: "center",
        justifyContent: "center",
    },
    emptyText: {
        alignItems: "center",
        gap: 5,
    },
    chipRow: {
        gap: 8,
    },
    chip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 100,
        borderWidth: 1,
    },
    chipPressed: {
        opacity: 0.65,
    },

    userRow: { alignItems: "flex-end", marginBottom: 4 },
    userBubble: {
        maxWidth: "80%",
        borderRadius: 14,
        borderBottomRightRadius: 4,
        padding: 12,
        borderWidth: 1,
    },
    errorBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        borderRadius: 10,
        padding: 12,
        marginTop: 4,
        backgroundColor: Color(Colors.danger).alpha(0.1).string(),
    },

    inputRow: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: Colors.foreground_hairline,
        backgroundColor: Colors.primary,
    },
    inputWrap: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 100,
        paddingHorizontal: 16,
        paddingVertical: 6,
        gap: 8,
        backgroundColor: Colors.primary_light,
        borderWidth: 1,
        borderColor: Colors.foreground_hairline,
    },
    textInput: {
        flex: 1,
        color: Colors.foreground,
        fontSize: 15,
        paddingVertical: 8,
    },
    sendBtn: {
        width: 36,
        height: 36,
        borderRadius: 100,
        alignItems: "center",
        justifyContent: "center",
    },
    sendBtnDim: { opacity: 0.4 },
})
