import Text from "@/components/ui/Text/Text"
import Colors, { secondary_candidates } from "@/constants/Colors"
import { Feather } from "@expo/vector-icons"
import { gql, useQuery } from "@apollo/client"
import { useNavigation } from "@react-navigation/native"
import useGetSubscriptions from "@/features/wallet/hooks/useGetSubscriptions"
import dayjs from "dayjs"
import { useEffect, useMemo, useRef } from "react"
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native"
import Svg, { Circle } from "react-native-svg"
import moment from "moment"
import Section from "@/components/ui/Section"

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

const SIZE = 110
const SW = 12
const R = (SIZE - SW) / 2
const C = 2 * Math.PI * R
const TRACK = "rgba(255,255,255,0.07)"

const MONTH_STATS = gql`
    query QuickStatsMonths($thisRange: [String!]!, $lastRange: [String!]!) {
        this: getStatistics(range: $thisRange) {
            expense
        }
        last: getStatistics(range: $lastRange) {
            expense
        }
    }
`

function RingChart({ ratio, color, children }: { ratio: number; color: string; children?: React.ReactNode }) {
    const anim = useRef(new Animated.Value(C)).current

    useEffect(() => {
        Animated.timing(anim, {
            toValue: C * (1 - Math.min(ratio, 1)),
            duration: 1000,
            useNativeDriver: false,
        }).start()
    }, [ratio])

    return (
        <View style={{ width: SIZE, height: SIZE, alignSelf: "center" }}>
            <Svg width={SIZE} height={SIZE}>
                <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={TRACK} strokeWidth={SW} fill="none" />
                <AnimatedCircle
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={R}
                    stroke={color}
                    strokeWidth={SW}
                    fill="none"
                    strokeDasharray={C}
                    strokeDashoffset={anim}
                    strokeLinecap="round"
                    rotation="-90"
                    origin={`${SIZE / 2},${SIZE / 2}`}
                />
            </Svg>
            <View style={styles.ringOverlay}>{children}</View>
        </View>
    )
}

function SegmentedRing({ subs }: { subs: { id: string; amount: number }[] }) {
    const total = subs.reduce((a, s) => a + s.amount, 0)

    if (!total) {
        return (
            <View style={{ width: SIZE, height: SIZE, alignSelf: "center" }}>
                <Svg width={SIZE} height={SIZE}>
                    <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={TRACK} strokeWidth={SW} fill="none" />
                </Svg>
            </View>
        )
    }

    const GAP = subs.length > 1 ? 0.025 * C : 0
    let cursor = 0

    return (
        <View style={{ width: SIZE, height: SIZE, alignSelf: "center" }}>
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
                            strokeLinecap="butt"
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

    const ranges = useMemo(
        () => ({
            thisRange: [moment().startOf("month").format("YYYY-MM-DD"), moment().endOf("month").format("YYYY-MM-DD")],
            lastRange: [
                moment().subtract(1, "month").startOf("month").format("YYYY-MM-DD"),
                moment().subtract(1, "month").endOf("month").format("YYYY-MM-DD"),
            ],
        }),
        [],
    )

    const { data } = useQuery(MONTH_STATS, { variables: ranges })

    const thisMonth = data?.this?.expense ?? 0
    const lastMonth = data?.last?.expense ?? 0
    const ratio = lastMonth > 0 ? thisMonth / lastMonth : 0
    const diff = lastMonth > 0 ? Math.round(Math.abs(ratio - 1) * 100) : 0
    const isMore = thisMonth > lastMonth

    const ringColor = isMore ? (ratio > 1.2 ? Colors.danger : Colors.warning) : Colors.positive

    return (
        <View style={{ flex: 1 }}>
            <Section title="Remaining" noGap cardStyle={{ flex: 1 }}>
                <TouchableOpacity
                    style={styles.tile}
                    onPress={() => navigation.navigate("WalletScreens", { screen: "Wallet" })}
                    activeOpacity={0.7}
                >
                    <RingChart ratio={ratio} color={ringColor}>
                        <Text style={[styles.ringAmount, { color: ringColor }]}>{thisMonth.toFixed(0)}</Text>
                        <Text variant="caption" style={styles.ringUnit}>
                            zł
                        </Text>
                    </RingChart>

                    <View style={styles.footer}>
                        <View style={styles.trendRow}>
                            <Feather
                                name={isMore ? "arrow-up-right" : "arrow-down-right"}
                                size={11}
                                color={ringColor}
                            />
                            <Text variant="caption" style={[styles.trendText, { color: ringColor }]}>
                                {diff}% vs last month
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </Section>
        </View>
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
        <View style={{ flex: 1 }}>
            <Section title="Subscriptions" noGap cardStyle={{ flex: 1 }}>
                <TouchableOpacity
                    style={styles.tile}
                    onPress={() => navigation.navigate("WalletScreens", { screen: "Wallet" })}
                    activeOpacity={0.7}
                >
                    <View style={{ position: "relative" }}>
                        <SegmentedRing subs={activeSubs} />
                        <View style={styles.ringOverlay}>
                            <Text style={styles.ringAmount}>{monthlyTotal.toFixed(0)}</Text>
                            <Text variant="caption" style={styles.ringUnit}>
                                zł
                            </Text>
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <View style={styles.trendRow}>
                            <Feather name="refresh-cw" size={11} color={Colors.text_dark} />
                            <Text variant="caption" style={styles.trendText}>
                                {nextInDays != null ? `next in ${nextInDays}d` : `${activeSubs.length} active`}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </Section>
        </View>
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
        padding: 16,
        alignItems: "center",
        gap: 12,
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
    ringAmount: {
        fontSize: 20,
        fontWeight: "800",
        color: Colors.foreground,
        letterSpacing: -0.8,
        lineHeight: 22,
    },
    ringUnit: {
        color: Colors.text_dark,
        fontWeight: "600",
    },
    footer: {
        alignItems: "center",
        gap: 4,
        width: "100%",
    },
    label: {
        color: Colors.text_dark,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    trendRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
    },
    trendText: {
        color: Colors.text_dark,
    },
})
