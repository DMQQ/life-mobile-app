import { Card, IconButton } from "@/components"
import Button from "@/components/ui/Button/Button"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import { AntDesign } from "@expo/vector-icons"
import Color from "color"
import { BlurView } from "expo-blur"
import { useEffect, useRef, useState } from "react"
import { Keyboard, StyleSheet, TextInput, View } from "react-native"
import { FlatList } from "react-native-gesture-handler"
import Animated, { interpolate, useAnimatedKeyboard, useAnimatedProps, useAnimatedStyle } from "react-native-reanimated"
import useTodos, { Action, TodoInput as ITodoInput } from "../hooks/general/useTodos"
import type { TimelineScreenProps } from "../types"

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
        marginBottom: 15,
        paddingTop: 30,
        paddingHorizontal: 15,
    },
    title: {
        color: Colors.foreground,
    },
    subtitle: {
        marginTop: 2,
    },
    todosList: {
        flex: 1,
        paddingHorizontal: 15,
    },
    saveButton: {
        marginTop: 8,
        borderRadius: 100,
        flexDirection: "row-reverse",
    },
    stickyFooter: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
    },

    todoCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: 15,
        marginBottom: 12,
        backgroundColor: Colors.primary_lighter,
    },

    todoCardRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingHorizontal: 12,
    },

    clearAll: {
        borderWidth: 1,
        borderColor: Colors.error,
        backgroundColor: "transparent",
        padding: 5,
        paddingHorizontal: 10,
    },

    blur: {
        paddingHorizontal: 16,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: Color(Colors.text_dark).alpha(0.1).string(),
    },
    blurBackground: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    blurContent: {},
})

import Feedback from "react-native-haptic-feedback"

export default function CreateTimelineTodos({ route, navigation }: TimelineScreenProps<"CreateTimelineTodos">) {
    const mode = route.params?.mode || "create"

    const { dispatch, loading, onSaveTodos, state } = useTodos(route.params?.timelineId || "", () => {
        Keyboard.dismiss()
        navigation.goBack()
    })

    useEffect(() => {
        if (route.params?.todos?.length > 0) {
            console.log("Setting todos from route params", route.params.todos)
            dispatch({ type: "set", payload: route.params.todos })
        }
    }, [route.params?.todos])

    const todoCount = state.todos.filter((todo) => todo.value.trim().length > 0).length

    const onSubmit = () => {
        if (mode === "push-back") {
            const todos = state.todos.map((t) => t.value)

            navigation.popTo(
                "TimelineCreate",
                {
                    todos,
                },
                { merge: true },
            )

            return
        }

        onSaveTodos()
    }

    return (
        <View style={{ flex: 1, backgroundColor: "transparent" }}>
            <View style={styles.header}>
                <View>
                    <Text variant="subheading" style={styles.title}>
                        Create Todos
                    </Text>
                    <Text variant="caption" color={Colors.text_dark} style={styles.subtitle}>
                        {todoCount} todo{todoCount !== 1 ? "s" : ""} ready to save
                    </Text>
                </View>

                <Button
                    type="text"
                    onPress={() => dispatch({ type: "clear", payload: undefined })}
                    style={styles.clearAll}
                    fontStyle={{ color: Colors.error, fontSize: 13, textTransform: "none" }}
                >
                    Clear All
                </Button>
            </View>

            <TodosList dispatch={dispatch} todos={state.todos} />

            <Animated.View style={styles.stickyFooter}>
                <TodoInput
                    saveTodos={() => {
                        onSubmit()
                        Feedback.trigger("impactLight")
                    }}
                    loading={loading}
                    isOpen={true}
                    onAddTodo={(v) => dispatch({ type: "add", payload: v.trim() })}
                />
            </Animated.View>
        </View>
    )
}

const TodosList = ({ todos, dispatch }: { todos: ITodoInput[]; dispatch: React.Dispatch<Action> }) => {
    const onRemoveTodo = (todo: ITodoInput) => {
        dispatch({ type: "remove", payload: todo.index })
    }

    return (
        <FlatList
            style={styles.todosList}
            data={todos}
            keyExtractor={(item) => item.index.toString()}
            renderItem={({ item }) => <Todo {...item} onRemove={() => onRemoveTodo(item)} />}
            contentContainerStyle={{ paddingBottom: 20 }}
            keyboardDismissMode="on-drag"
        />
    )
}

export const Todo = ({
    showRemove = true,
    ...todo
}: ITodoInput & {
    onRemove?: () => any

    showRemove?: boolean
}) => {
    return (
        <Card style={styles.todoCard}>
            <Text variant="body" style={{ maxWidth: "95%" }}>
                {todo.value}
            </Text>

            {showRemove && (
                <IconButton
                    icon={<AntDesign name="close" size={18} color={Colors.error} />}
                    onPress={todo.onRemove}
                    style={{ margin: 0, marginLeft: 8 }}
                />
            )}
        </Card>
    )
}

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView)

const TodoInput = ({
    onAddTodo,
    saveTodos,
    loading,
    isOpen,
}: {
    onAddTodo: (value: string) => any
    saveTodos: () => any
    loading: boolean
    isOpen?: boolean
}) => {
    const [hasText, setHasText] = useState<boolean>(false)
    const [isFocused, setIsFocused] = useState<boolean>(false)
    const ref = useRef<TextInput>(null)
    const textRef = useRef<string>("")

    const onSubmit = () => {
        const currentText = textRef.current.trim()
        if (currentText.length > 0) {
            onAddTodo(currentText)
            ref.current?.clear()
            textRef.current = ""
            setHasText(false)
        }
    }

    const onTextChange = (text: string) => {
        textRef.current = text
        setHasText(text.trim().length > 0)
    }

    const onFocus = () => setIsFocused(true)
    const onBlur = () => setIsFocused(false)

    const keyboard = useAnimatedKeyboard()

    useEffect(() => {
        if (isOpen) {
            ref.current?.focus()
        } else {
            ref.current?.blur()
        }
    }, [isOpen])

    const animatedIntensity = useAnimatedProps(() => ({
        intensity: interpolate(keyboard.height.value, [0, 300], [0, 30]),
    }))

    return (
        <View style={{ padding: 15 }}>
            <View
                style={{
                    borderRadius: 20,
                    overflow: "hidden",
                    borderWidth: 1,
                    borderColor: Color(Colors.primary_light).lighten(0.3).hex(),
                }}
            >
                <AnimatedBlurView
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                    }}
                    animatedProps={animatedIntensity}
                >
                    <TextInput
                        ref={ref}
                        style={{
                            flex: 1,
                            paddingHorizontal: 15,
                            paddingVertical: 16,
                            fontSize: 16,
                            color: Colors.text_light,
                            fontFamily: "System",
                        }}
                        placeholder="What needs to be done?"
                        placeholderTextColor={Colors.text_dark}
                        onChangeText={onTextChange}
                        onSubmitEditing={onSubmit}
                        onFocus={onFocus}
                        onBlur={onBlur}
                        returnKeyType="send"
                        keyboardAppearance="dark"
                        enablesReturnKeyAutomatically
                        autoFocus={isOpen}
                        multiline={false}
                    />
                    {isFocused && hasText && (
                        <IconButton
                            icon={<AntDesign name="plus" size={20} color={Colors.secondary} />}
                            onPress={onSubmit}
                            style={{ marginRight: 5 }}
                        />
                    )}

                    <Animated.View
                        style={[
                            { position: "absolute", right: 0, bottom: 2.5 },
                            useAnimatedStyle(() => ({
                                transform: [{ translateX: keyboard.height.value }],
                            })),
                        ]}
                    >
                        <IconButton
                            icon={<AntDesign name="check" size={20} color={Colors.text_light} />}
                            onPress={saveTodos}
                            disabled={loading}
                            style={[{ backgroundColor: Colors.secondary, padding: 13.5, borderRadius: 20 }]}
                        />
                    </Animated.View>
                </AnimatedBlurView>
            </View>
            <Animated.View
                style={useAnimatedStyle(() => ({
                    height: keyboard.height.value > 20 ? keyboard.height.value : 20,
                    width: 100,
                }))}
            />
        </View>
    )
}
