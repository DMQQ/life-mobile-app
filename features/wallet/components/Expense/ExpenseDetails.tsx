import { Expense as ExpenseType } from "@/types"
import { Feather } from "@expo/vector-icons"
import { StyleSheet, View } from "react-native"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import { CategoryIcon, CategoryUtils } from "./ExpenseIcon"
import EditNote from "./EditNote"
import { useSubAccounts } from "../../hooks/useSubAccounts"
import { getRateColor } from "../CreateExpense/SpontaneousRate"
import Section from "@/components/ui/Section"
import Color from "color"

const capitalize = (s = "") => s.charAt(0).toUpperCase() + s.slice(1)

const muted = Colors.foreground_secondary

export default function ExpenseDetails({ expense }: { expense: ExpenseType }) {
    const { data: subAccountsData } = useSubAccounts()
    const subAccount = subAccountsData?.wallet.subAccounts.find((a) => a.id === expense.subAccountId) ?? null

    return (
        <Section title="Details">
            {expense?.category && (
                <View style={[styles.row, { padding: 0, paddingRight: 10, paddingLeft: 5 }]}>
                    <CategoryIcon
                        type={expense?.type as "expense" | "income"}
                        category={(expense?.category || "none") as any}
                        clear
                        color={muted as any}
                    />
                    <Text variant="body" style={{ color: muted, fontSize: 16 }}>
                        {capitalize(CategoryUtils.getCategoryName(expense?.category || ""))}
                    </Text>
                </View>
            )}

            <View style={styles.row}>
                <Feather name="tag" size={20} color={muted} style={styles.icon} />
                <Text variant="body" style={{ color: muted, fontSize: 16 }}>
                    {capitalize(expense?.type)}
                </Text>
            </View>

            <View style={styles.row}>
                <Feather name="clock" size={20} color={muted} style={styles.icon} />
                <Text variant="body" style={{ color: muted, fontSize: 16 }}>
                    Balance before: {expense?.balanceBeforeInteraction ?? "N/A"} zł
                </Text>
            </View>

            {expense.spontaneousRate != null && expense.spontaneousRate > 0 && (
                <View style={styles.row}>
                    <Feather name="percent" size={20} color={muted} style={styles.icon} />
                    <Text variant="body" style={{ color: getRateColor(expense.spontaneousRate), fontSize: 16 }}>
                        Spontaneous {expense.spontaneousRate}%
                    </Text>
                </View>
            )}

            {subAccount && (
                <View style={styles.row}>
                    <Feather name="layers" size={20} color={muted} style={styles.icon} />
                    <Text variant="body" style={{ color: muted, fontSize: 16 }}>
                        {subAccount.name}
                    </Text>
                </View>
            )}

            <EditNote expense={expense} />
        </Section>
    )
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 15,
        borderBottomWidth: 1,
        borderColor: Color(Colors.primary_lighter).lighten(0.5).hex(),
    },
    icon: {
        paddingHorizontal: 7.5,
        padding: 2.5,
    },
})
