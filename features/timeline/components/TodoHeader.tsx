import Colors from "@/constants/Colors"
import { Todos } from "@/types"
import { Pressable, StyleSheet, View } from "react-native"
import { Chip, Text, useTheme } from "react-native-paper"

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    addButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 100,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
})

interface TodoHeaderProps {
    todos: Todos[]
    onAddTodo: () => void
    onLongPress: () => void
}

export default function TodoHeader({ todos, onAddTodo, onLongPress }: TodoHeaderProps) {
    const theme = useTheme()
    const completedCount = todos.filter((todo) => todo.isCompleted).length

    return (
        <View style={styles.header}>
            <View style={styles.titleContainer}>
                <Text style={{ color: Colors.text_light, fontWeight: "600", fontSize: 20 }}>Todos</Text>
                <Chip
                    mode="outlined"
                    style={{
                        marginLeft: 12,
                        alignSelf: "center",
                    }}
                    textStyle={{ fontSize: 12 }}
                >
                    {completedCount}/{todos.length}
                </Chip>
            </View>

            <Pressable
                onPress={onAddTodo}
                onLongPress={onLongPress}
                style={[
                    styles.addButton,
                    {
                        backgroundColor: theme.colors.secondary,
                    },
                ]}
            >
                <Text style={{ color: theme.colors.onSecondary, fontWeight: "600", fontSize: 14 }}>+ Add Todo</Text>
            </Pressable>
        </View>
    )
}
