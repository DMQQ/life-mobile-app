import { Expense as ExpenseType } from "@/types"
import { Feather } from "@expo/vector-icons"
import { useState } from "react"
import { StyleSheet, View } from "react-native"
import Text from "@/components/ui/Text/Text"
import { IconButton } from "@/components"
import Colors from "@/constants/Colors"
import Input from "@/components/ui/TextInput/TextInput"
import { useEditExpenseNote } from "../../hooks/useEditExpense"
import { GET_EXPENSE } from "../../pages/Expense"

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
                icon={<Feather name="edit-2" size={20} color={Colors.ternary} />}
                onPress={() => setIsEditing(!isEditing)}
            />
            {isEditing ? (
                <Input
                    placeholder="enter note text"
                    value={text}
                    onChangeText={setText}
                    containerStyle={{
                        flex: 1,
                        height: 40,
                    }}
                    right={
                        <IconButton
                            icon={<Feather name="check" size={20} color={Colors.secondary} />}
                            onPress={() => {
                                handleUpdateNote(text)
                                setIsEditing(false)
                            }}
                        />
                    }
                />
            ) : (
                <Text variant="body" style={{ color: Colors.secondary_light_2 }}>{expense.note || "-"}</Text>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 15,
        borderRadius: 15,
        backgroundColor: Colors.primary_light,
        marginTop: 10,
    },
})
