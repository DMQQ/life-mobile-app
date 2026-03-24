import { gql, useMutation } from "@apollo/client"
import { GET_OCCURRENCES_QUERY } from "../query/useGetOccurrencesQuery"

export default function useQuickCompleteTodo(props: {
    todoId: string
    timelineId: string
    occurrenceDate: string
    currentlyCompleted?: boolean
}) {
    const [completeTodo, state] = useMutation(
        gql`
            mutation CompleteOccurrenceTodoQuick($todoId: ID!, $isCompleted: Boolean!) {
                completeOccurrenceTodo(id: $todoId, isCompleted: $isCompleted) {
                    isCompleted
                    id
                    title
                    modifiedAt
                    createdAt
                }
            }
        `,
        {
            update(cache, { data: mutationResult }) {
                const data = cache.readQuery({
                    query: GET_OCCURRENCES_QUERY,
                    variables: { date: props.occurrenceDate },
                }) as any

                if (!data?.occurrences) return

                const updatedTodo = mutationResult?.completeOccurrenceTodo
                if (!updatedTodo) return

                const updatedOccurrences = data.occurrences.map((occ: any) => {
                    if (occ.id === props.timelineId) {
                        return {
                            ...occ,
                            todos: occ.todos.map((todo: any) => {
                                if (todo.id === props.todoId) {
                                    return {
                                        ...todo,
                                        isCompleted: updatedTodo.isCompleted,
                                        modifiedAt: updatedTodo.modifiedAt,
                                    }
                                }
                                return todo
                            }),
                        }
                    }
                    return occ
                })

                cache.writeQuery({
                    query: GET_OCCURRENCES_QUERY,
                    variables: { date: props.occurrenceDate },
                    data: { occurrences: updatedOccurrences },
                })
            },
        },
    )

    return [
        (isCompleted?: boolean) => {
            const newCompletedState = isCompleted ?? !props.currentlyCompleted
            return completeTodo({
                variables: { todoId: props.todoId, isCompleted: newCompletedState },
            })
        },
        state,
    ] as const
}
