import { FONTS } from "@/constants/Fonts"
import Colors from "@/constants/Colors"
import Color from "color"
import { LinearGradient } from "expo-linear-gradient"
import React from "react"
import { StyleSheet, View, Text } from "react-native"

const AI_A = "#7C3AED"
const AI_B = "#06B6D4"
const AI_BG = Color(Colors.primary_lighter).mix(Color(AI_A), 0.22).hex()

export function ChartPreview() {
    const heights = [20, 35, 28, 42, 18, 38, 30]
    return (
        <View style={s.preview}>
            <View style={s.chartRow}>
                {heights.map((h, i) => (
                    <View
                        key={i}
                        style={[
                            s.bar,
                            {
                                height: h,
                                backgroundColor: i === 3 ? Colors.secondary : Color(Colors.secondary).alpha(0.4).string(),
                            },
                        ]}
                    />
                ))}
            </View>
        </View>
    )
}

export function CategoriesPreview() {
    const segments = [
        { flex: 2, color: Colors.secondary },
        { flex: 1.5, color: Colors.ternary },
        { flex: 1, color: Colors.positive },
        { flex: 1.2, color: Colors.negative },
        { flex: 0.8, color: "#FFE66D" },
    ]
    const dots = [Colors.secondary, Colors.ternary, Colors.positive, Colors.negative]
    return (
        <View style={s.preview}>
            <View style={s.segBar}>
                {segments.map((seg, i) => (
                    <View key={i} style={[s.segment, { flex: seg.flex, backgroundColor: seg.color }]} />
                ))}
            </View>
            <View style={s.legendRow}>
                {dots.map((c, i) => (
                    <View key={i} style={s.legendItem}>
                        <View style={[s.dot, { backgroundColor: c }]} />
                        <View style={[s.legendLine, { width: 20 + i * 4 }]} />
                    </View>
                ))}
            </View>
        </View>
    )
}

export function ExtrasPreview() {
    const rows = [
        { fill: 0.7, color: Colors.positive },
        { fill: 0.45, color: Colors.secondary },
        { fill: 0.9, color: Colors.negative },
    ]
    return (
        <View style={s.preview}>
            {rows.map((r, i) => (
                <View key={i} style={s.limitRow}>
                    <View style={[s.limitSquare, { backgroundColor: r.color }]} />
                    <View style={s.track}>
                        <View style={[s.trackFill, { width: `${r.fill * 100}%` as any, backgroundColor: r.color }]} />
                    </View>
                </View>
            ))}
        </View>
    )
}

export function BalancePreview() {
    return (
        <View style={s.preview}>
            <View style={s.balanceBlock} />
            <View style={s.chipsRow}>
                <View style={[s.chip, { backgroundColor: Color(Colors.positive).alpha(0.25).string() }]} />
                <View style={[s.chip, { backgroundColor: Color(Colors.negative).alpha(0.25).string() }]} />
            </View>
        </View>
    )
}

export function WeekLifePreview() {
    const eventAccents = ["#5B9CF6", "#FF5F57", "#5B9CF6"]
    const expColors = [Colors.negative, Colors.positive]
    return (
        <View style={s.preview}>
            <View style={{ flexDirection: "row", gap: 3, marginBottom: 5 }}>
                {Array.from({ length: 7 }).map((_, i) => (
                    <View
                        key={i}
                        style={[
                            s.daySq,
                            i === 4 && { backgroundColor: Color(Colors.secondary).alpha(0.25).string() },
                        ]}
                    />
                ))}
            </View>
            {eventAccents.map((accent, i) => (
                <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 3 }}>
                    <View style={[s.dot, { backgroundColor: accent }]} />
                    <View style={[s.tLine, { width: 55 + i * 12, backgroundColor: Color(accent).alpha(0.5).string() }]} />
                    <View style={[s.tLine, { flex: 1, backgroundColor: Color(Colors.foreground).alpha(0.06).string() }]} />
                    <View style={[s.tLine, { width: 20, backgroundColor: Color(expColors[i % 2]).alpha(0.4).string() }]} />
                </View>
            ))}
        </View>
    )
}

export function QuickStatsPreview() {
    return (
        <View style={[s.preview, { flexDirection: "row", gap: 6 }]}>
            <View style={[s.statTile, { backgroundColor: Color(Colors.negative).alpha(0.12).string() }]}>
                <View style={[s.statDot, { backgroundColor: Color(Colors.negative).alpha(0.25).string() }]} />
                <View style={[s.tLine, { width: 36, backgroundColor: Color(Colors.negative).alpha(0.6).string(), height: 5 }]} />
                <View style={[s.tLine, { width: 28, backgroundColor: Color(Colors.foreground).alpha(0.1).string() }]} />
            </View>
            <View style={[s.statTile, { backgroundColor: Color(Colors.ternary).alpha(0.12).string() }]}>
                <View style={[s.statDot, { backgroundColor: Color(Colors.ternary).alpha(0.25).string() }]} />
                <View style={[s.tLine, { width: 36, backgroundColor: Color(Colors.ternary).alpha(0.6).string(), height: 5 }]} />
                <View style={[s.tLine, { width: 28, backgroundColor: Color(Colors.foreground).alpha(0.1).string() }]} />
            </View>
        </View>
    )
}

export function AiInsightPreview() {
    return (
        <View style={[s.preview, { padding: 0, overflow: "hidden", borderRadius: 10 }]}>
            <LinearGradient colors={[AI_BG, Color(Colors.primary_lighter).mix(Color(AI_B), 0.14).hex()]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
            <View style={{ padding: 10, gap: 6 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                    <LinearGradient colors={[AI_A, AI_B]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ borderRadius: 100, paddingHorizontal: 6, paddingVertical: 2 }}>
                        <Text style={{ fontSize: 7, fontFamily: FONTS.extrabold, color: "#fff" }}>AI</Text>
                    </LinearGradient>
                    <View style={[s.tLine, { width: 40, backgroundColor: "rgba(255,255,255,0.15)" }]} />
                </View>
                <View style={[s.tLine, { width: 90, height: 5, backgroundColor: "rgba(255,255,255,0.6)" }]} />
                <View style={[s.tLine, { width: 70, backgroundColor: "rgba(255,255,255,0.25)" }]} />
            </View>
        </View>
    )
}

export function UpcomingBillsPreview() {
    const rows = [
        { color: Colors.secondary, days: "2d", w: 55 },
        { color: Colors.ternary ?? Colors.positive, days: "5d", w: 70 },
        { color: Colors.positive, days: "12d", w: 45 },
    ]
    return (
        <View style={[s.preview, { justifyContent: "space-around" }]}>
            {rows.map((r, i) => (
                <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: Color(r.color).alpha(0.2).string() }} />
                    <View style={[s.tLine, { flex: 1, backgroundColor: "rgba(255,255,255,0.12)" }]} />
                    <View style={[s.tLine, { width: r.w, backgroundColor: Color(r.color).alpha(0.5).string() }]} />
                    <View style={{ paddingHorizontal: 5, paddingVertical: 2, borderRadius: 100, backgroundColor: Color(Colors.warning).alpha(0.15).string() }}>
                        <Text style={{ fontSize: 7, color: Colors.warning, fontFamily: FONTS.bold }}>{r.days}</Text>
                    </View>
                </View>
            ))}
        </View>
    )
}

export function EventCompletionPreview() {
    const bars = [0, 0.6, 1, 0.4, 1, 1, 0.8, 0.3, 1, 0.7, 0, 1, 0.9, 0.6]
    const color = (r: number) =>
        r === 1 ? Colors.positive : r >= 0.5 ? Colors.secondary : r > 0 ? Colors.warning : "transparent"
    return (
        <View style={[s.preview, { flexDirection: "column", justifyContent: "flex-end", gap: 4 }]}>
            <View style={{ flexDirection: "row", gap: 2, alignItems: "center" }}>
                <View style={[s.tLine, { width: 22, height: 5, backgroundColor: Color(Colors.positive).alpha(0.8).string() }]} />
                <View style={[s.tLine, { width: 14, height: 4, backgroundColor: Color(Colors.text_dark).alpha(0.4).string() }]} />
            </View>
            <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 2, height: 38 }}>
                {bars.map((r, i) => (
                    <View
                        key={i}
                        style={{
                            flex: 1,
                            height: r > 0 ? Math.max(r * 38, 3) : 2,
                            backgroundColor:
                                r > 0 ? Color(color(r)).alpha(0.75).string() : "rgba(255,255,255,0.05)",
                            borderRadius: 3,
                        }}
                    />
                ))}
            </View>
        </View>
    )
}

export function GoalsPreview() {
    const colors = [Colors.secondary, Colors.ternary, "#FF6B6B", "#4ECDC4", "#A29BFE"]
    const rows = [
        [1, 1, 0, 1, 1, 0, 1],
        [1, 0, 1, 1, 0, 1, 1],
        [0, 1, 1, 1, 1, 0, 0],
    ]
    return (
        <View style={s.preview}>
            {rows.map((row, ri) => (
                <View key={ri} style={s.goalRow}>
                    <View style={s.goalIconPH} />
                    {row.map((filled, ci) => (
                        <View
                            key={ci}
                            style={[
                                s.goalCell,
                                {
                                    backgroundColor: filled
                                        ? Color(colors[ri]).alpha(0.8).string()
                                        : Color(colors[ri]).alpha(0.12).string(),
                                },
                            ]}
                        />
                    ))}
                </View>
            ))}
        </View>
    )
}

const s = StyleSheet.create({
    preview: {
        height: 62,
        paddingHorizontal: 12,
        paddingVertical: 8,
        justifyContent: "center",
    },
    chartRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 4,
        height: 44,
    },
    bar: {
        flex: 1,
        borderRadius: 3,
    },
    segBar: {
        flexDirection: "row",
        height: 10,
        borderRadius: 5,
        overflow: "hidden",
        marginBottom: 6,
    },
    segment: {
        height: 10,
    },
    legendRow: {
        flexDirection: "row",
        gap: 8,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    legendLine: {
        height: 4,
        borderRadius: 2,
        backgroundColor: Color("gray").alpha(0.35).string(),
    },
    timelineRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginVertical: 2,
    },
    eventDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
    },
    timelineLines: {
        flex: 1,
        gap: 3,
    },
    tLine: {
        height: 4,
        borderRadius: 2,
    },
    limitRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginVertical: 2,
    },
    limitSquare: {
        width: 8,
        height: 8,
        borderRadius: 2,
    },
    track: {
        flex: 1,
        height: 4,
        borderRadius: 2,
        backgroundColor: Color("gray").alpha(0.2).string(),
        overflow: "hidden",
    },
    trackFill: {
        height: 4,
        borderRadius: 2,
    },
    balanceBlock: {
        height: 22,
        width: 110,
        borderRadius: 6,
        backgroundColor: Color(Colors.foreground).alpha(0.1).string(),
        marginBottom: 8,
    },
    chipsRow: {
        flexDirection: "row",
        gap: 8,
    },
    chip: {
        height: 14,
        width: 60,
        borderRadius: 100,
    },
    weekStrip: {
        flexDirection: "row",
        gap: 4,
        marginBottom: 6,
    },
    dayCol: {
        flex: 1,
        alignItems: "center",
        gap: 2,
    },
    daySq: {
        width: 16,
        height: 16,
        borderRadius: 4,
        backgroundColor: Color(Colors.foreground).alpha(0.06).string(),
    },
    dotCluster: {
        flexDirection: "row",
        gap: 1,
        height: 4,
    },
    eDot: {
        width: 3,
        height: 3,
        borderRadius: 2,
    },
    eLine: {
        height: 4,
        borderRadius: 2,
        backgroundColor: Color(Colors.text_dark).alpha(0.4).string(),
        marginTop: 3,
    },
    goalRow: {
        flexDirection: "row",
        gap: 3,
        marginVertical: 2,
        alignItems: "center",
    },
    goalIconPH: {
        width: 10,
        height: 10,
        borderRadius: 2,
        backgroundColor: Color(Colors.foreground).alpha(0.1).string(),
    },
    goalCell: {
        flex: 1,
        aspectRatio: 1,
        borderRadius: 3,
    },
    statTile: {
        flex: 1,
        borderRadius: 10,
        padding: 8,
        gap: 4,
        justifyContent: "center",
    },
    statDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        marginBottom: 2,
    },
})
