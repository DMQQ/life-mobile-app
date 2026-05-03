import { Card } from "@/components"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import { Todos } from "@/types"
import { useNavigation } from "@react-navigation/native"
import Color from "color"
import { StyleSheet, View } from "react-native"
import TodoHeader from "./TodoHeader"
import TodoItem from "./TodoItem"
import { AntDesign } from "@expo/vector-icons"

export default function TimelineTodos(props: {
    sortedTodos: Todos[]
    timelineId: string
    onDeleteTodo?: (todoId: string) => void
}) {
    const navigation = useNavigation<any>()

    const handleLongPress = () => {
        navigation.navigate("TodosTransferModal", {
            timelineId: props.timelineId,
        })
    }

    const allCompleted = props.sortedTodos.length > 0 && props.sortedTodos.every((t) => t.isCompleted)

    return (
        <View style={styles.container}>
            <Text variant="subheading" onLongPress={handleLongPress} style={{ marginBottom: 12 }}>
                Todos
            </Text>
            {props.sortedTodos.length === 0 ? (
                <Card style={styles.emptyState}>
                    <Text variant="subheading" style={styles.emptyTitle}>
                        No todos yet
                    </Text>
                    <Text variant="caption" style={styles.emptySubtitle}>
                        Add tasks to stay on track
                    </Text>
                </Card>
            ) : (
                props.sortedTodos.map((todo, index) => (
                    <TodoItem key={todo.id} index={index} timelineId={props.timelineId} {...todo} />
                ))
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
    },
    emptyState: {
        paddingVertical: 28,
        paddingHorizontal: 20,
        backgroundColor: Color(Colors.primary_lighter).lighten(0.05).hex(),
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: Color(Colors.primary_light).lighten(0.2).hex(),
        borderRadius: 20,
        gap: 4,
    },
    completedState: {
        paddingVertical: 28,
        paddingHorizontal: 20,
        backgroundColor: Color(Colors.secondary).alpha(0.08).string(),
        borderWidth: 1,
        borderColor: Color(Colors.secondary).alpha(0.25).string(),
        borderRadius: 20,
        gap: 4,
    },
    icon: {
        marginBottom: 6,
    },
    emptyTitle: {
        color: Colors.foreground_secondary,
    },
    emptySubtitle: {
        color: Colors.foreground_disabled,
    },
    completedTitle: {
        color: Colors.text_light,
    },
    completedSubtitle: {
        color: Colors.foreground_secondary,
    },
})
