import { gql, useMutation } from "@apollo/client"
import { GET_TIMELINE } from "../query/useGetTimelineById"

export default function useCompleteTodo(props: { todoId: string; timelineId: string; currentlyCompleted?: boolean }) {
    const [completeTodo, state] = useMutation(
        gql`
            mutation CompleteTodo($todoId: ID!, $isCompleted: Boolean!) {
                completeTimelineTodo(id: $todoId, isCompleted: $isCompleted) {
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
                    query: GET_TIMELINE,
                    variables: { id: props.timelineId },
                }) as any

                if (!data?.timelineById?.todos) {
                    return
                }

                const updatedTodo = mutationResult?.completeTimelineTodo
                if (!updatedTodo) {
                    return
                }

                const todos = data.timelineById.todos
                    .map((todo: any) => {
                        if (todo.id === props.todoId) {
                            return {
                                ...todo,
                                isCompleted: updatedTodo.isCompleted,
                                modifiedAt: updatedTodo.modifiedAt,
                            }
                        }
                        return todo
                    })
                    .sort((a: any, b: any) => a.isCompleted - b.isCompleted)

                cache.writeQuery({
                    query: GET_TIMELINE,
                    variables: { id: props.timelineId },
                    data: {
                        timelineById: {
                            ...data.timelineById,
                            todos,
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
                variables: {
                    todoId: props.todoId,
                    isCompleted: newCompletedState,
                },
            })
        },
        state,
    ] as const
}
