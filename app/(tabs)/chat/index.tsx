import { router } from "expo-router"
import { ScrollView, StyleSheet, Pressable, View } from "react-native"
import { SymbolView } from "expo-symbols"
import { Feather } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import GlassView from "@/components/ui/GlassView"

const HINTS = [
    { icon: "trending-up", label: "How much did I spend this month?" },
    { icon: "pie-chart", label: "What are my top expense categories?" },
    { icon: "target", label: "How are my goals progressing?" },
    { icon: "calendar", label: "What's on my schedule today?" },
    { icon: "credit-card", label: "Any upcoming subscription bills?" },
    { icon: "bar-chart-2", label: "Compare this month vs last month" },
]

export default function ChatIndex() {
    const insets = useSafeAreaInsets()

    const openChat = () => router.navigate("/(tabs)/chat/ai" as any)

    return (
        <View style={[s.container, { paddingTop: insets.top }]}>
            <View style={s.hero}>
                <SymbolView name="sparkle" size={44} tintColor={Colors.secondary} />
                <Text style={s.title}>AI Assistant</Text>
                <Text style={s.subtitle}>Ask me about your finances, goals, or schedule.</Text>
            </View>

            <ScrollView contentContainerStyle={s.hints} showsVerticalScrollIndicator={false}>
                {HINTS.map((hint) => (
                    <Pressable key={hint.label} onPress={openChat}>
                        <GlassView style={s.hintCard}>
                            <Feather name={hint.icon as any} size={18} color={Colors.secondary} />
                            <Text style={s.hintText}>{hint.label}</Text>
                            <Feather name="chevron-right" size={16} color={Colors.foreground_secondary} />
                        </GlassView>
                    </Pressable>
                ))}
            </ScrollView>

            <View style={[s.footer, { paddingBottom: insets.bottom + 15 }]}>
                <Pressable onPress={openChat}>
                    <GlassView tintColor={Colors.secondary} style={s.startBtn}>
                        <Feather name="message-circle" size={20} color="#fff" />
                        <Text style={s.startBtnText}>Start a conversation</Text>
                    </GlassView>
                </Pressable>
            </View>
        </View>
    )
}

const s = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    hero: {
        alignItems: "center",
        paddingTop: 40,
        paddingBottom: 32,
        gap: 10,
        paddingHorizontal: 32,
    },
    title: {
        color: Colors.foreground,
        fontWeight: "700",
        fontSize: 26,
    },
    subtitle: {
        color: Colors.foreground_secondary,
        fontSize: 14,
        textAlign: "center",
        lineHeight: 20,
    },
    hints: {
        paddingHorizontal: 15,
        gap: 10,
        paddingBottom: 20,
    },
    hintCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 16,
        borderRadius: 16,
    },
    hintText: {
        flex: 1,
        color: Colors.foreground,
        fontSize: 14,
    },
    footer: {
        paddingHorizontal: 15,
        paddingTop: 10,
    },
    startBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        borderRadius: 100,
        paddingVertical: 16,
    },
    startBtnText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },
})
