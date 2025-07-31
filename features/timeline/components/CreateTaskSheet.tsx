import { IconButton } from "@/components"
import BottomSheet from "@/components/ui/BottomSheet/BottomSheet"
import Button from "@/components/ui/Button/Button"
import Text from "@/components/ui/Text/Text"
import Input from "@/components/ui/TextInput/TextInput"
import Colors from "@/constants/Colors"
import { AntDesign } from "@expo/vector-icons"
import BottomSheetType from "@gorhom/bottom-sheet"
import { useNavigation } from "@react-navigation/native"
import Color from "color"
import { BlurView } from "expo-blur"
import { forwardRef, useCallback, useEffect, useRef, useState } from "react"
import { Keyboard, StyleSheet, View } from "react-native"
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from "react-native-reanimated"
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

    todoCard: {
        borderRadius: 16,
        marginBottom: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
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

    const snapPoints = ["90%"]

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
        <BottomSheet showBlur ref={ref} snapPoints={snapPoints} onChange={onChange}>
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
                                style={styles.clearAll}
                                fontStyle={{ color: Colors.error, fontSize: 13, textTransform: "none" }}
                            >
                                Clear All
                            </Button>
                        </View>
                    </View>

                    <TodosList dispatch={dispatch} todos={state.todos} />
                </Animated.ScrollView>

                <Animated.View style={styles.stickyFooter}>
                    <TodoInput
                        saveTodos={onSaveTodos}
                        loading={loading}
                        isOpen={isOpen}
                        onAddTodo={(v) => dispatch({ type: "add", payload: v.trim() })}
                    />
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
        <View style={styles.todoCard}>
            <BlurView intensity={50} tint="dark" style={styles.blurBackground} />
            <View style={[styles.todoCardRow, styles.blurContent]}>
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
        </View>
    )
}

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
    const [text, setText] = useState<string>("")
    const ref = useRef<any>()

    const onSubmit = () => {
        if (text.trim().length > 0) {
            onAddTodo(text)
            setText("")
        }
    }

    const keyboard = useAnimatedKeyboard()

    useEffect(() => {
        if (isOpen) {
            ref.current?.focus()
        } else {
            ref.current?.blur()
        }
    }, [isOpen])

    return (
        <View style={{ padding: 15 }}>
            <View style={{ borderRadius: 30, overflow: "hidden" }}>
                <BlurView intensity={80} tint="dark" style={styles.blurBackground} />
                <View style={{ backgroundColor: "rgba(0, 0, 0, 0.2)", borderRadius: 30 }}>
                    <Input
                        activeBorderColor={Color(Colors.primary_lighter).lighten(0.3).hex()}
                        autoFocus={isOpen}
                        inputRef={ref}
                        style={{
                            margin: 0,
                            borderWidth: 0,
                            paddingHorizontal: 15,
                        }}
                        right={
                            isOpen && (
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
                            )
                        }
                        containerStyle={{ borderRadius: 30, backgroundColor: undefined, marginBottom: 0 }}
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
                        style={[
                            { position: "absolute", right: 5, bottom: 5 },
                            useAnimatedStyle(() => ({
                                transform: [{ translateX: keyboard.height.value }],
                            })),
                        ]}
                    >
                        <IconButton
                            icon={<AntDesign name="check" size={20} color={Colors.text_light} />}
                            onPress={saveTodos}
                            disabled={loading}
                            style={[{ backgroundColor: Colors.secondary, padding: 12.5 }]}
                        />
                    </Animated.View>
                </View>
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
