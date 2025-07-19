import { Timeline, Todos } from "@/types"
import { gql, useMutation } from "@apollo/client"
import { ToastAndroid } from "react-native"
import { GET_TIMELINE } from "../query/useGetTimelineById"

const useRemoveTodo = (todo: Todos & { timelineId: string }) => {
    return useMutation(
        gql`
            mutation RemoveTodo($id: ID!) {
                removeTimelineTodo(id: $id)
            }
        `,
        {
            update(cache) {
                const todos = cache.readQuery({
                    query: GET_TIMELINE,
                    variables: { id: todo.timelineId },
                }) as { timelineById: Timeline }

                const final = {
                    timelineById: {
                        ...todos.timelineById,
                        todos: todos.timelineById.todos.filter((t: Todos) => t.id !== todo.id),
                    },
                }

                cache.writeQuery({
                    overwrite: true,
                    query: GET_TIMELINE,
                    variables: { id: todo.timelineId },
                    data: final,
                    id: cache.identify(final),
                })
            },
            onCompleted() {
                ToastAndroid.show("Todo removed", ToastAndroid.SHORT)
            },
            variables: {
                id: todo.id,
            },
        },
    )
}

export default useRemoveTodo
