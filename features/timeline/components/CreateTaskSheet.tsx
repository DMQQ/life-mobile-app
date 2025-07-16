import BottomSheet from "@/components/ui/BottomSheet/BottomSheet"
import Button from "@/components/ui/Button/Button"
import Input from "@/components/ui/TextInput/TextInput"
import Colors from "@/constants/Colors"
import useKeyboard from "@/utils/hooks/useKeyboard"
import BottomSheetType from "@gorhom/bottom-sheet"
import Color from "color"
import { forwardRef, useEffect, useRef, useState } from "react"
import { ActivityIndicator, Keyboard, StyleSheet, View } from "react-native"
import { Card, Chip, IconButton, Text, useTheme } from "react-native-paper"
import useTodos, { Action, TodoInput as ITodoInput } from "../hooks/general/useTodos"

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingTop: 8,
        flex: 1,
        paddingBottom: 15,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: "600",
    },
    subtitle: {
        marginTop: 2,
        opacity: 0.8,
    },
    todosList: {
        flex: 1,
        marginBottom: 12,
    },
    saveButton: {
        marginTop: 8,
        marginBottom: 16,
    },
})

export default forwardRef<
    BottomSheetType,
    {
        timelineId: string
    }
>(({ timelineId }, ref) => {
    const { dispatch, loading, onSaveTodos, state } = useTodos(timelineId, () => {
        Keyboard.dismiss()
        ;(ref as any).current?.close()
    })
    const theme = useTheme()
    const keyboardHeight = useKeyboard()
    const todoCount = state.todos.filter((todo) => todo.value.trim().length > 0).length

    // Calculate dynamic snap points based on keyboard height
    const snapPoints = ["90%"]

    return (
        <BottomSheet ref={ref} snapPoints={snapPoints}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.title, { color: Colors.secondary }]}>Create Todos</Text>
                        <Text variant="bodyMedium" style={[styles.subtitle, { color: Colors.text_light }]}>
                            {todoCount} todo{todoCount !== 1 ? "s" : ""} ready to save
                        </Text>
                    </View>

                    <Chip
                        mode="outlined"
                        onPress={() => dispatch({ type: "clear", payload: undefined })}
                        style={{ borderColor: theme.colors.error }}
                        textStyle={{ color: theme.colors.error }}
                    >
                        Clear All
                    </Chip>
                </View>

                <TodosList dispatch={dispatch} todos={state.todos} />

                <Button
                    disabled={loading || todoCount === 0}
                    onPress={onSaveTodos}
                    style={styles.saveButton}
                    fontStyle={{ fontSize: 16 }}
                    icon={loading && <ActivityIndicator style={{ marginHorizontal: 10 }} color="#fff" size="small" />}
                >
                    Save {todoCount} todo{todoCount !== 1 ? "s" : ""}
                </Button>
            </View>
        </BottomSheet>
    )
})

const TodosList = ({ todos, dispatch }: { todos: ITodoInput[]; dispatch: React.Dispatch<Action> }) => {
    const onAddTodo = (value: string) => {
        dispatch({ type: "add", payload: value })
    }

    const onRemoveTodo = (todo: ITodoInput) => {
        dispatch({ type: "remove", payload: todo.index })
    }

    return (
        <View style={styles.todosList}>
            <TodoInput onAddTodo={onAddTodo} />
            <View style={{ marginBottom: 8 }}>
                {todos.map((todo, index) => (
                    <Todo key={todo.index} {...todo} onRemove={() => onRemoveTodo(todo)} />
                ))}
            </View>
        </View>
    )
}

const Todo = (
    todo: ITodoInput & {
        onRemove: () => any
    },
) => {
    const theme = useTheme()

    return (
        <Card
            style={{
                marginBottom: 8,
                borderRadius: 12,
                backgroundColor: Color(Colors.primary_lighter).lighten(0.1).hex(),
                borderWidth: 1,
                borderColor: Color(Colors.primary_light).lighten(0.2).hex(),
            }}
        >
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                }}
            >
                <Text
                    variant="bodyMedium"
                    style={{
                        color: theme.colors.onSurface,
                        flex: 1,
                        fontSize: 15,
                    }}
                >
                    {todo.value}
                </Text>

                <IconButton
                    icon="close"
                    size={18}
                    iconColor={theme.colors.error}
                    onPress={todo.onRemove}
                    style={{ margin: 0, marginLeft: 8 }}
                />
            </View>
        </Card>
    )
}

export const TodoInput = ({ onAddTodo }: { onAddTodo: (value: string) => any }) => {
    const [text, setText] = useState<string>("")
    const theme = useTheme()
    const ref = useRef<any>()

    const onSubmit = () => {
        if (text.trim().length > 0) {
            onAddTodo(text)
            setText("")
        }
    }

    useEffect(() => {
        if (ref.current === null || text.trim() === "") return
        let timeout = setTimeout(() => {
            ref.current.focus()
        }, 100)

        return () => clearTimeout(timeout)
    }, [text])

    return (
        <Input
            inputRef={ref}
            style={{
                margin: 0,
                backgroundColor: "transparent",
                borderWidth: 0,
            }}
            right={
                <IconButton
                    icon="plus"
                    size={22}
                    iconColor={text.trim() ? theme.colors.secondary : theme.colors.onSurfaceVariant}
                    onPress={onSubmit}
                    disabled={!text.trim()}
                />
            }
            placeholderTextColor={theme.colors.onSurfaceVariant}
            value={text}
            onChangeText={setText}
            placeholder="What needs to be done?"
            onSubmitEditing={onSubmit}
            multiline
            numberOfLines={1}
        />
    )
}
