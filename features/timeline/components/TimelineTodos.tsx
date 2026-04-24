import { Card } from "@/components"
import CollapsibleStack from "@/components/ui/CollapsableStack"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import { Todos } from "@/types"
import { useNavigation } from "@react-navigation/native"
import Color from "color"
import { memo, useCallback, useMemo, useState } from "react"
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
    onDeleteTodo?: (todoId: string) => void
}) {
    const navigation = useNavigation<any>()

    const handleLongPress = () => {
        navigation.navigate("TodosTransferModal", {
            timelineId: props.timelineId,
        })
    }

    return (
        <>
            <View style={styles.container}>
                <TodoHeader todos={props.sortedTodos} onLongPress={handleLongPress} />

                {props.sortedTodos.length > 0 || props.sortedTodos.length > 0 ? (
                    <>
                        {props.sortedTodos.map((todo, index) => (
                            <TodoItem key={todo.id} index={index} timelineId={props.timelineId} {...todo} />
                        ))}

                        {props.sortedTodos.length === 0 && (
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
