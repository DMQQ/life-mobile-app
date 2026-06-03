import { Expense as ExpenseType } from "@/types"
import { formatAmount } from "@/utils/functions/formatCurrency"
import { View } from "react-native"
import Colors from "@/constants/Colors"
import { CategoryIcon, CategoryUtils } from "./ExpenseIcon"
import EditNote from "./EditNote"
import { useSubAccounts } from "../../hooks/useSubAccounts"
import { getRateColor } from "../CreateExpense/SpontaneousRate"
import Section from "@/components/ui/Section"
import DetailRow from "@/components/ui/DetailRow"
import Text from "@/components/ui/Text/Text"

const capitalize = (s = "") => s.charAt(0).toUpperCase() + s.slice(1)

const muted = Colors.foreground_secondary

export default function ExpenseDetails({ expense }: { expense: ExpenseType }) {
    const { data: subAccountsData } = useSubAccounts()
    const subAccount = subAccountsData?.wallet.subAccounts.find((a) => a.id === expense.subAccountId) ?? null

    return (
        <Section title="Details">
            {expense?.category && (
                <DetailRow
                    iconElement={
                        <CategoryIcon
                            type={expense?.type as "expense" | "income"}
                            category={(expense?.category || "none") as any}
                            clear
                            color={muted as any}
                        />
                    }
                    style={{ padding: 0, paddingRight: 10, paddingLeft: 5 }}
                >
                    {capitalize(CategoryUtils.getCategoryName(expense?.category || ""))}
                </DetailRow>
            )}

            <DetailRow icon="tag">{capitalize(expense?.type)}</DetailRow>

            <DetailRow icon="clock">Balance before: {expense?.balanceBeforeInteraction != null ? formatAmount(expense.balanceBeforeInteraction) : "N/A"} zł</DetailRow>

            {expense.spontaneousRate != null && expense.spontaneousRate > 0 && (
                <DetailRow icon="percent">
                    <Text variant="body" style={{ color: getRateColor(expense.spontaneousRate), fontSize: 16 }}>
                        Spontaneous {expense.spontaneousRate}%
                    </Text>
                </DetailRow>
            )}

            {subAccount && <DetailRow icon="layers">{subAccount.name}</DetailRow>}

            <EditNote expense={expense} />
        </Section>
    )
}
