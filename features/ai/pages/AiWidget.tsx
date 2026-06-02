import { FONTS } from "@/constants/Fonts"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import { Feather } from "@expo/vector-icons"
import { useQuery } from "@apollo/client"
import { Pressable, StyleSheet, View } from "react-native"
import Animated from "react-native-reanimated"
import GlassView from "@/components/ui/GlassView"
import Header from "@/components/ui/Header/Header"
import useTrackScroll from "@/utils/hooks/ui/useTrackScroll"
import { GET_AI_HISTORY, AiChatMessageItem } from "@/features/wallet/pages/AiStatsChat"

function HistoryPreviewItem({ item, onPress }: { item: { messages: AiChatMessageItem[] }; onPress: () => void }) {
    const firstText = item.messages.find((m) => m.type === "text")?.data?.trim()
    const dataCount = item.messages.filter((m) => m.type === "data").length

    if (!firstText && dataCount === 0) return null

    return (
        <Pressable onPress={onPress}>
            <GlassView style={s.historyItem}>
                <View style={s.historyIconWrap}>
                    <Feather name="zap" size={14} color={Colors.secondary} />
                </View>
                <View style={s.historyContent}>
                    {firstText ? (
                        <Text style={s.historyText} numberOfLines={2}>
                            {firstText}
                        </Text>
                    ) : (
                        <Text style={s.historyText}>
                            {dataCount} result{dataCount !== 1 ? "s" : ""}
                        </Text>
                    )}
                </View>
                <Feather name="chevron-right" size={16} color={Colors.foreground_secondary} />
            </GlassView>
        </Pressable>
    )
}

export default function AiWidget({ navigation }: any) {
    const [scrollY, onAnimatedScrollHandler] = useTrackScroll({ screenName: "AiScreens" })
    const { data } = useQuery(GET_AI_HISTORY)
    const history: { messages: AiChatMessageItem[] }[] = data?.aiChatHistory || []

    return (
        <View style={s.container}>
            <Header
                scrollY={scrollY}
                animated
                animatedTitle="AI Assistant"
                buttons={[
                    {
                        icon: "message",
                        onPress: () => navigation.navigate("AiChatScreen"),
                    },
                ]}
            />
            <Animated.ScrollView
                onScroll={onAnimatedScrollHandler}
                style={{ flex: 1, paddingTop: 60 }}
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
                            <Text style={s.startBtnText}>Start conversation</Text>
                            <Feather name="arrow-right" size={16} color="#fff" />
                        </GlassView>
                    </Pressable>
                </GlassView>

                {history.length > 0 && (
                    <View style={s.section}>
                        <Text style={s.sectionTitle}>Recent</Text>
                        {history.slice(0, 8).map((item, i) => (
                            <HistoryPreviewItem
                                key={i}
                                item={item}
                                onPress={() => navigation.navigate("AiChatScreen")}
                            />
                        ))}
                    </View>
                )}
            </Animated.ScrollView>
        </View>
    )
}

const s = StyleSheet.create({
    container: { flex: 1 },
    scroll: { paddingHorizontal: 15, paddingTop: 100, paddingBottom: 40, gap: 24 },
    heroCard: {
        borderRadius: 25,
        padding: 24,
        alignItems: "center",
        gap: 12,
    },
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
    historyItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 14,
        borderRadius: 16,
    },
    historyIconWrap: {
        width: 32,
        height: 32,
        borderRadius: 100,
        backgroundColor: `${Colors.secondary}22`,
        alignItems: "center",
        justifyContent: "center",
    },
    historyContent: { flex: 1 },
    historyText: { fontSize: 13, color: Colors.foreground, lineHeight: 18 },
})
