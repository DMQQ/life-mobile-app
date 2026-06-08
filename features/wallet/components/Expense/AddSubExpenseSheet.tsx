import { FONTS } from "@/constants/Fonts"
import Colors from "@/constants/Colors"
import GlassView from "@/components/ui/GlassView"
import GlassButton from "@/components/ui/GlassButton"
import Text from "@/components/ui/Text/Text"
import { ConfirmDialog } from "@/components"
import { Icons, CategoryUtils } from "@/features/wallet/components/Expense/ExpenseIcon"
import { SubExpense } from "@/features/wallet/context/CreateExpenseContext"
import { Host, BottomSheet, Group, RNHostView } from "@expo/ui/swift-ui"
import {
    presentationDetents,
    presentationDragIndicator,
    background,
    frame,
    ignoreSafeArea,
} from "@expo/ui/swift-ui/modifiers"
import { Feather } from "@expo/vector-icons"
import moment from "moment"
import React, { forwardRef, useImperativeHandle, useState } from "react"
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native"
import Feedback from "react-native-haptic-feedback"
import Color from "color"
import CategorySelector from "@/features/wallet/components/CreateExpense/CategorySelectorView"
import WalletItem from "@/features/wallet/components/Wallet/WalletItem"

export interface AddSubExpenseSheetHandle {
    expand: () => void
}

interface Props {
    onAdd: (item: { description: string; amount: number; category: string }) => Promise<void> | void
    items?: SubExpense[]
    onDelete?: (id: string) => void
    date?: string | null
}

const EMPTY = { description: "", amount: "", category: "none" as keyof typeof Icons }

const AddSubExpenseSheet = forwardRef<AddSubExpenseSheetHandle, Props>(({ onAdd, items, onDelete, date }, ref) => {
    const [isPresented, setIsPresented] = useState(false)
    const [form, setForm] = useState(EMPTY)
    const [showCategoryPicker, setShowCategoryPicker] = useState(false)
    const [loading, setLoading] = useState(false)
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

    const hasItemsList = items !== undefined

    useImperativeHandle(ref, () => ({
        expand: () => {
            setForm(EMPTY)
            setShowCategoryPicker(false)
            setIsPresented(true)
        },
    }))

    const canAdd = form.description.trim().length > 0 && parseFloat(form.amount) > 0

    const handleAdd = async () => {
        if (!canAdd || loading) return
        Feedback.trigger("impactMedium")
        setLoading(true)
        try {
            await Promise.resolve(
                onAdd({
                    description: form.description.trim(),
                    amount: parseFloat(form.amount),
                    category: form.category,
                }),
            )
            setForm(EMPTY)
            setShowCategoryPicker(false)
            if (!hasItemsList) setIsPresented(false)
        } finally {
            setLoading(false)
        }
    }

    const hasCategory = form.category !== "none"
    const catColor = hasCategory
        ? Color(Icons[form.category]?.backgroundColor ?? Colors.secondary)
              .lighten(0.25)
              .hex()
        : undefined

    const formattedDate = date ? moment(date).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD")

    return (
        <>
            <Host style={{ position: "absolute", width: 0, height: 0 }}>
                <BottomSheet
                    isPresented={isPresented}
                    onIsPresentedChange={(p) => {
                        setIsPresented(p)
                        if (!p) {
                            setForm(EMPTY)
                            setShowCategoryPicker(false)
                        }
                    }}
                >
                    <Group
                        modifiers={[
                            presentationDetents([{ fraction: 0.88 }]),
                            presentationDragIndicator("visible"),
                            background(Colors.primary),
                            frame({ maxWidth: 10000, maxHeight: 10000 }),
                            ignoreSafeArea({ edges: "bottom" }),
                        ]}
                    >
                        {/* @ts-ignore */}
                        <RNHostView>
                            <View style={styles.sheetBackground}>
                                <ScrollView
                                    style={styles.scrollView}
                                    contentContainerStyle={styles.container}
                                    keyboardDismissMode="on-drag"
                                    showsVerticalScrollIndicator={false}
                                >
                                    <Text variant="subtitle" style={styles.title}>
                                        {hasItemsList ? "Sub-expenses" : "Add Sub-expense"}
                                    </Text>

                                    <View style={styles.amountRow}>
                                        <Text variant="body" muted style={styles.currency}>
                                            zł
                                        </Text>
                                        <TextInput
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

                                    <TextInput
                                        style={styles.descInput}
                                        value={form.description}
                                        onChangeText={(t) => setForm((p) => ({ ...p, description: t }))}
                                        placeholder="What is this for?"
                                        placeholderTextColor={Colors.text_dark}
                                        returnKeyType="done"
                                        onSubmitEditing={handleAdd}
                                        selectionColor={Colors.secondary}
                                    />

                                    <View style={styles.hairline} />

                                    <View style={styles.footer}>
                                        <Pressable
                                            onPress={() => {
                                                Feedback.trigger("impactLight")
                                                setShowCategoryPicker(true)
                                            }}
                                        >
                                            <GlassView
                                                style={[styles.categoryChip, hasCategory && { borderColor: catColor }]}
                                            >
                                                <Feather
                                                    name="tag"
                                                    size={13}
                                                    color={hasCategory ? catColor : Colors.foreground_secondary}
                                                />
                                                <Text
                                                    variant="caption"
                                                    style={hasCategory ? { color: catColor } : undefined}
                                                >
                                                    {hasCategory
                                                        ? CategoryUtils.getCategoryName(form.category)
                                                        : "Category"}
                                                </Text>
                                            </GlassView>
                                        </Pressable>

                                        <GlassButton
                                            label={loading ? "Adding…" : "Add"}
                                            icon="plus"
                                            variant="accent"
                                            onPress={handleAdd}
                                            disabled={!canAdd || loading}
                                            loading={loading}
                                        />
                                    </View>

                                    {showCategoryPicker && (
                                        <View style={styles.categoryPicker}>
                                            <CategorySelector
                                                current={form.category}
                                                onPress={(item) => {
                                                    setForm((p) => ({
                                                        ...p,
                                                        category: item as keyof typeof Icons,
                                                    }))
                                                    setShowCategoryPicker(false)
                                                }}
                                                dismiss={() => setShowCategoryPicker(false)}
                                            />
                                        </View>
                                    )}

                                    {hasItemsList && items!.length > 0 && (
                                        <>
                                            <View style={styles.listHeader}>
                                                <Text variant="label">Added ({items!.length})</Text>
                                            </View>
                                            {items!.map((item) => (
                                                <WalletItem
                                                    key={item.id}
                                                    handlePress={() => setConfirmDeleteId(item.id)}
                                                    id={item.id}
                                                    amount={item.amount}
                                                    description={item.description}
                                                    date={formattedDate}
                                                    type="expense"
                                                    category={item.category}
                                                    balanceBeforeInteraction={0}
                                                    spontaneousRate={0}
                                                    subscription={null}
                                                    location={null}
                                                    subexpenses={[]}
                                                    files={[]}
                                                />
                                            ))}
                                        </>
                                    )}
                                </ScrollView>
                            </View>
                        </RNHostView>
                    </Group>
                </BottomSheet>
            </Host>

            {onDelete && (
                <ConfirmDialog
                    isVisible={!!confirmDeleteId}
                    onDismiss={() => setConfirmDeleteId(null)}
                    onConfirm={() => {
                        onDelete(confirmDeleteId!)
                        setConfirmDeleteId(null)
                    }}
                    title="Delete Sub-expense"
                    description="Are you sure you want to delete this sub-expense?"
                    destructive
                />
            )}
        </>
    )
})

AddSubExpenseSheet.displayName = "AddSubExpenseSheet"

const styles = StyleSheet.create({
    sheetBackground: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    scrollView: {
        flex: 1,
    },
    container: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
    title: {
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
        fontFamily: FONTS.regular,
    },
    amountInput: {
        flex: 1,
        color: Colors.foreground,
        fontSize: 36,
        fontFamily: FONTS.bold,
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
    footer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 2,
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

export default AddSubExpenseSheet
