import { Card, IconButton } from "@/components"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import { AntDesign } from "@expo/vector-icons"
import Color from "color"
import { useRef, useState, useEffect } from "react"
import { ActivityIndicator, Keyboard, Pressable, StyleSheet, TextInput, View } from "react-native"
import { FlatList } from "react-native-gesture-handler"
import Feedback from "react-native-haptic-feedback"
import { SafeAreaView } from "react-native-safe-area-context"
import useTodos, { TodoInput as ITodoInput } from "../hooks/general/useTodos"
import type { TimelineScreenProps } from "../types"
import GlassView from "@/components/ui/GlassView"

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    headerBtn: {
        minWidth: 60,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: "600",
        color: Colors.foreground,
    },
    headerCancel: {
        fontSize: 16,
        color: Colors.foreground_secondary,
    },
    headerSave: {
        fontSize: 16,
        color: "#fff",
    },
    headerSaveDisabled: {
        opacity: 0.35,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: "rgba(255,255,255,0.08)",
    },
    listContent: {
        paddingHorizontal: 15,
        paddingBottom: 16,
    },
    todoCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: 15,
        marginBottom: 12,
        backgroundColor: Colors.primary_lighter,
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 15,
        marginVertical: 12,
        backgroundColor: Colors.primary_lighter,
        borderRadius: 16,
        paddingHorizontal: 14,
    },
    input: {
        flex: 1,
        paddingVertical: 15,
        fontSize: 17,
        color: Colors.text_light,
        fontFamily: "System",
    },
    todoDivider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: Color(Colors.text_dark).alpha(0.12).string(),
        marginHorizontal: 15,
        marginBottom: 12,
    },
})

export default function CreateTimelineTodos({ route, navigation }: TimelineScreenProps<"CreateTimelineTodos">) {
    const mode = route.params?.mode || "create"

    const [keyboardHeight, setKeyboardHeight] = useState(0)
    const inputRef = useRef<TextInput>(null)
    const textRef = useRef<string>("")
    const [inputText, setInputText] = useState("")

    const { dispatch, loading, onSaveTodos, state } = useTodos(route.params?.timelineId || "", () => {
        Keyboard.dismiss()
        navigation.goBack()
    })

    useEffect(() => {
        if (route.params?.todos?.length > 0) {
            dispatch({ type: "set", payload: route.params.todos })
        }
    }, [route.params?.todos])

    useEffect(() => {
        const show = Keyboard.addListener("keyboardWillShow", (e) => setKeyboardHeight(e.endCoordinates.height))
        const hide = Keyboard.addListener("keyboardWillHide", () => setKeyboardHeight(0))
        return () => {
            show.remove()
            hide.remove()
        }
    }, [])

    const addCurrentInput = (): boolean => {
        const text = textRef.current.trim()
        if (text.length === 0) return false
        Feedback.trigger("impactLight")
        dispatch({ type: "add", payload: text })
        textRef.current = ""
        setInputText("")
        inputRef.current?.clear()
        return true
    }

    const onInputChange = (text: string) => {
        textRef.current = text
        setInputText(text)
    }

    const handleSave = async () => {
        const extraText = textRef.current.trim()

        if (mode === "push-back") {
            const todos = state.todos.map((t) => t.value)
            if (extraText.length > 0) todos.unshift(extraText)
            navigation.navigate("TimelineCreate", { ...route.params, todos })
            return
        }

        await onSaveTodos(extraText)
    }

    const todoCount = state.todos.length
    const hasContent = todoCount > 0 || inputText.trim().length > 0
    const title = mode === "push-back" ? "Add Todos" : "Create Todos"

    return (
        <SafeAreaView style={[styles.container, { paddingBottom: keyboardHeight }]}>
            {/* Header */}
            <View style={styles.header}>
                <GlassView style={{ borderRadius: 100, padding: 10 }}>
                    <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
                        <Text style={styles.headerCancel}>Cancel</Text>
                    </Pressable>
                </GlassView>

                <Text style={styles.headerTitle}>{title}</Text>

                <GlassView
                    tintColor={Colors.secondary}
                    style={[{ borderRadius: 100, padding: 10 }, (!hasContent || loading) && styles.headerSaveDisabled]}
                >
                    <Pressable onPress={handleSave} disabled={!hasContent || loading} hitSlop={12}>
                        {loading ? (
                            <ActivityIndicator size="small" color={Colors.secondary} />
                        ) : (
                            <Text style={[styles.headerSave]}>Save</Text>
                        )}
                    </Pressable>
                </GlassView>
            </View>

            <View style={styles.divider} />

            <View style={styles.inputRow}>
                <TextInput
                    ref={inputRef}
                    style={styles.input}
                    placeholder="What needs to be done?"
                    placeholderTextColor={Colors.text_dark}
                    onChangeText={onInputChange}
                    onSubmitEditing={addCurrentInput}
                    returnKeyType="done"
                    keyboardAppearance="dark"
                    enablesReturnKeyAutomatically
                    autoFocus
                    multiline={false}
                    blurOnSubmit={false}
                    submitBehavior="submit"
                />
                {inputText.trim().length > 0 && (
                    <IconButton
                        icon={<AntDesign name="plus" size={20} color={Colors.secondary} />}
                        onPress={addCurrentInput}
                        style={{ marginLeft: 4 }}
                    />
                )}
            </View>

            {todoCount > 0 && <View style={styles.todoDivider} />}

            <FlatList
                style={{ flex: 1 }}
                contentContainerStyle={styles.listContent}
                data={state.todos}
                keyExtractor={(item) => item.index.toString()}
                renderItem={({ item }) => (
                    <Todo {...item} onRemove={() => dispatch({ type: "remove", payload: item.index })} />
                )}
                keyboardDismissMode="on-drag"
                keyboardShouldPersistTaps="handled"
            />
        </SafeAreaView>
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
            <Text variant="body" style={{ maxWidth: "90%", flexShrink: 1 }}>
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
