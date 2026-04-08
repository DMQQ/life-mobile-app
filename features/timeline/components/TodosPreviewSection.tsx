import Colors from "@/constants/Colors"
import { Pressable, StyleSheet, Text, View } from "react-native"
import TodoPreviewCard from "./TodoPreviewCard"

interface TodosPreviewSectionProps {
    todos: Array<{
        id: string
        title: string
        isCompleted: boolean
    }>
    timelineId: string
    occurrenceDate: string
    textColor?: string
    maxItems?: number
}

export default function TodosPreviewSection({
    todos,
    timelineId,
    occurrenceDate,
    textColor,
    maxItems = 3,
}: TodosPreviewSectionProps) {
    if (!todos || todos.length === 0) {
        return null
    }

    const visibleTodos = todos.slice(0, maxItems)
    const remainingCount = todos.length - maxItems

    return (
        <View style={styles.container}>
            {visibleTodos.map((todo) => (
                <TodoPreviewCard
                    key={todo.id}
                    todo={todo}
                    timelineId={timelineId}
                    occurrenceDate={occurrenceDate}
                    textColor={textColor}
                />
            ))}
            {remainingCount > 0 && (
                <Text style={[styles.moreText, textColor && { color: textColor }]}>
                    +{remainingCount} more todo{remainingCount > 1 ? "s" : ""}
                </Text>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        gap: 3,
    },
    moreText: {
        fontSize: 11,
        opacity: 0.6,
        textAlign: "center",
        marginTop: 4,
        color: Colors.text_dark,
        fontStyle: "italic",
    },
})
