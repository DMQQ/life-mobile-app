import Colors from "@/constants/Colors"
import Color from "color"
import { StyleSheet, Text, View } from "react-native"
import Ripple from "react-native-material-ripple"
import useQuickCompleteTodo from "../hooks/mutation/useQuickCompleteTodo"

interface TodoPreviewCardProps {
    todo: {
        id: string
        title: string
        isCompleted: boolean
    }
    timelineId: string
    textColor?: string
}

export default function TodoPreviewCard({ todo, timelineId, textColor }: TodoPreviewCardProps) {
    const [completeTodo, { loading }] = useQuickCompleteTodo({
        todoId: todo.id,
        timelineId,
        currentlyCompleted: todo.isCompleted,
    })

    const handleToggle = () => {
        if (!loading) {
            completeTodo(!todo.isCompleted)
        }
    }

    return (
        <Ripple onPress={handleToggle} style={[styles.container, loading && styles.loading]}>
            <View style={[styles.checkbox, todo.isCompleted && styles.checkboxCompleted]}>
                {todo.isCompleted && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text
                numberOfLines={1}
                style={[
                    styles.todoText,
                    todo.isCompleted && styles.todoTextCompleted,
                    textColor && { color: textColor },
                ]}
            >
                {todo.title}
            </Text>
        </Ripple>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 10,
        paddingVertical: 10,
        gap: 8,
    },
    loading: {
        opacity: 0.7,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "transparent",
        borderWidth: 2,
        borderColor: Colors.secondary,
        alignItems: "center",
        justifyContent: "center",
    },
    checkboxCompleted: {
        backgroundColor: Colors.secondary,
        borderWidth: 0,
    },
    checkmark: {
        color: "white",
        fontSize: 12,
        fontWeight: "bold",
    },
    todoText: {
        fontSize: 13,
        flex: 1,
        color: Colors.text_light,
        fontWeight: "500",
    },
    todoTextCompleted: {
        textDecorationLine: "line-through",
        opacity: 0.6,
        color: Colors.text_dark,
    },
})
