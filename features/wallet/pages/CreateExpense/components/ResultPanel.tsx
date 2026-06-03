import { FONTS } from "@/constants/Fonts"
import { formatAmount } from "@/utils/functions/formatCurrency"
import GlassView from "@/components/ui/GlassView"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import { Expense } from "@/types"
import { Feather } from "@expo/vector-icons"
import Color from "color"
import { Pressable, ScrollView, StyleSheet, View } from "react-native"
import { CategoryIcon, CategoryUtils } from "../../../components/Expense/ExpenseIcon"

export default function ResultPanel({
    expense,
    onFillForm,
    onSaveAndView,
    onDiscard,
}: {
    expense: Expense
    onFillForm: () => void
    onSaveAndView: () => void
    onDiscard: () => void
}) {
    const isIncome = expense.type === "income"
    const amountColor = isIncome ? "#66E875" : "#F07070"
    const sign = isIncome ? "+" : "-"

    return (
        <View style={styles.resultCard}>
            <View style={styles.resultBadgeRow}>
                <View
                    style={[
                        styles.typeBadge,
                        {
                            backgroundColor: Color(amountColor).alpha(0.12).string(),
                            borderColor: Color(amountColor).alpha(0.28).string(),
                        },
                    ]}
                >
                    <View style={[styles.typeDot, { backgroundColor: amountColor }]} />
                    <Text style={[styles.typeBadgeLabel, { color: amountColor }]}>
                        {isIncome ? "Income" : "Expense"}
                    </Text>
                </View>
                <View style={styles.aiBadge}>
                    <Feather name="cpu" size={10} color={Colors.secondary} />
                    <Text style={styles.aiBadgeLabel}>AI detected</Text>
                </View>
            </View>

            <View style={styles.resultHero}>
                <Text style={[styles.resultAmount, { color: "#fff" }]}>
                    {sign}
                    {formatAmount(Math.abs(expense.amount))}zł
                </Text>
                <Text style={styles.resultDescription} numberOfLines={2}>
                    {expense.description}
                </Text>
            </View>

            {(expense.category || expense.note) && (
                <View style={styles.resultMeta}>
                    {expense.category ? (
                        <View style={styles.metaChip}>
                            <CategoryIcon
                                category={expense.category as any}
                                type={expense.type as any}
                                size={11}
                                clear
                                style={{ padding: 0 }}
                                containerStyle={{ width: 18, height: 18, borderRadius: 5 }}
                            />
                            <Text style={styles.metaChipAccent}>
                                {CategoryUtils.getCategoryName(expense.category)}
                            </Text>
                        </View>
                    ) : null}
                    {expense.note ? (
                        <View style={styles.metaChip}>
                            <Feather name="file-text" size={10} color={Colors.foreground_secondary} />
                            <Text style={styles.metaChipText} numberOfLines={1}>
                                {expense.note}
                            </Text>
                        </View>
                    ) : null}
                </View>
            )}

            {expense.subexpenses && expense.subexpenses.length > 0 && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.subexpensesRow}
                >
                    {expense.subexpenses.map((sub) => (
                        <View key={sub.id} style={styles.subexpenseChip}>
                            {sub.category ? (
                                <CategoryIcon
                                    category={sub.category as any}
                                    type="expense"
                                    size={10}
                                    clear
                                    style={{ padding: 0 }}
                                    containerStyle={{ width: 16, height: 16, borderRadius: 4 }}
                                />
                            ) : null}
                            <Text style={styles.subexpenseDesc} numberOfLines={1}>
                                {sub.description}
                            </Text>
                            <Text style={styles.subexpenseAmount}>{formatAmount(Math.abs(sub.amount))}</Text>
                        </View>
                    ))}
                </ScrollView>
            )}

            <View style={styles.divider} />

            <View style={styles.resultActions}>
                <Pressable onPress={onFillForm} style={styles.fillFormBtn} hitSlop={6}>
                    <GlassView style={styles.fillFormInner}>
                        <Feather name="edit-3" size={15} color={Colors.secondary} />
                        <Text style={styles.fillFormLabel}>Fill form</Text>
                    </GlassView>
                </Pressable>

                <View style={styles.secondaryActions}>
                    <Pressable onPress={onSaveAndView} style={styles.actionFlex} hitSlop={6}>
                        <GlassView style={styles.secondaryBtn}>
                            <Feather name="check" size={14} color={Colors.foreground} />
                            <Text style={styles.secondaryBtnLabel}>Save</Text>
                        </GlassView>
                    </Pressable>
                    <Pressable onPress={onDiscard} style={styles.actionFlex} hitSlop={6}>
                        <GlassView style={styles.secondaryBtn}>
                            <Feather name="trash-2" size={14} color={Colors.foreground_secondary} />
                            <Text style={styles.discardLabel}>Discard</Text>
                        </GlassView>
                    </Pressable>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    resultCard: {
        flex: 1,
        backgroundColor: Colors.primary_light,
        borderRadius: 25,
        padding: 20,
        gap: 14,
        borderWidth: 1,
        borderColor: Color(Colors.primary_lighter).alpha(0.8).string(),
    },
    resultBadgeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    typeBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingVertical: 5,
        paddingHorizontal: 11,
        borderRadius: 100,
        borderWidth: 1,
    },
    typeDot: {
        width: 6,
        height: 6,
        borderRadius: 100,
    },
    typeBadgeLabel: {
        fontSize: 12,
        fontFamily: FONTS.bold,
        letterSpacing: 0.2,
    },
    aiBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingVertical: 5,
        paddingHorizontal: 11,
        borderRadius: 100,
        backgroundColor: Color(Colors.secondary).alpha(0.08).string(),
    },
    aiBadgeLabel: {
        color: Colors.secondary,
        fontSize: 12,
        fontFamily: FONTS.semibold,
        letterSpacing: 0.2,
    },
    resultHero: {
        gap: 6,
    },
    resultAmount: {
        fontSize: 44,
        fontFamily: FONTS.extrabold,
        letterSpacing: -2,
    },
    resultDescription: {
        color: Colors.foreground,
        fontSize: 17,
        fontFamily: FONTS.semibold,
        lineHeight: 23,
    },
    resultMeta: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
    },
    metaChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingVertical: 5,
        paddingHorizontal: 11,
        borderRadius: 100,
        backgroundColor: Color(Colors.primary_lighter).alpha(0.7).string(),
    },
    metaChipAccent: {
        color: Colors.secondary,
        fontSize: 12,
        fontFamily: FONTS.semibold,
    },
    metaChipText: {
        color: Colors.foreground_secondary,
        fontSize: 12,
    },
    subexpensesRow: {
        gap: 6,
        flexDirection: "row",
    },
    subexpenseChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 100,
        backgroundColor: Color(Colors.primary_lighter).alpha(0.7).string(),
        maxWidth: 180,
    },
    subexpenseDesc: {
        color: Colors.foreground_secondary,
        fontSize: 12,
        flexShrink: 1,
    },
    subexpenseAmount: {
        color: Colors.foreground,
        fontSize: 12,
        fontFamily: FONTS.semibold,
    },
    divider: {
        height: 1,
        backgroundColor: Color(Colors.primary_lighter).alpha(0.6).string(),
        marginVertical: 2,
    },
    resultActions: {
        gap: 8,
        marginTop: "auto" as any,
    },
    fillFormBtn: {
        borderRadius: 16,
        overflow: "hidden",
    },
    fillFormInner: {
        height: 52,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 9,
        borderRadius: 16,
    },
    fillFormLabel: {
        color: Colors.secondary,
        fontSize: 16,
        fontFamily: FONTS.bold,
    },
    secondaryActions: {
        flexDirection: "row",
        gap: 8,
    },
    secondaryBtn: {
        height: 46,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        borderRadius: 14,
    },
    secondaryBtnLabel: {
        color: Colors.foreground,
        fontSize: 14,
        fontFamily: FONTS.semibold,
    },
    discardLabel: {
        color: Colors.foreground_secondary,
        fontSize: 14,
        fontFamily: FONTS.medium,
    },
    actionFlex: {
        flex: 1,
    },
})
