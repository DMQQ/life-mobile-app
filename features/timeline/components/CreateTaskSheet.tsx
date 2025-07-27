import { Card, IconButton } from "@/components"
import BottomSheet from "@/components/ui/BottomSheet/BottomSheet"
import Button from "@/components/ui/Button/Button"
import Text from "@/components/ui/Text/Text"
import Input from "@/components/ui/TextInput/TextInput"
import Colors from "@/constants/Colors"
import { useTheme } from "@/utils/context/ThemeContext"
import { AntDesign } from "@expo/vector-icons"
import BottomSheetType from "@gorhom/bottom-sheet"
import { useNavigation } from "@react-navigation/native"
import Color from "color"
import { BlurView } from "expo-blur"
import { forwardRef, useCallback, useEffect, useRef, useState } from "react"
import { ActivityIndicator, Keyboard, StyleSheet, View } from "react-native"
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from "react-native-reanimated"
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

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView)

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
    const todoCount = state.todos.filter((todo) => todo.value.trim().length > 0).length

    const snapPoints = ["60%"]

    const insets = useSafeAreaInsets()

    const animatedKeyboard = useAnimatedKeyboard()

    const navigation = useNavigation()

    const keyboardAnimatedPosition = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: animatedKeyboard.height.value,
                },
            ],
        }
    })

    const onChange = useCallback((index: number) => {
        if (index === -1) {
            Keyboard.dismiss()
        }

        navigation.setOptions({
            gestureEnabled: index === -1,
        })
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

                <Animated.View style={[styles.stickyFooter, keyboardAnimatedPosition]}>
                    <BlurView
                        style={[
                            {
                                paddingHorizontal: 16,
                                paddingTop: 8,
                                borderTopWidth: 1,
                                borderTopColor: Color(Colors.text_dark).alpha(0.1).string(),
                                paddingBottom: insets.bottom,
                            },
                        ]}
                    >
                        <Button
                            disabled={loading || todoCount === 0}
                            onPress={onSaveTodos}
                            style={styles.saveButton}
                            fontStyle={{ fontSize: 16 }}
                            icon={
                                loading && (
                                    <ActivityIndicator
                                        style={{ marginHorizontal: 10 }}
                                        color={Colors.foreground}
                                        size="small"
                                    />
                                )
                            }
                        >
                            Save {todoCount} todo{todoCount !== 1 ? "s" : ""}
                        </Button>
                    </BlurView>
                </Animated.View>
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

export const TodoInput = ({ onAddTodo }: { onAddTodo: (value: string) => any }) => {
    const [text, setText] = useState<string>("")
    const theme = useTheme()
    const ref = useRef<any>()

    const onSubmit = () => {
        if (text.trim().length > 0) {
            onAddTodo(text)
            setText("")
            // Maintain focus after submit
            setTimeout(() => {
                ref.current?.focus()
            }, 100)
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
            }
            placeholderTextColor={Colors.text_dark}
            value={text}
            onChangeText={setText}
            placeholder="What needs to be done?"
            onSubmitEditing={onSubmit}
            multiline={true}
            numberOfLines={1}
            blurOnSubmit={false}
            returnKeyLabel="Add todo"
            returnKeyType="done"
            enterKeyHint="done"
            keyboardAppearance="dark"
            enablesReturnKeyAutomatically
        />
    )
}
