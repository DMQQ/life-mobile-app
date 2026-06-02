import { FONTS } from "@/constants/Fonts"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import { Feather } from "@expo/vector-icons"
import Color from "color"
import { LinearGradient } from "expo-linear-gradient"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import Svg, { Defs, LinearGradient as SvgGradient, Path, Polyline, Stop } from "react-native-svg"

const AI_GRADIENT: [string, string] = ["#7C3AED", "#06B6D4"]

function Sparkline({
    values,
    color,
    width = 80,
    height = 44,
}: {
    values: number[]
    color: string
    width?: number
    height?: number
}) {
    if (values.length < 2) return null

    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min || 1
    const pad = 4

    const xs = values.map((_, i) => pad + (i / (values.length - 1)) * (width - pad * 2))
    const ys = values.map((v) => pad + (1 - (v - min) / range) * (height - pad * 2))

    const points = xs.map((x, i) => `${x},${ys[i]}`).join(" ")

    const areaPath =
        `M ${xs[0]},${height} ` +
        xs.map((x, i) => `L ${x},${ys[i]}`).join(" ") +
        ` L ${xs[xs.length - 1]},${height} Z`

    return (
        <Svg width={width} height={height}>
            <Defs>
                <SvgGradient id="area" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor={color} stopOpacity="0.35" />
                    <Stop offset="1" stopColor={color} stopOpacity="0" />
                </SvgGradient>
            </Defs>
            <Path d={areaPath} fill="url(#area)" />
            <Polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    )
}

export interface AiInsightCardProps {
    text: string
    subtext?: string
    metric?: string
    metricDelta?: number
    trend?: number[]
    trendColor?: string
    gradientColors?: [string, string]
    timestamp?: string
    onPress?: () => void
}

export default function AiInsightCard({
    text,
    subtext,
    metric,
    metricDelta,
    trend = [],
    trendColor,
    gradientColors = AI_GRADIENT,
    timestamp,
    onPress,
}: AiInsightCardProps) {
    const deltaPositive = (metricDelta ?? 0) >= 0
    const deltaColor = deltaPositive ? Colors.positive : Colors.negative
    const lineColor = trendColor ?? (deltaPositive ? Colors.positive : Colors.negative)

    return (
        <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={onPress ? 0.75 : 1}>
            <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={s.leftBorder}
            />

            <LinearGradient
                colors={[Color(gradientColors[0]).alpha(0.08).string(), "transparent"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
            />

            <View style={s.content}>
                <View style={s.left}>
                    <View style={s.labelRow}>
                        <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.iconPill}>
                            <Feather name="cpu" size={9} color="#fff" />
                            <Text style={s.aiLabel}>AI</Text>
                        </LinearGradient>
                        {timestamp && (
                            <Text variant="caption" style={s.timestamp}>
                                {timestamp}
                            </Text>
                        )}
                    </View>

                    <Text style={s.insightText} numberOfLines={3}>
                        {text}
                    </Text>

                    {subtext && (
                        <Text variant="caption" style={s.subtext} numberOfLines={2}>
                            {subtext}
                        </Text>
                    )}
                </View>

                {(trend.length >= 2 || metric) && (
                    <View style={s.right}>
                        {trend.length >= 2 && (
                            <Sparkline values={trend} color={lineColor} />
                        )}
                        {metric && (
                            <View style={s.metricRow}>
                                <Text style={[s.metric, { color: lineColor }]}>{metric}</Text>
                                {metricDelta !== undefined && (
                                    <View style={[s.deltaBadge, { backgroundColor: Color(deltaColor).alpha(0.15).string() }]}>
                                        <Feather
                                            name={deltaPositive ? "arrow-up-right" : "arrow-down-right"}
                                            size={9}
                                            color={deltaColor}
                                        />
                                        <Text style={[s.deltaText, { color: deltaColor }]}>
                                            {Math.abs(metricDelta)}%
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                )}
            </View>
        </TouchableOpacity>
    )
}

const s = StyleSheet.create({
    card: {
        backgroundColor: Colors.primary_lighter,
        borderRadius: 18,
        overflow: "hidden",
        flexDirection: "row",
    },
    leftBorder: {
        width: 3,
        alignSelf: "stretch",
        flexShrink: 0,
    },
    content: {
        flex: 1,
        flexDirection: "row",
        padding: 14,
        gap: 12,
    },
    left: {
        flex: 1,
        gap: 7,
    },
    labelRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    iconPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 100,
    },
    aiLabel: {
        fontSize: 9,
        fontFamily: FONTS.extrabold,
        color: "#fff",
        letterSpacing: 0.5,
    },
    timestamp: {
        color: Colors.text_dark,
    },
    insightText: {
        fontSize: 14,
        fontFamily: FONTS.bold,
        color: Colors.foreground,
        lineHeight: 20,
    },
    subtext: {
        color: Colors.text_dark,
        lineHeight: 17,
    },
    right: {
        alignItems: "flex-end",
        justifyContent: "center",
        gap: 6,
        flexShrink: 0,
    },
    metricRow: {
        alignItems: "flex-end",
        gap: 4,
    },
    metric: {
        fontSize: 18,
        fontFamily: FONTS.extrabold,
        letterSpacing: -0.5,
    },
    deltaBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 100,
    },
    deltaText: {
        fontSize: 10,
        fontFamily: FONTS.bold,
    },
})
