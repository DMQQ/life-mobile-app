import { FONTS } from "@/constants/Fonts"
import Colors from "@/constants/Colors"
import Color from "color"
import { StyleSheet, View } from "react-native"
import Text from "@/components/ui/Text/Text"
import Ripple from "react-native-material-ripple"
import useQuickCompleteTodo from "../hooks/mutation/useQuickCompleteTodo"
import Checkbox from "@/components/ui/Checkbox"

interface TodoPreviewCardProps {
    todo: {
        id: string
        title: string
        isCompleted: boolean
    }
    timelineId: string
    occurrenceDate: string
    textColor?: string
}

export default function TodoPreviewCard({ todo, timelineId, occurrenceDate, textColor }: TodoPreviewCardProps) {
    const [completeTodo, { loading }] = useQuickCompleteTodo({
        todoId: todo.id,
        timelineId,
        occurrenceDate,
        currentlyCompleted: todo.isCompleted,
    })

    const handleToggle = () => {
        if (!loading) {
            completeTodo(!todo.isCompleted)
        }
    }

    return (
        <View style={[styles.container, loading && styles.loading]}>
            <Checkbox checked={todo.isCompleted} onPress={handleToggle} size={25} loading={loading} />

            <Text
                numberOfLines={1}
                size={13}
                flex={1}
                weight="500"
                color={textColor ?? (todo.isCompleted ? Colors.text_dark : Colors.text_light)}
                strikethrough={todo.isCompleted}
                opacity={todo.isCompleted ? 0.6 : undefined}
            >
                {todo.title}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 10,
        paddingVertical: 5,
        gap: 8,
    },
    loading: {
        opacity: 0.7,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "transparent",
        borderWidth: 2,
        borderColor: Colors.secondary,
        alignItems: "center",
        justifyContent: "center",
    },
    checkboxCompleted: {
        backgroundColor: Colors.secondary,
        borderWidth: 0,
    },
    checkmark: {
        color: "white",
        fontSize: 12,
        fontFamily: FONTS.bold,
    },
})
