import { Card, IconButton } from "@/components"
import BottomSheet from "@/components/ui/BottomSheet/BottomSheet"
import Button from "@/components/ui/Button/Button"
import Text from "@/components/ui/Text/Text"
import Input from "@/components/ui/TextInput/TextInput"
import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import useKeyboard from "@/utils/hooks/useKeyboard"
import { AntDesign } from "@expo/vector-icons"
import BottomSheetType from "@gorhom/bottom-sheet"
import { useNavigation } from "@react-navigation/native"
import Color from "color"
import { BlurView } from "expo-blur"
import { forwardRef, useCallback, useEffect, useRef, useState } from "react"
import { ActivityIndicator, Keyboard, StyleSheet, TouchableOpacity, View } from "react-native"
import Animated, { useAnimatedKeyboard, useAnimatedStyle, withTiming } from "react-native-reanimated"
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
        color: Colors.foreground,
    },
    subtitle: {
        marginTop: 2,
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
    stickyFooter: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
    },
})

export default forwardRef<
    BottomSheetType,
    {
        timelineId: string
    }
>(({ timelineId }, ref) => {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const { dispatch, loading, onSaveTodos, state } = useTodos(timelineId, () => {
        Keyboard.dismiss()
        ;(ref as any).current?.close()
    })
    const todoCount = state.todos.filter((todo) => todo.value.trim().length > 0).length

    const snapPoints = ["95%"]

    const navigation = useNavigation()

    const onChange = useCallback((index: number) => {
        if (index === -1) {
            Keyboard.dismiss()
        }

        navigation.setOptions({
            gestureEnabled: index === -1,
        })

        setIsOpen(index !== -1)
    }, [])

    return (
        <BottomSheet ref={ref} snapPoints={snapPoints} onChange={onChange}>
            <View style={{ flex: 1 }}>
                <Animated.ScrollView
                    invertStickyHeaders
                    stickyHeaderIndices={[0]}
                    style={[styles.container]}
                    keyboardDismissMode="on-drag"
                    contentContainerStyle={{ paddingBottom: 80 }}
                >
                    <View>
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
                                style={{
                                    borderWidth: 1,
                                    borderColor: Colors.error,
                                    backgroundColor: "transparent",
                                    padding: 5,
                                    paddingHorizontal: 10,
                                }}
                                fontStyle={{ color: Colors.error, fontSize: 13, textTransform: "none" }}
                            >
                                Clear All
                            </Button>
                        </View>
                    </View>

                    <TodosList dispatch={dispatch} todos={state.todos} />
                </Animated.ScrollView>

                <Animated.View style={[styles.stickyFooter]}>
                    <BlurView
                        intensity={40}
                        tint="dark"
                        style={[
                            {
                                paddingHorizontal: 16,
                                paddingTop: 8,
                                borderTopWidth: 1,
                                borderTopColor: Color(Colors.text_dark).alpha(0.1).string(),
                            },
                        ]}
                    >
                        <TodoInput
                            saveTodos={onSaveTodos}
                            loading={loading}
                            isOpen={isOpen}
                            onAddTodo={(v) => dispatch({ type: "add", payload: v.trim() })}
                        />
                    </BlurView>
                </Animated.View>
            </View>
        </BottomSheet>
    )
})

const TodosList = ({ todos, dispatch }: { todos: ITodoInput[]; dispatch: React.Dispatch<Action> }) => {
    const onRemoveTodo = (todo: ITodoInput) => {
        dispatch({ type: "remove", payload: todo.index })
    }

    return (
        <View style={styles.todosList}>
            {todos.map((todo, index) => (
                <Todo key={todo.index} {...todo} onRemove={() => onRemoveTodo(todo)} />
            ))}
        </View>
    )
}

const Todo = (
    todo: ITodoInput & {
        onRemove: () => any
    },
) => {
    return (
        <Card
            style={{
                marginBottom: 8,
                borderRadius: 12,
                backgroundColor: Color(Colors.primary_lighter).lighten(0.1).hex(),
                borderWidth: 1,
                borderColor: Color(Colors.primary_light).lighten(0.2).hex(),
                padding: 5,
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
                    variant="body"
                    style={{
                        flex: 1,
                    }}
                >
                    {todo.value}
                </Text>

                <IconButton
                    icon={<AntDesign name="close" size={18} color={Colors.error} />}
                    onPress={todo.onRemove}
                    style={{ margin: 0, marginLeft: 8 }}
                />
            </View>
        </Card>
    )
}

export const TodoInput = ({
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
    const [text, setText] = useState<string>("")
    const ref = useRef<any>()

    const onSubmit = () => {
        if (text.trim().length > 0) {
            onAddTodo(text)
            setText("")
            // Maintain focus after submit

            ref.current?.focus()
        }
    }

    const keyboard = useAnimatedKeyboard()

    const keyboardState = useKeyboard()

    const submitButtonStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: keyboard.state.value === 4 ? withTiming(0) : withTiming(Layout.screen.width / 2) },
            ],
        }
    })

    useEffect(() => {
        if (isOpen) {
            ref.current?.focus()
        } else {
            ref.current?.blur()
        }
    }, [isOpen])

    return (
        <View>
            <Input
                autoFocus={isOpen}
                inputRef={ref}
                style={{
                    margin: 0,
                    backgroundColor: "transparent",
                    borderWidth: 0,
                }}
                right={
                    keyboardState ? (
                        <IconButton
                            icon={
                                <AntDesign
                                    name="plus"
                                    size={20}
                                    color={text.trim() ? Colors.secondary : Colors.primary_lighter}
                                />
                            }
                            onPress={onSubmit}
                            disabled={!text.trim()}
                        />
                    ) : (
                        <Animated.View style={submitButtonStyle}>
                            <TouchableOpacity
                                onPress={saveTodos}
                                style={{
                                    padding: 10,
                                    paddingVertical: 5,
                                    backgroundColor: Colors.secondary,
                                    flexDirection: "row",
                                    borderRadius: 100,
                                    alignItems: "center",
                                }}
                            >
                                {loading ? (
                                    <ActivityIndicator size={15} color={Colors.text_light} />
                                ) : (
                                    <AntDesign name="plus" size={15} color={Colors.text_light} />
                                )}
                                <Text style={{ color: Colors.text_light, fontSize: 14, marginLeft: 8 }}>
                                    Save todos
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    )
                }
                containerStyle={{ borderRadius: 20, backgroundColor: undefined }}
                placeholderTextColor={Colors.text_dark}
                value={text}
                onChangeText={setText}
                placeholder="What needs to be done?"
                onSubmitEditing={onSubmit}
                numberOfLines={1}
                returnKeyLabel="Add todo"
                returnKeyType="send"
                enterKeyHint="done"
                keyboardAppearance="dark"
                enablesReturnKeyAutomatically
            />
            <Animated.View
                style={useAnimatedStyle(() => ({
                    height: keyboard.height.value > 20 ? keyboard.height.value : 20,
                    width: 100,
                }))}
            />
        </View>
    )
}
