import Colors from "@/constants/Colors"
import Text from "@/components/ui/Text/Text"
import { ActivityIndicator, StyleSheet, View } from "react-native"
import Color from "color"
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

interface Props {
    tint: string
}

export default function ThinkingBubble({ tint }: Props) {
    const [msg] = useState(() => THINKING_MESSAGES[Math.floor(Math.random() * THINKING_MESSAGES.length)])
    return (
        <View style={s.container}>
            <ActivityIndicator size="small" color={tint} />
            <Text style={[s.text, { color: Color(Colors.foreground).alpha(0.5).string() }]}>{msg}</Text>
        </View>
    )
}

const s = StyleSheet.create({
    container: {
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        borderRadius: 16,
        borderBottomLeftRadius: 4,
        padding: 12,
        marginBottom: 8,
        backgroundColor: Colors.primary_lighter,
        borderWidth: 1,
        borderColor: Colors.foreground_hairline,
    },
    text: { fontSize: 13 },
})
