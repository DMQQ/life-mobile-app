import { useMutation, gql } from "@apollo/client"

const CREATE_TODO_MUTATION = gql`
    mutation CreateTodo($title: String!, $timelineId: ID!) {
        createTimelineTodos(todos: { title: $title, timelineId: $timelineId }) {
            id
            title
            isCompleted
            createdAt
            modifiedAt
            files {
                id
                type
                url
            }
        }
    }
`

const useTransferTodos = (sourceTimelineId: string, targetTimelineId: string) => {
    return useMutation(
        gql`
            mutation TransferTodos($sourceTimelineId: ID!, $targetTimelineId: ID!) {
                transferTodos(sourceTimelineId: $sourceTimelineId, targetTimelineId: $targetTimelineId)
            }
        `,
        { variables: { sourceTimelineId, targetTimelineId } },
    )
}

export default useTransferTodos
