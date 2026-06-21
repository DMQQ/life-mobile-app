import { useRef, useState } from "react"
import { Pressable, StyleSheet } from "react-native"
import { gql, useMutation } from "@apollo/client"
import { SymbolView } from "expo-symbols"
import Feedback from "react-native-haptic-feedback"
import { ConfirmDialog, Caption } from "@/components"
import Section from "@/components/ui/Section"
import Colors from "@/constants/Colors"
import { useUploadSubExpense } from "../../hooks/useUploadSubExpense"
import AddSubExpenseSheet, { AddSubExpenseSheetHandle } from "./AddSubExpenseSheet"
import SubExpenseList from "./SubExpenseList"
import { useExpense } from "../../pages/ExpenseContext"

const DELETE_SUB_EXPENSE = gql`
    mutation DeleteSubExpense($id: ID!) {
        deleteSubExpense(id: $id)
    }
`

interface Props {
    onUpdate: React.Dispatch<React.SetStateAction<any>>
    tint?: string
}

export default function SubExpenseSection({ onUpdate, tint }: Props) {
    const expense = useExpense()
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
    const sheetRef = useRef<AddSubExpenseSheetHandle>(null)

    const [deleteSubExpense] = useMutation(DELETE_SUB_EXPENSE)
    const [uploadSubexpenses] = useUploadSubExpense(() => {})

    const handleAdd = async (item: { description: string; amount: number; category: string }) => {
        const result = await uploadSubexpenses({
            variables: {
                input: {
                    expenseId: expense.id,
                    inputs: [item],
                },
            },
        })
        if (result.data?.addMultipleSubExpenses) {
            onUpdate((prev: any) => ({
                ...prev,
                subexpenses: [...(prev.subexpenses ?? []), ...result.data!.addMultipleSubExpenses],
            }))
        }
    }

    const handleDeleteConfirm = async () => {
        if (!confirmDeleteId) return
        await deleteSubExpense({ variables: { id: confirmDeleteId } })
        onUpdate((prev: any) => ({
            ...prev,
            subexpenses: prev.subexpenses.filter((s: any) => s.id !== confirmDeleteId),
        }))
        setConfirmDeleteId(null)
    }

    const expandSheet = () => {
        Feedback.trigger("impactLight")
        sheetRef.current?.expand()
    }

    return (
        <>
            <Section
                title="Subexpenses"
                tint={tint}
                headerRight={
                    <Pressable onPress={expandSheet} style={styles.addBtn}>
                        <SymbolView name="plus.circle.fill" size={18} tintColor={Colors.secondary} />
                    </Pressable>
                }
            >
                {expense.subexpenses?.length ? (
                    <SubExpenseList
                        selected={expense as any}
                        handleDeleteSubExpense={(id) => setConfirmDeleteId(id)}
                    />
                ) : (
                    <Pressable onPress={expandSheet} style={styles.emptyRow}>
                        <Caption style={styles.emptyText}>Add sub-expenses to break down this expense</Caption>
                    </Pressable>
                )}
            </Section>

            <AddSubExpenseSheet ref={sheetRef} onAdd={handleAdd} />

            <ConfirmDialog
                isVisible={!!confirmDeleteId}
                onDismiss={() => setConfirmDeleteId(null)}
                onConfirm={handleDeleteConfirm}
                title="Delete Sub-Expense"
                description="This cannot be undone."
                destructive
            />
        </>
    )
}

const styles = StyleSheet.create({
    addBtn: {
        padding: 2,
    },
    emptyRow: {
        paddingHorizontal: 15,
        paddingVertical: 14,
    },
    emptyText: {
        color: Colors.text_dark,
    },
})
