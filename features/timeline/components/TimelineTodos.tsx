import { Card } from "@/components"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import { Todos } from "@/types"
import Color from "color"
import { useState } from "react"
import { StyleSheet, View } from "react-native"
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

export default function TimelineTodos(props: { sortedTodos: Todos[]; timelineId: string; expandSheet: () => void }) {
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
                <TodoHeader todos={props.sortedTodos} onAddTodo={handleAddTodo} onLongPress={handleLongPress} />

                {props.sortedTodos.length > 0 ? (
                    props.sortedTodos.map((todo, index) => (
                        <TodoItem key={todo.id} index={index} timelineId={props.timelineId} {...todo} />
                    ))
                ) : (
                    <Card style={styles.emptyState}>
                        <Text variant="body" style={styles.emptyText}>No todos yet. Tap "Add Todo" to get started!</Text>
                    </Card>
                )}
            </View>

            <TodoTransferDialog
                visible={showTransferDialog}
                onClose={() => setShowTransferDialog(false)}
                todos={props.sortedTodos}
            />
        </>
    )
}
