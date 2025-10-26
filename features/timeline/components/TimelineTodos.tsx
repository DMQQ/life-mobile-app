import { Card } from "@/components"
import CollapsibleStack from "@/components/ui/CollapsableStack"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import { Todos } from "@/types"
import { useNavigation } from "@react-navigation/native"
import Color from "color"
import { memo, useCallback, useMemo } from "react"
import { StyleSheet, View } from "react-native"
import TodoHeader from "./TodoHeader"
import TodoItem from "./TodoItem"
import { AntDesign } from "@expo/vector-icons"

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: 32,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Color(Colors.primary_light).lighten(0.3).hex(),
        backgroundColor: Color(Colors.primary_lighter).lighten(0.1).hex(),
    },
    emptyText: {
        textAlign: "center",
    },
})

export default function TimelineTodos(props: {
    sortedTodos: Todos[]
    timelineId: string
    expandSheet: () => void
    onDeleteTodo?: (todoId: string) => void
}) {
    const navigation = useNavigation<any>()
    const handleAddTodo = () => {
        props.expandSheet()
    }

    const handleLongPress = () => {
        navigation.navigate("TodosTransferModal", {
            timelineId: props.timelineId,
        })
    }

    const [finishedTodos, notFinishedTodos] = useMemo(() => {
        return props.sortedTodos.reduce(
            ([finished, notFinished], todo) => {
                if (todo.isCompleted) {
                    finished.push(todo)
                } else {
                    notFinished.push(todo)
                }
                return [finished, notFinished]
            },
            [[] as Todos[], [] as Todos[]],
        )
    }, [props.sortedTodos])

    return (
        <>
            <View style={styles.container}>
                <TodoHeader todos={props.sortedTodos} onAddTodo={handleAddTodo} onLongPress={handleLongPress} />

                {finishedTodos.length > 0 || notFinishedTodos.length > 0 ? (
                    <>
                        {notFinishedTodos.map((todo, index) => (
                            <TodoItem key={todo.id} index={index} timelineId={props.timelineId} {...todo} />
                        ))}

                        {notFinishedTodos.length === 0 && (
                            <Card style={{ backgroundColor: Colors.primary_lighter }}>
                                <AntDesign
                                    name="check-circle"
                                    size={25}
                                    color={"#fff"}
                                    style={{ alignSelf: "center", marginBottom: 8 }}
                                />
                                <Text variant="body" style={styles.emptyText}>
                                    All todos are completed! Great job!
                                </Text>
                            </Card>
                        )}

                        {finishedTodos.length > 0 && (
                            <FinishedTodosStack todos={finishedTodos} timelineId={props.timelineId} />
                        )}
                    </>
                ) : (
                    <Card style={styles.emptyState}>
                        <Text variant="body" style={styles.emptyText}>
                            No todos yet. Tap "Add Todo" to get started!
                        </Text>
                    </Card>
                )}
            </View>
        </>
    )
}

const getItemKey = (todo: Todos) => todo.id + (todo.isCompleted ? "1" : "0")

const FinishedTodosStack = memo((props: { todos: Todos[]; timelineId: string }) => {
    const renderItem = useCallback(
        ({ item, index }: { item: Todos; index: number }) => (
            <TodoItem key={item.id} index={index} {...item} timelineId={props.timelineId} />
        ),

        [props.timelineId],
    )

    const onDeleteItem = useCallback(() => {}, [])

    return (
        <CollapsibleStack
            items={props.todos}
            title="Completed"
            onDeleteItem={onDeleteItem}
            getItemKey={getItemKey}
            renderItem={renderItem}
            expandText="Show"
            collapseText="Hide"
            expandOnPress
        />
    )
})
