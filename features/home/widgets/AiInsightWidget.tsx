import { FONTS } from "@/constants/Fonts"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import { Feather } from "@expo/vector-icons"
import Color from "color"
import { LinearGradient } from "expo-linear-gradient"
import { useState } from "react"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import Svg, { Defs, LinearGradient as SvgGrad, Path, Polyline, Stop } from "react-native-svg"
import Section from "@/components/ui/Section"

const AI_A = "#7C3AED"
const AI_B = "#06B6D4"

const CARD_BG_TOP = Color(Colors.primary_lighter).mix(Color(AI_A), 0.42).hex()
const CARD_BG_BOT = Color(Colors.primary_lighter).mix(Color(AI_B), 0.18).hex()

const INSIGHTS = [
    {
        headline: "Spending is down 23% vs last month",
        detail: "Mostly fewer restaurant visits and impulse purchases.",
        metric: "−23%",
        positive: true,
        trend: [420, 390, 450, 375, 310, 290, 265],
    },
    {
        headline: "You completed 80% of this week's events",
        detail: "Best streak in the last 30 days — keep it up.",
        metric: "80%",
        positive: true,
        trend: [5, 4, 6, 5, 7, 8, 8],
    },
    {
        headline: "Food & drinks is 34% of your expenses",
        detail: "Up from 28% last month. Consider setting a limit.",
        metric: "34%",
        positive: false,
        trend: [90, 105, 95, 130, 120, 145, 160],
    },
    {
        headline: "3 subscriptions renew in the next 7 days",
        detail: "Total upcoming charge: 89 zł. Review before renewal.",
        metric: "89 zł",
        positive: false,
        trend: [20, 20, 20, 20, 20, 49, 89],
    },
]

function Sparkline({ values, color }: { values: number[]; color: string }) {
    const W = 82
    const H = 46
    const PAD = 4
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min || 1

    const xs = values.map((_, i) => PAD + (i / (values.length - 1)) * (W - PAD * 2))
    const ys = values.map((v) => PAD + (1 - (v - min) / range) * (H - PAD * 2))
    const pts = xs.map((x, i) => `${x},${ys[i]}`).join(" ")
    const area = `M ${xs[0]},${H} ` + xs.map((x, i) => `L ${x},${ys[i]}`).join(" ") + ` L ${xs[xs.length - 1]},${H} Z`

    return (
        <Svg width={W} height={H}>
            <Defs>
                <SvgGrad id="fill" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor={color} stopOpacity="0.4" />
                    <Stop offset="1" stopColor={color} stopOpacity="0" />
                </SvgGrad>
            </Defs>
            <Path d={area} fill="url(#fill)" />
            <Polyline
                points={pts}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    )
}

export default function AiInsightWidget() {
    const [idx, setIdx] = useState(0)
    const insight = INSIGHTS[idx]
    const accentColor = insight.positive ? Colors.positive : Colors.warning
    const next = () => setIdx((i) => (i + 1) % INSIGHTS.length)

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
                                {idx + 1}/{INSIGHTS.length}
                            </Text>
                        </View>

                        <Text style={s.headline} numberOfLines={2}>
                            {insight.headline}
                        </Text>

                        <Text variant="caption" style={s.detail} numberOfLines={2}>
                            {insight.detail}
                        </Text>
                    </View>

                    <View style={s.right}>
                        <Sparkline values={insight.trend} color={accentColor} />
                        <View style={[s.metricBadge, { backgroundColor: Color(accentColor).alpha(0.18).string() }]}>
                            <Text style={[s.metric, { color: accentColor }]}>{insight.metric}</Text>
                        </View>
                    </View>
                </View>

                <View style={s.footer}>
                    <View style={s.dots}>
                        {INSIGHTS.map((_, i) => (
                            <View
                                key={i}
                                style={[
                                    s.dot,
                                    {
                                        backgroundColor:
                                            i === idx
                                                ? Color(AI_A)
                                                      .mix(Color(AI_B), i / INSIGHTS.length)
                                                      .hex()
                                                : Color(Colors.foreground).alpha(0.3).string(),
                                    },
                                    i === idx && s.dotActive,
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
        alignItems: "flex-end",
        justifyContent: "center",
        gap: 8,
    },
    metricBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 100,
        alignSelf: "flex-end",
    },
    metric: {
        fontSize: 15,
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
