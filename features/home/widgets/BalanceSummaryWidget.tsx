import Section from "@/components/ui/Section"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import { Feather } from "@expo/vector-icons"
import { gql, useQuery } from "@apollo/client"
import Color from "color"
import moment from "moment"
import { StyleSheet, View } from "react-native"

const BALANCE_SUMMARY_QUERY = gql`
    query BalanceSummaryWidget($range: [String!]!) {
        wallet {
            id
            balance
        }
        stats: getStatistics(range: $range) {
            expense
            income
        }
    }
`

export default function BalanceSummaryWidget() {
    const { data } = useQuery(BALANCE_SUMMARY_QUERY, {
        variables: {
            range: [
                moment().startOf("month").format("YYYY-MM-DD"),
                moment().endOf("month").format("YYYY-MM-DD"),
            ],
        },
    })

    const balance = data?.wallet?.balance ?? 0
    const income = data?.stats?.income ?? 0
    const expense = data?.stats?.expense ?? 0
    const ratio = income > 0 ? expense / income : 0
    const pct = Math.min(100, ratio * 100)
    const remaining = income - expense

    const barColor = pct > 90 ? Colors.danger : pct > 70 ? Colors.warning : Colors.secondary
    const dotColor = pct > 90 ? Colors.danger : Colors.positive

    return (
        <Section title="Balance">
            <View style={s.card}>
                <View style={s.circle1} />
                <View style={s.circle2} />

                <View style={s.topRow}>
                    <Text variant="caption" style={s.month}>
                        {moment().format("MMMM YYYY")}
                    </Text>
                    <View style={s.badge}>
                        <View style={[s.statusDot, { backgroundColor: dotColor }]} />
                        <Text variant="caption" style={[s.badgeText, { color: barColor }]}>
                            {pct.toFixed(0)}%
                        </Text>
                    </View>
                </View>

                <Text style={s.balance}>{balance.toFixed(2)} zł</Text>

                <View style={s.progressRow}>
                    <View style={s.track}>
                        <View style={[s.fill, { width: `${pct}%` as any, backgroundColor: barColor }]} />
                    </View>
                    <Text variant="caption" style={[s.remaining, { color: remaining >= 0 ? Colors.text_dark : Colors.danger }]}>
                        {remaining >= 0 ? `${remaining.toFixed(0)} left` : `${Math.abs(remaining).toFixed(0)} over`}
                    </Text>
                </View>

                <View style={s.stats}>
                    <View style={[s.statBlock, { backgroundColor: Color(Colors.positive).alpha(0.09).string() }]}>
                        <View style={[s.iconCircle, { backgroundColor: Color(Colors.positive).alpha(0.15).string() }]}>
                            <Feather name="arrow-up-right" size={14} color={Colors.positive} />
                        </View>
                        <View style={s.statText}>
                            <Text style={[s.statValue, { color: Colors.positive }]}>{income.toFixed(0)} zł</Text>
                            <Text variant="caption" style={s.statLabel}>Income</Text>
                        </View>
                    </View>
                    <View style={[s.statBlock, { backgroundColor: Color(Colors.negative).alpha(0.09).string() }]}>
                        <View style={[s.iconCircle, { backgroundColor: Color(Colors.negative).alpha(0.15).string() }]}>
                            <Feather name="arrow-down-right" size={14} color={Colors.negative} />
                        </View>
                        <View style={s.statText}>
                            <Text style={[s.statValue, { color: Colors.negative }]}>{expense.toFixed(0)} zł</Text>
                            <Text variant="caption" style={s.statLabel}>Spent</Text>
                        </View>
                    </View>
                </View>
            </View>
        </Section>
    )
}

const s = StyleSheet.create({
    card: {
        padding: 18,
        gap: 16,
        overflow: "hidden",
        position: "relative",
    },
    circle1: {
        position: "absolute",
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: Color(Colors.secondary).alpha(0.06).string(),
        right: -60,
        top: -80,
    },
    circle2: {
        position: "absolute",
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Color(Colors.secondary).alpha(0.04).string(),
        right: 100,
        top: -50,
    },
    topRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    month: {
        color: Colors.text_dark,
    },
    badge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    badgeText: {
        fontWeight: "700",
    },
    balance: {
        fontSize: 36,
        fontWeight: "800",
        color: Colors.text_light,
        letterSpacing: -1.5,
    },
    progressRow: {
        gap: 6,
    },
    track: {
        height: 8,
        borderRadius: 4,
        backgroundColor: "rgba(255,255,255,0.08)",
        overflow: "hidden",
    },
    fill: {
        height: 8,
        borderRadius: 4,
    },
    remaining: {
        textAlign: "right",
    },
    stats: {
        flexDirection: "row",
        gap: 10,
    },
    statBlock: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        padding: 12,
        borderRadius: 16,
    },
    iconCircle: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: "center",
        justifyContent: "center",
    },
    statText: {
        gap: 2,
    },
    statValue: {
        fontSize: 16,
        fontWeight: "700",
        letterSpacing: -0.3,
    },
    statLabel: {
        color: Colors.text_dark,
    },
})
