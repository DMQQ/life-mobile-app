import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import { Rounded } from "@/constants/Values"
import { gql, useQuery } from "@apollo/client"
import { MaterialIcons } from "@expo/vector-icons"
import moment from "moment"
import { StyleSheet, Text, View } from "react-native"
import Animated, { LinearTransition } from "react-native-reanimated"
import ChartSwitcher from "./ChartSwitcher"

const GET_ZERO_SPENDINGS = gql`
    query HomeZeroSpendings($startDate: String!, $endDate: String!) {
        statisticsZeroExpenseDays(startDate: $startDate, endDate: $endDate) {
            days
            saved
            streak {
                start
                end
            }
        }
    }
`

interface Props {
    data: any
    loading: boolean
}

const ZeroSpendingsCompact = () => {
    const startDate = moment().startOf("month").format("YYYY-MM-DD")
    const endDate = moment().format("YYYY-MM-DD")
    const totalDays = moment().diff(moment().startOf("month"), "days") + 1

    const { data } = useQuery(GET_ZERO_SPENDINGS, { variables: { startDate, endDate } })
    const stats = data?.statisticsZeroExpenseDays

    if (!stats) return null

    const zeroDays = stats.days.length
    const rate = Math.round((zeroDays / totalDays) * 100)
    const currentStreak = stats.streak?.find(
        (s: any) => moment(s.end).format("YYYY-MM-DD") === moment().format("YYYY-MM-DD"),
    )
    const streakLen = currentStreak ? moment(currentStreak.end).diff(moment(currentStreak.start), "days") + 1 : 0

    return (
        <View style={styles.zeroCard}>
            <Text style={[styles.sectionTitle, { color: "#fff" }]}>No-spend days</Text>
            <View style={styles.zeroRow}>
                <View style={styles.zeroStat}>
                    <MaterialIcons name="event-available" size={16} color={"#fff"} />
                    <Text style={styles.zeroValue}>{zeroDays}</Text>
                    <Text style={styles.zeroLabel}>days</Text>
                </View>
                <View style={styles.zeroDivider} />
                <View style={styles.zeroStat}>
                    <MaterialIcons name="trending-up" size={16} color="#66E875" />
                    <Text style={[styles.zeroValue, { color: "#66E875" }]}>{rate}%</Text>
                    <Text style={styles.zeroLabel}>rate</Text>
                </View>
                <View style={styles.zeroDivider} />
                <View style={styles.zeroStat}>
                    <MaterialIcons name="local-fire-department" size={16} color={streakLen > 0 ? "#F6B161" : "#fff"} />
                    <Text style={[styles.zeroValue, streakLen > 0 && { color: "#F6B161" }]}>{streakLen}</Text>
                    <Text style={styles.zeroLabel}>streak</Text>
                </View>
                <View style={styles.zeroDivider} />
                <View style={styles.zeroStat}>
                    <MaterialIcons name="savings" size={16} color={"#fff"} />
                    <Text style={styles.zeroValue}>{Math.round(stats.saved)}zł</Text>
                    <Text style={styles.zeroLabel}>saved</Text>
                </View>
            </View>
        </View>
    )
}

const AvailableBalanceWidget = ({ data }: Props) => {
    return (
        <Animated.View style={styles.container} layout={LinearTransition.delay(200)}>
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Week overview</Text>
                <ChartSwitcher />
            </View>
            <ZeroSpendingsCompact />
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    container: {
        borderRadius: Rounded.xl,
        overflow: "hidden",
        width: Layout.screen.width - 30,
        alignSelf: "center",
        gap: 10,
    },
    card: {
        backgroundColor: Colors.primary_lighter,
        borderRadius: 14,
        padding: 14,
        gap: 10,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: "600",
        letterSpacing: 0.8,
        textTransform: "uppercase",
        color: Colors.text_dark,
        marginBottom: 2,
    },
    zeroCard: {
        backgroundColor: Colors.primary_lighter,
        borderRadius: 14,
        padding: 14,
        gap: 10,
    },
    zeroRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    zeroStat: {
        flex: 1,
        alignItems: "center",
        gap: 3,
    },
    zeroValue: {
        fontSize: 15,
        fontWeight: "700",
        color: Colors.text_light,
    },
    zeroLabel: {
        fontSize: 10,
        color: "#fff",
        letterSpacing: 0.4,
        textTransform: "uppercase",
    },
    zeroDivider: {
        width: 1,
        height: 28,
        backgroundColor: "rgba(255,255,255,0.07)",
    },
})

export default AvailableBalanceWidget
