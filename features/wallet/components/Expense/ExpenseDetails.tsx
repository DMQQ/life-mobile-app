import { Expense as ExpenseType } from "@/types"
import { formatAmount } from "@/utils/functions/formatCurrency"
import { Image, Pressable, StyleSheet, View } from "react-native"
import Colors from "@/constants/Colors"
import { Feather } from "@expo/vector-icons"
import { CategoryIcon, CategoryUtils } from "./ExpenseIcon"
import EditNote from "./EditNote"
import { useSubAccounts } from "../../hooks/useSubAccounts"
import { getRateColor } from "../CreateExpense/SpontaneousRate"
import Section from "@/components/ui/Section"
import DetailRow from "@/components/ui/DetailRow"
import Text from "@/components/ui/Text/Text"
import { navigationRef } from "@/navigation/ref"
import Feedback from "react-native-haptic-feedback"
import Url from "@/constants/Url"

const capitalize = (s = "") => s.charAt(0).toUpperCase() + s.slice(1)

const muted = Colors.foreground_secondary

const styles = StyleSheet.create({
    shopPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: Colors.primary_lighter,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 100,
    },
    shopPillImage: {
        width: 16,
        height: 16,
        borderRadius: 4,
    },
})

export default function ExpenseDetails({ expense, tint }: { expense: ExpenseType; tint?: string }) {
    const { data: subAccountsData } = useSubAccounts()
    const subAccount = subAccountsData?.wallet.subAccounts.find((a) => a.id === expense.subAccountId) ?? null

    return (
        <Section title="Details" tint={tint}>
            {expense?.category && (
                <DetailRow tint={tint}
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

            <DetailRow tint={tint} icon="tag">{capitalize(expense?.type)}</DetailRow>

            {(expense?.shop || expense?.shopEntity) && (
                <DetailRow tint={tint} icon="shopping-bag">
                    <Pressable
                        onPress={() => {
                            Feedback.trigger("impactLight")
                            navigationRef.current?.navigate("WalletScreens", {
                                screen: "ExpensesList",
                                params: { filters: { shopName: expense.shopEntity?.name ?? expense.shop } },
                            } as any)
                        }}
                        style={styles.shopPill}
                    >
                        {expense.shopEntity?.image && (
                            <Image source={{ uri: Url.API + "/upload/images/" + expense.shopEntity.image }} style={styles.shopPillImage} />
                        )}
                        <Text variant="caption" style={{ color: Colors.secondary }}>
                            {expense.shopEntity?.name ?? expense.shop}
                        </Text>
                        <Feather name="chevron-right" size={12} color={Colors.secondary} />
                    </Pressable>
                </DetailRow>
            )}
            {expense?.tags && (
                <DetailRow tint={tint} icon="tag">{expense.tags}</DetailRow>
            )}

            <DetailRow tint={tint} icon="clock">Balance before: {expense?.balanceBeforeInteraction != null ? formatAmount(expense.balanceBeforeInteraction) : "N/A"} zł</DetailRow>

            {expense.spontaneousRate != null && expense.spontaneousRate > 0 && (
                <DetailRow tint={tint} icon="percent">
                    <Text variant="body" style={{ color: getRateColor(expense.spontaneousRate), fontSize: 16 }}>
                        Spontaneous {expense.spontaneousRate}%
                    </Text>
                </DetailRow>
            )}

            {subAccount && <DetailRow tint={tint} icon="layers">{subAccount.name}</DetailRow>}

            <EditNote expense={expense} />
        </Section>
    )
}
