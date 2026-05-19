import { Expense as ExpenseType } from "@/types"
import { Feather } from "@expo/vector-icons"
import { useState } from "react"
import { StyleSheet, View, TextInput } from "react-native"
import Text from "@/components/ui/Text/Text"
import { IconButton } from "@/components"
import Colors from "@/constants/Colors"
import { useEditExpenseNote } from "../../hooks/useEditExpense"
import { GET_EXPENSE } from "../../hooks/getExpenseQuery"

export default function EditNote({ expense }: { expense: ExpenseType }) {
    const [isEditing, setIsEditing] = useState(false)
    const [text, setText] = useState(expense.note || "")
    const [mutation] = useEditExpenseNote()

    const handleUpdateNote = async (newNote: string) => {
        try {
            await mutation({
                variables: {
                    input: { expenseId: expense.id, note: newNote },
                },
                refetchQueries: [
                    {
                        query: GET_EXPENSE,
                        variables: { id: expense.id },
                    },
                ],
            })
        } catch (error) {
            console.error("Error updating note:", error)
        }
    }

    return (
        <View style={[styles.row, { height: 60, gap: 15, alignItems: "center", paddingLeft: 20 }]}>
            <IconButton
                icon={<Feather name="edit-2" size={20} color={Colors.foreground_secondary} />}
                onPress={() => setIsEditing(!isEditing)}
            />
            {isEditing ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                    <TextInput
                        placeholder="enter note text"
                        value={text}
                        onChangeText={setText}
                        textAlign="right"
                        style={{
                            flex: 1,
                            color: Colors.foreground_secondary,
                        }}
                    />
                    <IconButton
                        icon={<Feather name="check" size={20} color={Colors.secondary} />}
                        onPress={() => {
                            handleUpdateNote(text)
                            setIsEditing(false)
                        }}
                    />
                </View>
            ) : (
                <Text variant="body" style={{ color: Colors.foreground_secondary }}>
                    {expense.note || "-"}
                </Text>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 15,
        borderRadius: 15,
    },
})
