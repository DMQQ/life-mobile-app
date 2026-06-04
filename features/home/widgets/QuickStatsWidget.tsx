import { FONTS } from "@/constants/Fonts"
import Text from "@/components/ui/Text/Text"
import Colors, { secondary_candidates } from "@/constants/Colors"
import { Feather } from "@expo/vector-icons"
import { gql, useQuery } from "@apollo/client"
import { useNavigation } from "@react-navigation/native"
import useGetSubscriptions from "@/features/wallet/hooks/useGetSubscriptions"
import dayjs from "dayjs"
import { useMemo, useState } from "react"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import Svg, { Circle, Defs, LinearGradient as SvgGrad, Path, Polyline, Stop } from "react-native-svg"
import moment from "moment"
import Color from "color"

const SIZE = 96
const SW = 10
const R = (SIZE - SW) / 2
const C = 2 * Math.PI * R
const TRACK = "rgba(255,255,255,0.07)"

const MONTH_STATS = gql`
    query QuickStatsMonths($m0: [String!]!, $m1: [String!]!, $m2: [String!]!, $m3: [String!]!, $m4: [String!]!) {
        m0: getStatistics(range: $m0) {
            expense
        }
        m1: getStatistics(range: $m1) {
            expense
        }
        m2: getStatistics(range: $m2) {
            expense
        }
        m3: getStatistics(range: $m3) {
            expense
        }
        m4: getStatistics(range: $m4) {
            expense
        }
    }
`

interface MonthStatsData {
    m0?: { expense: number }
    m1?: { expense: number }
    m2?: { expense: number }
    m3?: { expense: number }
    m4?: { expense: number }
}

function Sparkline({
    values,
    color,
    uid,
    width = 130,
    height = 64,
}: {
    values: number[]
    color: string
    uid: string
    width?: number
    height?: number
}) {
    const W = width
    const H = height
    const PAD = 4

    if (values.every((v) => v === 0)) return <View style={{ height: H }} />

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
                <SvgGrad id={uid} x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor={color} stopOpacity="0.35" />
                    <Stop offset="1" stopColor={color} stopOpacity="0" />
                </SvgGrad>
            </Defs>
            <Path d={area} fill={`url(#${uid})`} />
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

function SegmentedRing({ subs }: { subs: { id: string; amount: number }[] }) {
    const total = subs.reduce((a, s) => a + s.amount, 0)

    if (!total) {
        return (
            <View style={{ width: SIZE, height: SIZE }}>
                <Svg width={SIZE} height={SIZE}>
                    <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={TRACK} strokeWidth={SW} fill="none" />
                </Svg>
            </View>
        )
    }

    const GAP = subs.length > 1 ? 0.025 * C : 0
    let cursor = 0

    return (
        <View style={{ width: SIZE, height: SIZE }}>
            <Svg width={SIZE} height={SIZE}>
                <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={TRACK} strokeWidth={SW} fill="none" />
                {subs.slice(0, 8).map((sub, i) => {
                    const segLen = (sub.amount / total) * C - GAP
                    const offset = C * 0.25 - cursor
                    cursor += segLen + GAP
                    return (
                        <Circle
                            key={sub.id}
                            cx={SIZE / 2}
                            cy={SIZE / 2}
                            r={R}
                            stroke={secondary_candidates[i % secondary_candidates.length]}
                            strokeWidth={SW}
                            fill="none"
                            strokeDasharray={`${segLen} ${C}`}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            rotation="-90"
                            origin={`${SIZE / 2},${SIZE / 2}`}
                        />
                    )
                })}
            </Svg>
        </View>
    )
}

function SpendingTile() {
    const navigation = useNavigation<any>()
    const [sparkWidth, setSparkWidth] = useState(0)

    const ranges = useMemo(() => {
        const out: Record<string, string[]> = {}
        for (let i = 0; i < 5; i++) {
            const m = moment().subtract(4 - i, "month")
            out[`m${i}`] = [
                m.clone().startOf("month").format("YYYY-MM-DD"),
                m.clone().endOf("month").format("YYYY-MM-DD"),
            ]
        }
        return out
    }, [])

    const { data } = useQuery<MonthStatsData>(MONTH_STATS, { variables: ranges })

    const sparkValues = (["m0", "m1", "m2", "m3", "m4"] as const).map((k) => data?.[k]?.expense ?? 0)
    const thisMonth = sparkValues[4]
    const lastMonth = sparkValues[3]
    const ratio = lastMonth > 0 ? thisMonth / lastMonth : 0
    const diff = lastMonth > 0 ? Math.round(Math.abs(ratio - 1) * 100) : 0
    const isMore = thisMonth > lastMonth
    const color = isMore ? (ratio > 1.2 ? Colors.danger : Colors.warning) : Colors.positive

    return (
        <TouchableOpacity
            style={styles.tile}
            onPress={() => navigation.navigate("WalletScreens", { screen: "Wallet" })}
            onLayout={(e) => setSparkWidth(e.nativeEvent.layout.width - 28)}
            activeOpacity={0.7}
        >
            <View style={styles.tileHead}>
                <Text variant="caption" style={styles.tileLabel}>
                    SPENDING
                </Text>
                <View style={[styles.badge, { backgroundColor: Color(color).alpha(0.15).string() }]}>
                    <Feather name={isMore ? "arrow-up-right" : "arrow-down-right"} size={9} color={color} />
                    <Text variant="caption" style={[styles.badgeText, { color }]}>
                        {diff}%
                    </Text>
                </View>
            </View>

            <View style={styles.amountRow}>
                <Text style={styles.amount}>{thisMonth.toFixed(0)}</Text>
                <Text variant="caption" style={styles.currency}>
                    zł
                </Text>
            </View>

            {sparkWidth > 0 && (
                <Sparkline values={sparkValues} color={color} uid="spend-g" width={sparkWidth} height={80} />
            )}
        </TouchableOpacity>
    )
}

function SubsTile() {
    const navigation = useNavigation<any>()
    const { data } = useGetSubscriptions()

    const { activeSubs, monthlyTotal, nextInDays } = useMemo(() => {
        const all = data?.subscriptions ?? []
        const active = all.filter((s) => s.isActive)
        const total = active.reduce((a, s) => a + s.amount, 0)
        const next = active
            .filter((s) => s.nextBillingDate)
            .map((s) => dayjs(parseInt(s.nextBillingDate)).diff(dayjs(), "day"))
            .filter((d) => d >= 0)
            .sort((a, b) => a - b)[0]
        return { activeSubs: active, monthlyTotal: total, nextInDays: next }
    }, [data])

    return (
        <TouchableOpacity
            style={styles.tile}
            onPress={() => navigation.navigate("WalletScreens", { screen: "Wallet" })}
            activeOpacity={0.7}
        >
            <View style={styles.tileHead}>
                <Text variant="caption" style={styles.tileLabel}>
                    SUBS
                </Text>
                <View style={styles.badge}>
                    <Text variant="caption" style={styles.badgeText}>
                        {activeSubs.length} active
                    </Text>
                </View>
            </View>

            <View style={styles.ringWrap}>
                <SegmentedRing subs={activeSubs} />
                <View style={styles.ringOverlay}>
                    <Text style={styles.ringAmount}>{monthlyTotal.toFixed(0)}</Text>
                    <Text variant="caption" style={styles.currency}>
                        zł
                    </Text>
                </View>
            </View>

            <View style={styles.trendRow}>
                <Feather name="refresh-cw" size={10} color={Colors.foreground_secondary} />
                <Text variant="caption" style={styles.trendText}>
                    {nextInDays != null ? `next in ${nextInDays}d` : `${activeSubs.length} subs`}
                </Text>
            </View>
        </TouchableOpacity>
    )
}

export default function QuickStatsWidget() {
    return (
        <View style={styles.row}>
            <SpendingTile />
            <SubsTile />
        </View>
    )
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        gap: 12,
        marginTop: 30,
    },
    tile: {
        flex: 1,
        backgroundColor: Colors.primary_lighter,
        borderRadius: 20,
        padding: 15,
        gap: 10,
        borderWidth: 1,
        borderColor: Colors.borderColor,
    },
    tileHead: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    tileLabel: {
        color: Colors.foreground_secondary,
        fontFamily: FONTS.bold,
        letterSpacing: 1,
        fontSize: 10,
    },
    badge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
        backgroundColor: "rgba(255,255,255,0.08)",
        borderRadius: 100,
        paddingHorizontal: 7,
        paddingVertical: 3,
    },
    badgeText: {
        fontFamily: FONTS.bold,
        fontSize: 10,
        color: Colors.foreground_secondary,
    },
    amountRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 3,
    },
    amount: {
        fontSize: 28,
        fontFamily: FONTS.extrabold,
        color: Colors.foreground,
        letterSpacing: -1,
        lineHeight: 30,
    },
    ringAmount: {
        fontSize: 20,
        fontFamily: FONTS.extrabold,
        color: Colors.foreground,
        letterSpacing: -0.5,
        lineHeight: 22,
    },
    currency: {
        color: Colors.foreground_secondary,
        fontFamily: FONTS.semibold,
        marginBottom: 2,
    },
    ringWrap: {
        alignSelf: "center",
        position: "relative",
    },
    ringOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
    },
    trendRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    trendText: {
        color: Colors.foreground_secondary,
    },
})
