import { Todos } from "@/types"
import { gql, useMutation } from "@apollo/client"
import { ToastAndroid } from "react-native"
import { GET_OCCURRENCE_BY_ID } from "../query/useGetOccurrenceById"

const useRemoveTodo = (todo: Todos & { timelineId: string }) => {
    return useMutation(
        gql`
            mutation RemoveOccurrenceTodo($id: ID!) {
                removeOccurrenceTodo(id: $id)
            }
        `,
        {
            update(cache) {
                const existing = cache.readQuery({
                    query: GET_OCCURRENCE_BY_ID,
                    variables: { id: todo.timelineId },
                }) as { occurrenceById: any }

                if (!existing?.occurrenceById) return

                cache.writeQuery({
                    overwrite: true,
                    query: GET_OCCURRENCE_BY_ID,
                    variables: { id: todo.timelineId },
                    data: {
                        occurrenceById: {
                            ...existing.occurrenceById,
                            todos: existing.occurrenceById.todos.filter((t: Todos) => t.id !== todo.id),
                        },
                    },
                })
            },
            onCompleted() {
                ToastAndroid.show("Todo removed", ToastAndroid.SHORT)
            },
            variables: { id: todo.id },
        },
    )
}

export default useRemoveTodo
