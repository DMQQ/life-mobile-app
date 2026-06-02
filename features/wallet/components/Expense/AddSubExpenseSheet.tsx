import { FONTS } from "@/constants/Fonts"
import Colors from "@/constants/Colors"
import GlassView from "@/components/ui/GlassView"
import GlassButton from "@/components/ui/GlassButton"
import Text from "@/components/ui/Text/Text"
import { Icons, CategoryUtils } from "@/features/wallet/components/Expense/ExpenseIcon"
import BottomSheetModal, { BottomSheetTextInput, BottomSheetView } from "@gorhom/bottom-sheet"
import type { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { Feather } from "@expo/vector-icons"
import React, { forwardRef, useImperativeHandle, useRef, useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"
import Feedback from "react-native-haptic-feedback"
import Color from "color"
import CategorySelector from "@/features/wallet/components/CreateExpense/CategorySelectorView"

export interface AddSubExpenseSheetHandle {
    expand: () => void
}

interface Props {
    onAdd: (item: { description: string; amount: number; category: string }) => Promise<void>
}

const EMPTY = { description: "", amount: "", category: "none" as keyof typeof Icons }

const AddSubExpenseSheet = forwardRef<AddSubExpenseSheetHandle, Props>(({ onAdd }, ref) => {
    const sheetRef = useRef<BottomSheetModalMethods>(null)
    const [form, setForm] = useState(EMPTY)
    const [showCategoryPicker, setShowCategoryPicker] = useState(false)
    const [loading, setLoading] = useState(false)

    useImperativeHandle(ref, () => ({
        expand: () => {
            setForm(EMPTY)
            setShowCategoryPicker(false)
            sheetRef.current?.expand()
        },
    }))

    const canAdd = form.description.trim().length > 0 && parseFloat(form.amount) > 0

    const handleAdd = async () => {
        if (!canAdd || loading) return
        Feedback.trigger("impactMedium")
        setLoading(true)
        try {
            await onAdd({
                description: form.description.trim(),
                amount: parseFloat(form.amount),
                category: form.category,
            })
            sheetRef.current?.close()
        } finally {
            setLoading(false)
        }
    }

    const openCategoryPicker = () => {
        Feedback.trigger("impactLight")
        setShowCategoryPicker(true)
    }

    const closeCategoryPicker = () => {
        setShowCategoryPicker(false)
    }

    const hasCategory = form.category !== "none"
    const catColor = hasCategory
        ? Color(Icons[form.category]?.backgroundColor ?? Colors.secondary)
              .lighten(0.25)
              .hex()
        : undefined

    return (
        <BottomSheetModal
            ref={sheetRef}
            index={-1}
            snapPoints={["88%"]}
            animateOnMount={false}
            handleIndicatorStyle={{ backgroundColor: Colors.foreground_hairline, width: 40 }}
            backgroundStyle={styles.sheetBg}
            keyboardBehavior="extend"
            enablePanDownToClose
        >
            <BottomSheetView style={styles.container}>
                <Text variant="subtitle" style={styles.title}>
                    Add Sub-expense
                </Text>

                <View style={styles.amountRow}>
                    <Text variant="body" muted style={styles.currency}>
                        zł
                    </Text>
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
                    placeholder="What is this for?"
                    placeholderTextColor={Colors.text_dark}
                    returnKeyType="done"
                    onSubmitEditing={handleAdd}
                    selectionColor={Colors.secondary}
                />

                <View style={styles.hairline} />

                <View style={styles.footer}>
                    <Pressable onPress={openCategoryPicker}>
                        <GlassView style={[styles.categoryChip, hasCategory && { borderColor: catColor }]}>
                            <Feather
                                name="tag"
                                size={13}
                                color={hasCategory ? catColor : Colors.foreground_secondary}
                            />
                            <Text variant="caption" style={hasCategory ? { color: catColor } : undefined}>
                                {hasCategory ? CategoryUtils.getCategoryName(form.category) : "Category"}
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
                                setForm((p) => ({ ...p, category: item as keyof typeof Icons }))
                                closeCategoryPicker()
                            }}
                            dismiss={closeCategoryPicker}
                        />
                    </View>
                )}
            </BottomSheetView>
        </BottomSheetModal>
    )
})

AddSubExpenseSheet.displayName = "AddSubExpenseSheet"

const styles = StyleSheet.create({
    sheetBg: {
        backgroundColor: Colors.primary_light,
        borderWidth: 1,
        borderColor: Color(Colors.primary_light).lighten(0.4).hex(),
    },
    container: {
        paddingHorizontal: 20,
        paddingTop: 4,
        paddingBottom: 32,
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
        fontFamily: FONTS.light,
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
})

export default AddSubExpenseSheet
