import { Card } from "@/components"
import Checkbox from "@/components/ui/Checkbox"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import { Todos } from "@/types"
import dayjs from "dayjs"
import { useRef } from "react"
import { ActivityIndicator, StyleSheet, View } from "react-native"
import Haptic from "react-native-haptic-feedback"
import { FadeInDown, FadeOutDown } from "react-native-reanimated"
import useCompleteTodo from "../hooks/mutation/useCompleteTodo"
import useRemoveTodo from "../hooks/mutation/useRemoveTodo"

const styles = StyleSheet.create({
    todoCard: {
        marginBottom: 15,
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    todoContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingHorizontal: 16,
    },

    todoText: {
        marginLeft: 16,
        lineHeight: 24,
        flex: 1,
    },
    checkbox: {},
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

    const tapCountRef = useRef(0)
    const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const isProcessingRef = useRef(false)

    const handleToggleComplete = () => {
        if (isProcessingRef.current) return

        tapCountRef.current += 1

        if (tapTimeoutRef.current) {
            clearTimeout(tapTimeoutRef.current)
        }

        if (tapCountRef.current === 1) {
            tapTimeoutRef.current = setTimeout(() => {
                tapCountRef.current = 0
            }, 300)
        } else if (tapCountRef.current === 2) {
            if (tapTimeoutRef.current) {
                clearTimeout(tapTimeoutRef.current)
            }
            tapCountRef.current = 0
            isProcessingRef.current = true

            Haptic.trigger("impactLight")

            completeTodo()
                .then((result) => {
                    console.log("Mutation completed:", result)
                    isProcessingRef.current = false
                })
                .catch((error) => {
                    console.error("Mutation error:", error)
                    isProcessingRef.current = false
                })
        }
    }

    const handleRemoveTodo = () => {
        Haptic.trigger("impactLight")
        removeTodo()
    }

    const isLoading = removeLoading || completeLoading

    return (
        <Card
            ripple
            onLongPress={handleRemoveTodo}
            onPress={handleToggleComplete}
            animated
            entering={FadeInDown.delay(todo.index * 50)}
            exiting={FadeOutDown}
            style={[styles.todoCard]}
        >
            <View style={styles.checkbox}>
                {isLoading ? (
                    <>
                        {completeLoading && <ActivityIndicator size="small" color={Colors.secondary} />}
                        {removeLoading && <ActivityIndicator size="small" color={Colors.error} />}
                    </>
                ) : (
                    <Checkbox checked={todo.isCompleted} onPress={handleToggleComplete} size={28} />
                )}
            </View>

            <View style={{ flex: 1 }}>
                <Text
                    variant="subtitle"
                    color={todo.isCompleted ? Colors.secondary_light_1 : Colors.text_light}
                    style={[styles.todoText, todo.isCompleted && styles.completedText]}
                >
                    {todo.title.trim()}
                </Text>
                <Text
                    variant="caption"
                    color={Colors.text_dark}
                    style={{ fontSize: 12, textAlign: "right", marginTop: 5 }}
                >
                    {dayjs(todo.modifiedAt).format("HH:mm - DD/MM")}
                </Text>
            </View>
        </Card>
    )
}
