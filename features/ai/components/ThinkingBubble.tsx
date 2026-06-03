import Colors from "@/constants/Colors"
import Text from "@/components/ui/Text/Text"
import GlassView from "@/components/ui/GlassView"
import { ActivityIndicator, StyleSheet } from "react-native"
import { useState } from "react"

const THINKING_MESSAGES = [
    "Thinking…",
    "Working on it…",
    "Crunching data…",
    "On it…",
    "Processing…",
    "Consulting the oracle…",
    "Gathering context…",
    "Checking the math…",
    "Reading between lines…",
    "Squinting at data…",
    "Finding the thread…",
]

export default function ThinkingBubble() {
    const [msg] = useState(() => THINKING_MESSAGES[Math.floor(Math.random() * THINKING_MESSAGES.length)])
    return (
        <GlassView style={s.container}>
            <ActivityIndicator size="small" color={Colors.secondary} />
            <Text style={s.text}>{msg}</Text>
        </GlassView>
    )
}

const s = StyleSheet.create({
    container: {
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        borderRadius: 16,
        borderBottomLeftRadius: 4,
        padding: 12,
        marginBottom: 8,
    },
    text: { color: Colors.foreground_secondary, fontSize: 12 },
})
