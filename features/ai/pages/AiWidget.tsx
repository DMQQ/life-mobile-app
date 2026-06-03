import Colors from "@/constants/Colors"
import { FONTS } from "@/constants/Fonts"
import Text from "@/components/ui/Text/Text"
import GlassView from "@/components/ui/GlassView"
import Header from "@/components/ui/Header/Header"
import { Feather } from "@expo/vector-icons"
import { Pressable, StyleSheet, View } from "react-native"
import Animated from "react-native-reanimated"
import useTrackScroll from "@/utils/hooks/ui/useTrackScroll"
import { useAiConversations } from "../hooks/useAiConversations"
import ConversationListItem from "../components/ConversationListItem"
import Background from "@/components/ui/Background"
import { SafeAreaView } from "react-native-safe-area-context"

export default function AiWidget({ navigation }: any) {
    const [scrollY, onAnimatedScrollHandler] = useTrackScroll({ screenName: "AiScreens" })
    const { conversations } = useAiConversations()

    return (
        <SafeAreaView edges={["top"]} style={s.container}>
            <Header
                scrollY={scrollY}
                title="AI Assistant"
                buttons={[{ icon: "square.and.pencil", onPress: () => navigation.navigate("AiChatScreen") }]}
            />
            <Background />

            <Animated.ScrollView
                onScroll={onAnimatedScrollHandler}
                style={{ flex: 1 }}
                contentContainerStyle={s.scroll}
            >
                <GlassView style={s.heroCard}>
                    <View style={s.heroIcon}>
                        <Feather name="zap" size={28} color={Colors.secondary} />
                    </View>
                    <Text style={s.heroTitle}>Your AI companion</Text>
                    <Text style={s.heroSubtitle}>
                        Ask about your finances, goals, schedule, or anything else. I have full context of your data.
                    </Text>
                    <Pressable style={s.startBtn} onPress={() => navigation.navigate("AiChatScreen")}>
                        <GlassView tintColor={Colors.secondary} style={s.startBtnInner}>
                            <Feather name="message-circle" size={16} color="#fff" />
                            <Text style={s.startBtnText}>New conversation</Text>
                            <Feather name="arrow-right" size={16} color="#fff" />
                        </GlassView>
                    </Pressable>
                </GlassView>

                {conversations.length > 0 && (
                    <View style={s.section}>
                        <Text style={s.sectionTitle}>Recent</Text>
                        {conversations.slice(0, 10).map((conv) => (
                            <ConversationListItem
                                key={conv.id}
                                conversation={conv}
                                onPress={() => navigation.navigate("AiChatScreen", { conversationId: conv.id })}
                            />
                        ))}
                    </View>
                )}
            </Animated.ScrollView>
        </SafeAreaView>
    )
}

const s = StyleSheet.create({
    container: { flex: 1 },
    scroll: { paddingHorizontal: 15, paddingTop: 80, paddingBottom: 100, gap: 24 },
    heroCard: { borderRadius: 25, padding: 24, alignItems: "center", gap: 12 },
    heroIcon: {
        width: 60,
        height: 60,
        borderRadius: 100,
        backgroundColor: `${Colors.secondary}22`,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 4,
    },
    heroTitle: { fontSize: 22, fontFamily: FONTS.bold, color: Colors.foreground, textAlign: "center" },
    heroSubtitle: {
        fontSize: 14,
        color: Colors.foreground_secondary,
        textAlign: "center",
        lineHeight: 20,
        paddingHorizontal: 8,
    },
    startBtn: { marginTop: 8, alignSelf: "stretch" },
    startBtnInner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 14,
        borderRadius: 100,
    },
    startBtnText: { color: "#fff", fontFamily: FONTS.semibold, fontSize: 15 },
    section: { gap: 8 },
    sectionTitle: {
        fontSize: 13,
        color: Colors.foreground_secondary,
        fontFamily: FONTS.semibold,
        marginBottom: 4,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
})
