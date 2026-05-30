import { gql, useMutation } from "@apollo/client"
import { GET_OCCURRENCE_BY_ID } from "../query/useGetOccurrenceById"

export default function useCompleteTodo(props: { todoId: string; timelineId: string; currentlyCompleted?: boolean }) {
    const [completeTodo, state] = useMutation(
        gql`
            mutation CompleteOccurrenceTodo($input: CompleteOccurrenceTodoInput!) {
                completeOccurrenceTodo(input: $input) {
                    isCompleted
                    id
                    title
                    modifiedAt
                    createdAt
                    finishedAt
                }
            }
        `,
        {
            update(cache, { data }) {
                if (!data?.completeOccurrenceTodo) return

                const result = data.completeOccurrenceTodo

                const cached = cache.readQuery<any>({
                    query: GET_OCCURRENCE_BY_ID,
                    variables: { id: props.timelineId },
                })

                if (!cached?.occurrenceById) return

                const todos: any[] = cached.occurrenceById.todos || []

                const anchorTodo =
                    todos.find((t) => t.id === props.todoId) ?? todos.find((t) => t.title === result.title)

                if (!anchorTodo) return

                const stableId = anchorTodo.id

                cache.writeQuery({
                    query: GET_OCCURRENCE_BY_ID,
                    variables: { id: props.timelineId },
                    data: {
                        occurrenceById: {
                            ...cached.occurrenceById,
                            todos: todos.map((t) => (t.id === stableId ? { ...t, ...result, id: stableId } : t)),
                        },
                    },
                })
            },
        },
    )

    return [
        (isCompleted?: boolean) => {
            const newCompletedState = isCompleted ?? !props.currentlyCompleted
            return completeTodo({
                variables: { input: { id: props.todoId, isCompleted: newCompletedState, occurrenceId: props.timelineId } },
            })
        },
        state,
    ] as const
}
