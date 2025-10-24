import { gql, useMutation } from "@apollo/client"
import { GET_TIMELINE_QUERY } from "../query/useGetTimeLineQuery"

export default function useQuickCompleteTodo(props: { 
    todoId: string
    timelineId: string
    currentlyCompleted?: boolean 
}) {
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
                    query: GET_TIMELINE_QUERY,
                    variables: { date: new Date().toISOString().split('T')[0] }, // Current date
                }) as any

                if (!data?.timeline) {
                    return
                }

                const updatedTodo = mutationResult?.completeTimelineTodo
                if (!updatedTodo) {
                    return
                }

                // Update the timeline that contains this todo
                const updatedTimelines = data.timeline.map((timeline: any) => {
                    if (timeline.id === props.timelineId) {
                        const updatedTodos = timeline.todos.map((todo: any) => {
                            if (todo.id === props.todoId) {
                                return {
                                    ...todo,
                                    isCompleted: updatedTodo.isCompleted,
                                    modifiedAt: updatedTodo.modifiedAt,
                                }
                            }
                            return todo
                        })

                        return {
                            ...timeline,
                            todos: updatedTodos,
                        }
                    }
                    return timeline
                })

                cache.writeQuery({
                    query: GET_TIMELINE_QUERY,
                    variables: { date: new Date().toISOString().split('T')[0] },
                    data: {
                        timeline: updatedTimelines,
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