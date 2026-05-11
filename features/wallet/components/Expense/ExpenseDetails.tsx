import { Expense as ExpenseType } from "@/types"
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons"
import { StyleSheet, Text, View } from "react-native"
import Colors from "@/constants/Colors"
import { CategoryIcon, CategoryUtils } from "./ExpenseIcon"
import EditNote from "./EditNote"
import { useSubAccounts } from "../../hooks/useSubAccounts"
import { getRateColor } from "../CreateExpense/SpontaneousRate"
import Section from "@/components/ui/Section"
import Color from "color"

const capitalize = (s = "") => s.charAt(0).toUpperCase() + s.slice(1)

export default function ExpenseDetails({ expense }: { expense: ExpenseType }) {
    const { data: subAccountsData } = useSubAccounts()
    const subAccount = subAccountsData?.wallet.subAccounts.find((a) => a.id === expense.subAccountId) ?? null

    return (
        <Section title="Details">
            {expense?.category && (
                <View style={[styles.row, { padding: 0, paddingRight: 10, paddingLeft: 7.5 }]}>
                    <CategoryIcon
                        type={expense?.type as "expense" | "income"}
                        category={(expense?.category || "none") as any}
                        clear
                    />

                    <Text style={{ color: Colors.secondary_light_2, fontSize: 18, flex: 1 }}>
                        {capitalize(CategoryUtils.getCategoryName(expense?.category || ""))}
                    </Text>
                </View>
            )}

            <View style={styles.row}>
                <MaterialIcons
                    name="money"
                    size={24}
                    color={Colors.ternary}
                    style={{ paddingHorizontal: 7.5, padding: 2.5 }}
                />

                <Text style={{ color: Colors.secondary_light_2, fontSize: 18 }}>{capitalize(expense?.type)}</Text>
            </View>

            <View style={styles.row}>
                <MaterialIcons
                    name="money"
                    size={24}
                    color={Colors.ternary}
                    style={{ paddingHorizontal: 7.5, padding: 2.5 }}
                />

                <Text style={{ color: Colors.secondary_light_2, fontSize: 18 }}>
                    Balance before: {expense?.balanceBeforeInteraction ?? "N/A"} zł
                </Text>
            </View>

            {expense.spontaneousRate != null && expense.spontaneousRate > 0 && (
                <View style={styles.row}>
                    <MaterialIcons
                        name="psychology"
                        size={24}
                        color={Colors.ternary}
                        style={{ paddingHorizontal: 7.5, padding: 2.5 }}
                    />
                    <Text style={{ color: getRateColor(expense.spontaneousRate), fontSize: 18 }}>
                        Spontaneous {expense.spontaneousRate}%
                    </Text>
                </View>
            )}

            {subAccount && (
                <View style={styles.row}>
                    <MaterialCommunityIcons
                        name={subAccount.icon as any}
                        size={24}
                        color={subAccount.color ?? Colors.foreground}
                        style={{ paddingHorizontal: 7.5, padding: 2.5 }}
                    />
                    <Text style={{ color: Colors.secondary_light_2, fontSize: 18 }}>{subAccount.name}</Text>
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
    correctionBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 100,
        backgroundColor: "rgba(255,255,255,0.06)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
    },
    correctionBtnText: {
        color: Colors.secondary,
        fontSize: 12,
        fontWeight: "500",
    },
})
