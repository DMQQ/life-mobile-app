import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import { Todos } from "@/types"
import lowOpacity from "@/utils/functions/lowOpacity"
import { Pressable, StyleSheet, View } from "react-native"

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
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 100,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        borderWidth: 1,
        borderColor: Colors.secondary,
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
                <Text variant="subheading" color={Colors.text_light}>
                    Todos
                </Text>
                <Text
                    variant="body"
                    style={{
                        marginLeft: 12,
                        alignSelf: "center",
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
                        backgroundColor: lowOpacity(Colors.secondary, 0.2),
                    },
                ]}
            >
                <Text variant="caption" color={Colors.secondary_light_1}>
                    Add todo
                </Text>
            </Pressable>
        </View>
    )
}
