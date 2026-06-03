import { FONTS } from "@/constants/Fonts"
import { formatAmount } from "@/utils/functions/formatCurrency"
import Section from "@/components/ui/Section"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import { gql, useQuery } from "@apollo/client"
import Color from "color"
import moment from "moment"
import { StyleSheet, View } from "react-native"
import IconCircle from "@/components/ui/IconCircle"
import ProgressBar from "@/components/ui/ProgressBar"

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

                <Text style={s.balance}>{formatAmount(balance)} zł</Text>

                <View style={s.progressRow}>
                    <ProgressBar progress={pct} color={barColor} gradient />
                    <Text variant="caption" style={[s.remaining, remaining < 0 && { color: Colors.danger }]}>
                        {remaining >= 0 ? `${remaining.toFixed(0)} left` : `${Math.abs(remaining).toFixed(0)} over`}
                    </Text>
                </View>

                <View style={s.stats}>
                    <View style={[s.statBlock, { backgroundColor: Color(Colors.positive).alpha(0.12).string() }]}>
                        <IconCircle
                            name="arrow-up-right"
                            color={Colors.positive}
                            backgroundColor={Color(Colors.positive).alpha(0.2).string()}
                        />
                        <View style={s.statText}>
                            <Text style={[s.statValue, { color: Colors.positive }]}>{formatAmount(statsIncome, 0)} zł</Text>
                            <Text variant="caption" style={s.statLabel}>Income</Text>
                        </View>
                    </View>
                    <View style={[s.statBlock, { backgroundColor: Color(Colors.negative).alpha(0.12).string() }]}>
                        <IconCircle
                            name="arrow-down-right"
                            color={Colors.negative}
                            backgroundColor={Color(Colors.negative).alpha(0.2).string()}
                        />
                        <View style={s.statText}>
                            <Text style={[s.statValue, { color: Colors.negative }]}>{formatAmount(expense, 0)} zł</Text>
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
