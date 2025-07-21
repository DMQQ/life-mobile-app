import Colors from "@/constants/Colors"
import { Todos } from "@/types"
import Color from "color"
import { Pressable, StyleSheet, Text, View } from "react-native"

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
        justifyContent: "center",
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
    const completedCount = todos.filter((todo) => todo.isCompleted).length

    return (
        <View style={styles.header}>
            <View style={styles.titleContainer}>
                <Text style={{ color: Colors.text_light, fontWeight: "600", fontSize: 20 }}>Todos</Text>
                <Text
                    style={{
                        marginLeft: 12,
                        alignSelf: "center",
                        color: Colors.foreground,
                    }}
                >
                    {completedCount}/{todos.length}
                </Text>
            </View>

            <Pressable
                onPress={onAddTodo}
                onLongPress={onLongPress}
                style={[
                    styles.addButton,
                    {
                        backgroundColor: Color(Colors.primary_lighter).lighten(0.15).hex(),
                    },
                ]}
            >
                <Text style={{ color: Colors.text_light, fontWeight: "500", fontSize: 14 }}>+ Add Todo</Text>
            </Pressable>
        </View>
    )
}
