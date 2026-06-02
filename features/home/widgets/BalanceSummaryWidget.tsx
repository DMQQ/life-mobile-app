import { FONTS } from "@/constants/Fonts"
import Section from "@/components/ui/Section"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import { Feather } from "@expo/vector-icons"
import { gql, useQuery } from "@apollo/client"
import Color from "color"
import { LinearGradient } from "expo-linear-gradient"
import moment from "moment"
import { StyleSheet, View } from "react-native"

const BALANCE_SUMMARY_QUERY = gql`
    query BalanceSummaryWidget($range: [String!]!) {
        wallet {
            id
            balance
            income
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
    const incomeTarget = data?.wallet?.income ?? 0
    const statsIncome = data?.stats?.income ?? 0
    const expense = data?.stats?.expense ?? 0

    const baseline = incomeTarget > 0 ? incomeTarget : statsIncome
    const ratio = baseline > 0 ? expense / baseline : 0
    const pct = Math.min(100, ratio * 100)
    const remaining = baseline - expense

    const barColor = pct > 90 ? Colors.danger : pct > 70 ? Colors.warning : Colors.secondary
    const dotColor = pct > 90 ? Colors.danger : pct > 70 ? Colors.warning : Colors.positive
    return (
        <Section title="Balance">
            <View style={s.card}>
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
                        <LinearGradient
                            colors={[barColor, Color(barColor).lighten(0.3).string()]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[s.fill, { width: `${pct}%` as any }]}
                        />
                    </View>
                    <Text variant="caption" style={[s.remaining, remaining < 0 && { color: Colors.danger }]}>
                        {remaining >= 0 ? `${remaining.toFixed(0)} left` : `${Math.abs(remaining).toFixed(0)} over`}
                    </Text>
                </View>

                <View style={s.stats}>
                    <View style={[s.statBlock, { backgroundColor: Color(Colors.positive).alpha(0.12).string() }]}>
                        <View style={[s.iconCircle, { backgroundColor: Color(Colors.positive).alpha(0.2).string() }]}>
                            <Feather name="arrow-up-right" size={14} color={Colors.positive} />
                        </View>
                        <View style={s.statText}>
                            <Text style={[s.statValue, { color: Colors.positive }]}>{statsIncome.toFixed(0)} zł</Text>
                            <Text variant="caption" style={s.statLabel}>Income</Text>
                        </View>
                    </View>
                    <View style={[s.statBlock, { backgroundColor: Color(Colors.negative).alpha(0.12).string() }]}>
                        <View style={[s.iconCircle, { backgroundColor: Color(Colors.negative).alpha(0.2).string() }]}>
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
    },
    topRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    month: {
        color: Colors.foreground_secondary,
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
        fontFamily: FONTS.bold,
    },
    balance: {
        fontSize: 40,
        fontFamily: FONTS.extrabold,
        color: Colors.text_light,
        letterSpacing: -1,
    },
    progressRow: {
        gap: 6,
    },
    track: {
        height: 6,
        borderRadius: 3,
        backgroundColor: "rgba(255,255,255,0.1)",
        overflow: "hidden",
    },
    fill: {
        height: 6,
        borderRadius: 3,
    },
    remaining: {
        textAlign: "right",
        color: Colors.foreground_secondary,
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
        borderRadius: 15,
    },
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    statText: {
        gap: 2,
    },
    statValue: {
        fontSize: 17,
        fontFamily: FONTS.bold,
        letterSpacing: -0.3,
    },
    statLabel: {
        color: Colors.foreground_secondary,
    },
})
