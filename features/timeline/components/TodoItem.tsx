import { Card } from "@/components"
import Checkbox from "@/components/ui/Checkbox"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import { Todos } from "@/types"
import Color from "color"
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native"
import Haptic from "react-native-haptic-feedback"
import Animated, { FadeInDown, FadeOutUp, LinearTransition } from "react-native-reanimated"
import useCompleteTodo from "../hooks/mutation/useCompleteTodo"
import useRemoveTodo from "../hooks/mutation/useRemoveTodo"

const styles = StyleSheet.create({
    todoCard: {
        marginBottom: 15,
        elevation: 1,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: Color(Colors.primary_light).lighten(0.3).hex(),
        padding: 2.5,
    },
    todoContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    todoLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    todoText: {
        marginLeft: 16,
        lineHeight: 24,
        flex: 1,
    },
    checkbox: {
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        width: 28,
        height: 28,
    },
    completedText: {
        textDecorationLine: "line-through",
        opacity: 0.6,
    },
})

export default function TodoItem(todo: Todos & { timelineId: string; index: number }) {
    const [removeTodo, { loading: removeLoading }] = useRemoveTodo(todo)
    const [completeTodo, { loading: completeLoading }] = useCompleteTodo({
        todoId: todo.id,
        timelineId: todo.timelineId,
        currentlyCompleted: todo.isCompleted,
    })

    const handleToggleComplete = () => {
        Haptic.trigger("impactLight")
        completeTodo()
    }

    const handleRemoveTodo = () => {
        Haptic.trigger("impactLight")
        removeTodo()
    }

    const isLoading = removeLoading || completeLoading

    return (
        <Animated.View layout={LinearTransition.delay(100)} entering={FadeInDown} exiting={FadeOutUp}>
            <Card
                animated
                entering={FadeInDown.delay(todo.index * 50)}
                style={[
                    styles.todoCard,
                    {
                        backgroundColor: Colors.primary_lighter,
                        opacity: todo.isCompleted ? 0.75 : 1,
                        borderColor: todo.isCompleted
                            ? Color(Colors.primary_light).lighten(0.2).hex()
                            : Color(Colors.primary_light).lighten(0.3).hex(),
                    },
                ]}
            >
                <Pressable onLongPress={handleRemoveTodo} onPress={handleToggleComplete} style={styles.todoContent}>
                    <View style={styles.todoLeft}>
                        <View style={styles.checkbox}>
                            {isLoading ? (
                                <ActivityIndicator size="small" color={Colors.secondary} />
                            ) : (
                                <Checkbox checked={todo.isCompleted} onPress={handleToggleComplete} size={28} />
                            )}
                        </View>

                        <Text
                            variant="subtitle"
                            color={todo.isCompleted ? Colors.secondary_light_1 : Colors.text_light}
                            style={[styles.todoText, todo.isCompleted && styles.completedText]}
                        >
                            {todo.title}
                        </Text>
                    </View>
                </Pressable>
            </Card>
        </Animated.View>
    )
}
