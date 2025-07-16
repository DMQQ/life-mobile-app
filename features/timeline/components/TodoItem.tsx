import Colors from "@/constants/Colors"
import { Todos } from "@/types"
import Color from "color"
import { Pressable, StyleSheet, View } from "react-native"
import { Card, Checkbox, Text, useTheme } from "react-native-paper"
import Animated, { FadeInDown, FadeOutUp, LinearTransition } from "react-native-reanimated"
import useCompleteTodo from "../hooks/mutation/useCompleteTodo"
import useRemoveTodo from "../hooks/mutation/useRemoveTodo"

const styles = StyleSheet.create({
    todoCard: {
        marginBottom: 12,
        elevation: 1,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Color(Colors.primary_light).lighten(0.3).hex(),
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
        fontSize: 16,
        lineHeight: 24,
        flex: 1,
    },
    checkbox: {
        backgroundColor: Color(Colors.primary_lighter).lighten(0.5).hex(),
        borderRadius: 12,
    },
    completedText: {
        textDecorationLine: "line-through",
        opacity: 0.6,
    },
})

export default function TodoItem(todo: Todos & { timelineId: string }) {
    const removeTodo = useRemoveTodo(todo)
    const { completeTodo } = useCompleteTodo({
        todoId: todo.id,
        timelineId: todo.timelineId,
        currentlyCompleted: todo.isCompleted,
    })
    const theme = useTheme()

    const handleToggleComplete = () => {
        completeTodo()
    }

    return (
        <Animated.View layout={LinearTransition.delay(100)} entering={FadeInDown} exiting={FadeOutUp}>
            <Card
                style={[
                    styles.todoCard,
                    {
                        backgroundColor: todo.isCompleted
                            ? Color(Colors.primary_lighter).lighten(0.05).hex()
                            : Color(Colors.primary_lighter).lighten(0.15).hex(),
                        opacity: todo.isCompleted ? 0.8 : 1,
                        borderColor: todo.isCompleted
                            ? Color(Colors.primary_light).lighten(0.2).hex()
                            : Color(Colors.primary_light).lighten(0.3).hex(),
                    },
                ]}
            >
                <Pressable
                    onLongPress={() => removeTodo()}
                    onPress={handleToggleComplete}
                    style={styles.todoContent}
                    android_ripple={{
                        color: theme.colors.primary,
                        borderless: false,
                    }}
                >
                    <View style={styles.todoLeft}>
                        <View style={styles.checkbox}>
                            <Checkbox
                                status={todo.isCompleted ? "checked" : "unchecked"}
                                onPress={handleToggleComplete}
                                uncheckedColor={Colors.primary_darker}
                                color={Colors.secondary}
                            />
                        </View>

                        <Text
                            variant="bodyLarge"
                            style={[
                                styles.todoText,
                                {
                                    color: todo.isCompleted ? Colors.secondary_light_1 : theme.colors.onSurface,
                                },
                                todo.isCompleted && styles.completedText,
                            ]}
                        >
                            {todo.title}
                        </Text>
                    </View>
                </Pressable>
            </Card>
        </Animated.View>
    )
}
