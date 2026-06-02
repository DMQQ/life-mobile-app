import { ConfirmDialog } from "@/components"
import Colors from "@/constants/Colors"
import GlassView from "@/components/ui/GlassView"
import GlassButton from "@/components/ui/GlassButton"
import Text from "@/components/ui/Text/Text"
import { Icons, CategoryUtils } from "@/features/wallet/components/Expense/ExpenseIcon"
import BottomSheetModal, {
    BottomSheetScrollView,
    BottomSheetTextInput,
} from "@gorhom/bottom-sheet"
import { Feather } from "@expo/vector-icons"
import moment from "moment"
import React, { useState } from "react"
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import Feedback from "react-native-haptic-feedback"
import WalletItem from "../Wallet/WalletItem"
import Color from "color"
import { useCreateExpenseContext, SubExpense } from "@/features/wallet/context/CreateExpenseContext"
import CategorySelector from "./CategorySelectorView"

const EMPTY_FORM = { description: "", amount: "", category: "none" as keyof typeof Icons }

const SubExpenseSheet = () => {
    const { state, methods, subexpenseSheetRef } = useCreateExpenseContext()
    const { SubExpenses, date } = state
    const { setSubExpenses } = methods
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [showCategoryPicker, setShowCategoryPicker] = useState(false)

    const canAdd = form.description.trim().length > 0 && parseFloat(form.amount) > 0

    const handleAdd = () => {
        if (!canAdd) return
        Feedback.trigger("impactMedium")
        setSubExpenses((prev) => [
            ...prev,
            {
                id: Math.random().toString(),
                description: form.description.trim(),
                amount: parseFloat(form.amount),
                category: form.category,
            },
        ])
        setForm(EMPTY_FORM)
        setShowCategoryPicker(false)
    }

    const hasCategory = form.category !== "none"
    const catColor = hasCategory
        ? Color(Icons[form.category]?.backgroundColor ?? Colors.secondary)
              .lighten(0.25)
              .hex()
        : undefined

    return (
        <>
            <BottomSheetModal
                ref={subexpenseSheetRef}
                index={-1}
                snapPoints={["90%"]}
                animateOnMount={false}
                enablePanDownToClose
                handleIndicatorStyle={{ backgroundColor: Colors.foreground_hairline, width: 40 }}
                backgroundStyle={styles.sheetBg}
                keyboardBehavior="extend"
            >
                <BottomSheetScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardDismissMode="none"
                    showsVerticalScrollIndicator={false}
                >
                    <Text variant="label" style={styles.sectionLabel}>New Entry</Text>

                    <View style={styles.amountRow}>
                        <Text variant="body" muted style={styles.currency}>zł</Text>
                        <BottomSheetTextInput
                            style={styles.amountInput}
                            value={form.amount}
                            onChangeText={(t) => setForm((p) => ({ ...p, amount: t }))}
                            placeholder="0.00"
                            placeholderTextColor={Colors.foreground_disabled}
                            keyboardType="decimal-pad"
                            returnKeyType="next"
                            selectionColor={Colors.secondary}
                        />
                    </View>

                    <View style={styles.hairline} />

                    <BottomSheetTextInput
                        style={styles.descInput}
                        value={form.description}
                        onChangeText={(t) => setForm((p) => ({ ...p, description: t }))}
                        placeholder="Description"
                        placeholderTextColor={Colors.text_dark}
                        returnKeyType="done"
                        onSubmitEditing={handleAdd}
                        selectionColor={Colors.secondary}
                    />

                    <View style={styles.hairline} />

                    <View style={styles.formFooter}>
                        <Pressable
                            onPress={() => {
                                Feedback.trigger("impactLight")
                                setShowCategoryPicker((p) => !p)
                            }}
                        >
                            <GlassView style={[styles.categoryChip, hasCategory && { borderColor: catColor }]}>
                                <Feather
                                    name="tag"
                                    size={13}
                                    color={hasCategory ? catColor : Colors.foreground_secondary}
                                />
                                <Text
                                    variant="caption"
                                    style={hasCategory ? { color: catColor } : undefined}
                                >
                                    {hasCategory ? CategoryUtils.getCategoryName(form.category) : "Category"}
                                </Text>
                            </GlassView>
                        </Pressable>

                        <GlassButton
                            label="Add"
                            icon="plus"
                            variant="accent"
                            onPress={handleAdd}
                            disabled={!canAdd}
                        />
                    </View>

                    {showCategoryPicker && (
                        <View style={styles.categoryPicker}>
                            <CategorySelector
                                current={form.category}
                                onPress={(item) => {
                                    setForm((p) => ({ ...p, category: item as keyof typeof Icons }))
                                    setShowCategoryPicker(false)
                                }}
                                dismiss={() => setShowCategoryPicker(false)}
                            />
                        </View>
                    )}

                    {SubExpenses.length > 0 && (
                        <>
                            <View style={styles.listHeader}>
                                <Text variant="label">Added ({SubExpenses.length})</Text>
                            </View>
                            {SubExpenses.map((item) => (
                                <WalletItem
                                    key={item.id}
                                    handlePress={() => setConfirmDeleteId(item.id)}
                                    id={item.id}
                                    amount={item.amount}
                                    description={item.description}
                                    date={moment(date).format("YYYY-MM-DD")}
                                    type="expense"
                                    category={item.category}
                                    balanceBeforeInteraction={0}
                                    spontaneousRate={0}
                                    subscription={null}
                                    location={null}
                                    subexpenses={[]}
                                    files={[]}
                                    animatedStyle={{} as any}
                                    containerStyle={
                                        { backgroundColor: Colors.primary_lighter } as StyleProp<ViewStyle>
                                    }
                                />
                            ))}
                        </>
                    )}
                </BottomSheetScrollView>
            </BottomSheetModal>

            <ConfirmDialog
                isVisible={!!confirmDeleteId}
                onDismiss={() => setConfirmDeleteId(null)}
                onConfirm={() => {
                    setSubExpenses((prev) => prev.filter((i) => i.id !== confirmDeleteId))
                    setConfirmDeleteId(null)
                }}
                title="Delete Subexpense"
                description="Are you sure you want to delete this subexpense?"
                destructive
            />
        </>
    )
}

const styles = StyleSheet.create({
    sheetBg: {
        backgroundColor: Colors.primary_light,
        borderWidth: 1,
        borderColor: Color(Colors.primary_light).lighten(0.4).hex(),
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 4,
        paddingBottom: 40,
    },
    sectionLabel: {
        marginBottom: 18,
    },
    amountRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 14,
    },
    currency: {
        fontSize: 26,
        fontWeight: "300",
    },
    amountInput: {
        flex: 1,
        color: Colors.foreground,
        fontSize: 36,
        fontWeight: "700",
        letterSpacing: -0.5,
    },
    hairline: {
        height: 1,
        backgroundColor: Colors.foreground_hairline,
        marginBottom: 14,
    },
    descInput: {
        color: Colors.foreground,
        fontSize: 16,
        paddingVertical: 4,
        marginBottom: 14,
    },
    formFooter: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    categoryChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: "transparent",
    },
    categoryPicker: {
        height: 280,
        marginTop: 14,
    },
    listHeader: {
        marginTop: 28,
        marginBottom: 10,
        borderTopWidth: 1,
        borderTopColor: Colors.foreground_hairline,
        paddingTop: 18,
    },
})

export default SubExpenseSheet
