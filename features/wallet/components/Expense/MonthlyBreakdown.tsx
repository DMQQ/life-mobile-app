import { Expense } from "@/types"
import { StyleSheet, Text, View } from "react-native"
import Colors from "@/constants/Colors"

interface MonthlyBreakdownProps {
    income: number
    monthlyPercentageTarget: number

    expense: Expense
}

const MonthlyBreakdown = ({ expense, income }: MonthlyBreakdownProps) => {
    const workingDaysInMonth = 21
    const dailyIncome = income / workingDaysInMonth
    const hourlyIncome = dailyIncome / 8

    const hoursToAfford = expense.amount / hourlyIncome
    const workingDaysToAfford = hoursToAfford / 8

    if (expense?.type !== "expense") return null

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Expense Breakdown</Text>
            </View>

            <View style={styles.contentContainer}>
                {/* Working Days Row */}
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                        {workingDaysToAfford.toFixed(1)} <Text style={styles.unit}>days</Text>
                    </Text>
                    <Text style={styles.statLabel}>Work days to afford</Text>
                </View>

                {/* Hours Row */}
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                        {hoursToAfford.toFixed(1)} <Text style={styles.unit}>hrs</Text>
                    </Text>
                    <Text style={styles.statLabel}>Hours to afford</Text>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        marginTop: 20,
        backgroundColor: Colors.primary_light,
        borderRadius: 15,
        padding: 15,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 4,
    },
    cardTitle: {
        color: Colors.foreground,
        fontSize: 16,
        fontWeight: "600",
    },
    contentContainer: {
        gap: 10,
        flexDirection: "row",
    },
    statItem: {
        flexDirection: "column",

        flex: 1,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.text_dark,
        fontWeight: "500",
    },
    statValue: {
        fontSize: 35,
        color: Colors.secondary,
        fontWeight: "bold",
    },
    unit: {
        fontSize: 12,
        color: Colors.text_dark,
        fontWeight: "normal",
    },
})

export default MonthlyBreakdown
