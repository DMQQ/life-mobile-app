import BottomSheet from "@/components/ui/BottomSheet/BottomSheet"
import Button from "@/components/ui/Button/Button"
import Input from "@/components/ui/TextInput/TextInput"
import Colors from "@/constants/Colors"
import useKeyboard from "@/utils/hooks/useKeyboard"
import BottomSheetType from "@gorhom/bottom-sheet"
import Color from "color"
import { forwardRef, useEffect, useRef, useState } from "react"
import { ActivityIndicator, Keyboard, StyleSheet, View } from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import { Card, Chip, IconButton, Text, useTheme } from "react-native-paper"
import { useSafeAreaInsets } from "react-native-safe-area-context"
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
        fontSize: 20,
        fontWeight: "600",
    },
    subtitle: {
        marginTop: 2,
        fontSize: 12,
    },
    todosList: {
        flex: 1,
        marginBottom: 12,
    },
    saveButton: {
        marginTop: 8,
        borderRadius: 100,
        flexDirection: "row-reverse",
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
    const todoCount = state.todos.filter((todo) => todo.value.trim().length > 0).length

    const snapPoints = ["60%"]

    const insets = useSafeAreaInsets()

    const keyboard = useKeyboard()

    useEffect(() => {
        if (!keyboard) ref?.current.collapse()
    }, [keyboard])

    return (
        <BottomSheet
            ref={ref}
            snapPoints={snapPoints}
            onChange={(index) => {
                if (index === -1) {
                    Keyboard.dismiss()
                }
            }}
        >
            <ScrollView style={styles.container} keyboardDismissMode="on-drag">
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.title]}>Create Todos</Text>
                        <Text variant="bodySmall" style={[styles.subtitle, { color: Colors.text_dark }]}>
                            {todoCount} todo{todoCount !== 1 ? "s" : ""} ready to save
                        </Text>
                    </View>

                    <Chip
                        mode="outlined"
                        onPress={() => dispatch({ type: "clear", payload: undefined })}
                        style={{ borderColor: theme.colors.error, backgroundColor: "transparent" }}
                        textStyle={{ color: theme.colors.error }}
                    >
                        Clear All
                    </Chip>
                </View>

                <TodosList dispatch={dispatch} todos={state.todos} />
            </ScrollView>
            <View style={{ paddingHorizontal: 15, marginBottom: insets.bottom, paddingTop: 15 }}>
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
        dispatch({ type: "add", payload: value.trim() })
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
            useBottomSheetInput
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
                    iconColor={text.trim() ? Colors.secondary : Colors.primary_lighter}
                    onPress={onSubmit}
                    disabled={!text.trim()}
                />
            }
            placeholderTextColor={theme.colors.onSurfaceVariant}
            value={text}
            onChangeText={setText}
            placeholder="What needs to be done?"
            onSubmitEditing={onSubmit}
            multiline={true}
            numberOfLines={1}
            blurOnSubmit={true}
            onEndEditing={onSubmit}
            returnKeyLabel="Add todo"
            returnKeyType="done"
            enterKeyHint="done"
            keyboardAppearance="dark"
            enablesReturnKeyAutomatically
        />
    )
}
