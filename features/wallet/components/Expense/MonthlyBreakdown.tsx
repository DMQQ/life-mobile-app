import { Expense } from "@/types"
import { StyleSheet, View } from "react-native"
import Text from "@/components/ui/Text/Text"
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

    return (
        <View style={styles.card}>
            <View style={styles.contentContainer}>
                {/* Working Days Row */}
                <View style={styles.statItem}>
                    <Text size={35} weight="bold" color={Colors.secondary} mono>
                        {workingDaysToAfford.toFixed(1)} <Text size={12} weight="400" color={Colors.text_dark}>days</Text>
                    </Text>
                    <Text size={12} weight="500" color={Colors.text_dark}>Work days to afford</Text>
                </View>

                <View style={styles.statItem}>
                    <Text size={35} weight="bold" color={Colors.secondary} mono>
                        {hoursToAfford.toFixed(1)} <Text size={12} weight="400" color={Colors.text_dark}>hrs</Text>
                    </Text>
                    <Text size={12} weight="500" color={Colors.text_dark}>Hours to afford</Text>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        padding: 15,
    },
    contentContainer: {
        gap: 10,
        flexDirection: "row",
    },
    statItem: {
        flexDirection: "column",

        flex: 1,
    },
})

export default MonthlyBreakdown
