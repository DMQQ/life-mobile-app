import { gql, useMutation } from "@apollo/client"
import { GET_OCCURRENCE_BY_ID } from "../query/useGetOccurrenceById"

export default function useCompleteTodo(props: { todoId: string; timelineId: string; currentlyCompleted?: boolean }) {
    const [completeTodo, state] = useMutation(
        gql`
            mutation CompleteOccurrenceTodo($todoId: ID!, $isCompleted: Boolean!) {
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
            refetchQueries: [{ query: GET_OCCURRENCE_BY_ID, variables: { id: props.timelineId } }],
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
