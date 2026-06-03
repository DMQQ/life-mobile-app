import { FONTS } from "@/constants/Fonts"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import { Feather } from "@expo/vector-icons"
import Color from "color"
import { LinearGradient } from "expo-linear-gradient"
import { useState } from "react"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import Section from "@/components/ui/Section"
import { gql, useQuery } from "@apollo/client"

const AI_A = "#7C3AED"
const AI_B = "#06B6D4"

const CARD_BG_TOP = Color(Colors.primary_lighter).mix(Color(AI_A), 0.42).hex()
const CARD_BG_BOT = Color(Colors.primary_lighter).mix(Color(AI_B), 0.18).hex()

const AI_INSIGHTS = gql`
    query AiInsights {
        aiInsights {
            insights {
                title
                description
                topic
                value
                trend
            }
        }
    }
`

type InsightTopic =
    | "spending_trend"
    | "top_category"
    | "biggest_expense"
    | "income_balance"
    | "subscription_cost"
    | "goals_progress"
    | "upcoming_events"
    | "flashcard_mastery"
    | "exercise_activity"
    | "no_spend_streak"

type InsightTrend = "up" | "down" | "neutral"

interface AiInsight {
    title: string
    description: string
    topic: InsightTopic
    value?: string
    trend?: InsightTrend
}

interface AiInsightsData {
    aiInsights: { insights: AiInsight[] }
}

const TOPIC_META: Record<InsightTopic, { icon: React.ComponentProps<typeof Feather>["name"]; color: string }> = {
    spending_trend: { icon: "trending-up", color: Colors.secondary },
    top_category: { icon: "tag", color: Colors.ternary },
    biggest_expense: { icon: "credit-card", color: Colors.negative },
    income_balance: { icon: "bar-chart-2", color: Colors.positive },
    subscription_cost: { icon: "repeat", color: Colors.warning },
    goals_progress: { icon: "check-circle", color: Colors.positive },
    upcoming_events: { icon: "calendar", color: Colors.info },
    flashcard_mastery: { icon: "book-open", color: Colors.info },
    exercise_activity: { icon: "activity", color: Colors.chart_positive },
    no_spend_streak: { icon: "zap", color: Colors.secondary },
}

function topicIcon(insight: AiInsight): React.ComponentProps<typeof Feather>["name"] {
    if (insight.topic === "spending_trend") {
        return insight.trend === "down" ? "trending-down" : "trending-up"
    }
    return TOPIC_META[insight.topic].icon
}

function accentColor(insight: AiInsight): string {
    if (insight.trend === "up") return Colors.positive
    if (insight.trend === "down") return Colors.negative
    return TOPIC_META[insight.topic].color
}

export default function AiInsightWidget() {
    const [idx, setIdx] = useState(0)
    const { data } = useQuery<AiInsightsData>(AI_INSIGHTS)
    const insights = data?.aiInsights?.insights ?? []

    if (insights.length === 0) return null

    const safeIdx = idx % insights.length
    const insight = insights[safeIdx]
    const color = accentColor(insight)
    const icon = topicIcon(insight)
    const meta = TOPIC_META[insight.topic]

    const next = () => setIdx((i) => (i + 1) % insights.length)

    return (
        <Section title="AI Insight">
            <View style={s.card}>
                <LinearGradient
                    colors={[CARD_BG_TOP, CARD_BG_BOT]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />

                <View style={s.row}>
                    <View style={s.left}>
                        <View style={s.labelRow}>
                            <LinearGradient
                                colors={[AI_A, AI_B]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={s.badge}
                            >
                                <Feather name="cpu" size={9} color="#fff" />
                                <Text style={s.badgeText}>AI</Text>
                            </LinearGradient>
                            <Text variant="caption" style={s.counter}>
                                {safeIdx + 1}/{insights.length}
                            </Text>
                        </View>

                        <Text style={s.headline} numberOfLines={2}>
                            {insight.title}
                        </Text>

                        <Text variant="caption" style={s.detail}>
                            {insight.description}
                        </Text>
                    </View>

                    <View style={s.right}>
                        <View
                            style={[
                                s.iconCircle,
                                {
                                    backgroundColor: Color(meta.color).alpha(0.15).string(),
                                    borderColor: Color(meta.color).alpha(0.35).hex(),
                                    borderWidth: 1,
                                },
                            ]}
                        >
                            <Feather name={icon} size={22} color={meta.color} />
                        </View>
                        {insight.value != null && (
                            <View style={[s.metricBadge, { backgroundColor: Color(color).alpha(0.18).string() }]}>
                                <Text style={[s.metric, { color }]}>{insight.value}</Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={s.footer}>
                    <View style={s.dots}>
                        {insights.map((_, i) => (
                            <View
                                key={i}
                                style={[
                                    s.dot,
                                    {
                                        backgroundColor:
                                            i === safeIdx
                                                ? Color(AI_A)
                                                      .mix(Color(AI_B), i / insights.length)
                                                      .hex()
                                                : Color(Colors.foreground).alpha(0.3).string(),
                                    },
                                    i === safeIdx && s.dotActive,
                                ]}
                            />
                        ))}
                    </View>
                    <TouchableOpacity style={s.nextBtn} onPress={next} activeOpacity={0.7}>
                        <Text style={s.nextText}>Next insight</Text>
                        <Feather name="chevron-right" size={12} color={Color(AI_B).lighten(0.3).hex()} />
                    </TouchableOpacity>
                </View>
            </View>
        </Section>
    )
}

const s = StyleSheet.create({
    card: {
        borderRadius: 20,
        overflow: "hidden",
        padding: 18,
        gap: 14,
    },
    row: {
        flexDirection: "row",
        gap: 12,
    },
    left: {
        flex: 1,
        gap: 8,
    },
    labelRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    badge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 100,
    },
    badgeText: {
        fontSize: 9,
        fontFamily: FONTS.extrabold,
        color: "#fff",
        letterSpacing: 0.8,
    },
    counter: {
        color: Colors.foreground_secondary,
    },
    headline: {
        fontSize: 16,
        fontFamily: FONTS.bold,
        color: Colors.foreground,
        lineHeight: 22,
    },
    detail: {
        color: Colors.foreground_secondary,
        lineHeight: 18,
    },
    right: {
        width: 80,
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 100,
        alignItems: "center",
        justifyContent: "center",
    },
    metricBadge: {
        height: 28,
        minWidth: 65,
        paddingHorizontal: 10,
        borderRadius: 100,
        alignItems: "center",
        justifyContent: "center",
    },
    metric: {
        fontSize: 13,
        fontFamily: FONTS.extrabold,
        letterSpacing: -0.3,
    },
    footer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    dots: {
        flexDirection: "row",
        gap: 5,
        alignItems: "center",
    },
    dot: {
        width: 5,
        height: 5,
        borderRadius: 3,
    },
    dotActive: {
        width: 14,
    },
    nextBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
    },
    nextText: {
        fontSize: 12,
        color: Color(AI_B).lighten(0.3).hex(),
        fontFamily: FONTS.semibold,
    },
})
