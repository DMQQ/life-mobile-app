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
            refetchQueries: [{ query: GET_TIMELINE, variables: { id: props.timelineId } }],
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
