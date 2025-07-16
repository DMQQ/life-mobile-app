import Colors from "@/constants/Colors"
import { Todos } from "@/types"
import Color from "color"
import { useState } from "react"
import { StyleSheet, View } from "react-native"
import { Surface, Text } from "react-native-paper"
import TodoHeader from "./TodoHeader"
import TodoItem from "./TodoItem"
import TodoTransferDialog from "./TodoTransferDialog"

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: 32,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Color(Colors.primary_light).lighten(0.3).hex(),
        backgroundColor: Color(Colors.primary_lighter).lighten(0.1).hex(),
    },
    emptyText: {
        marginTop: 16,
        opacity: 0.7,
    },
})

export default function TimelineTodos(props: { todos: Todos[]; timelineId: string; expandSheet: () => void }) {
    const [showTransferDialog, setShowTransferDialog] = useState(false)

    const handleAddTodo = () => {
        props.expandSheet()
    }

    const handleLongPress = () => {
        setShowTransferDialog(true)
    }

    return (
        <>
            <View style={styles.container}>
                <TodoHeader
                    todos={props.todos}
                    onAddTodo={handleAddTodo}
                    onLongPress={handleLongPress}
                />

                {props.todos.length > 0 ? (
                    props.todos.map((todo) => (
                        <TodoItem
                            key={todo.id}
                            timelineId={props.timelineId}
                            {...todo}
                        />
                    ))
                ) : (
                    <Surface style={styles.emptyState} elevation={1}>
                        <Text variant="bodyLarge" style={styles.emptyText}>
                            No todos yet. Tap "Add Todo" to get started!
                        </Text>
                    </Surface>
                )}
            </View>

            <TodoTransferDialog
                visible={showTransferDialog}
                onClose={() => setShowTransferDialog(false)}
                todos={props.todos}
            />
        </>
    )
}