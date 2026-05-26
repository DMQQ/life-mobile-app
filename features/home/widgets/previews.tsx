import Colors from "@/constants/Colors"
import Color from "color"
import React from "react"
import { StyleSheet, View } from "react-native"

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

export function TimelinePreview() {
    const rows = [
        { line1: 60, line2: 40 },
        { line1: 70, line2: 30 },
        { line1: 50, line2: 50 },
    ]
    return (
        <View style={s.preview}>
            {rows.map((r, i) => (
                <View key={i} style={s.timelineRow}>
                    <View style={[s.eventDot, { backgroundColor: i === 0 ? Colors.secondary : Color(Colors.secondary).alpha(0.4).string() }]} />
                    <View style={s.timelineLines}>
                        <View style={[s.tLine, { width: r.line1, backgroundColor: Colors.text_dark }]} />
                        <View style={[s.tLine, { width: r.line2, backgroundColor: Color(Colors.text_dark).alpha(0.5).string() }]} />
                    </View>
                </View>
            ))}
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

export function EventsPreview() {
    const dots = [0, 2, 0, 1, 3, 0, 1]
    return (
        <View style={s.preview}>
            <View style={s.weekStrip}>
                {dots.map((count, i) => (
                    <View key={i} style={s.dayCol}>
                        <View style={[s.daySq, i === 2 && { backgroundColor: Color(Colors.secondary).alpha(0.25).string() }]} />
                        <View style={s.dotCluster}>
                            {Array.from({ length: Math.min(count, 2) }).map((_, j) => (
                                <View key={j} style={[s.eDot, { backgroundColor: Colors.secondary }]} />
                            ))}
                        </View>
                    </View>
                ))}
            </View>
            <View style={[s.eLine, { width: "80%" }]} />
            <View style={[s.eLine, { width: "60%" }]} />
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
})
