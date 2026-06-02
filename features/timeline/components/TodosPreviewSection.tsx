import Colors from "@/constants/Colors"
import { StyleSheet, View } from "react-native"
import Text from "@/components/ui/Text/Text"
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
                <Text size={11} opacity={0.6} align="center" italic color={textColor ?? Colors.text_dark} style={{ marginTop: 4 }}>
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
})
