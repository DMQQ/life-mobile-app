import { useMutation, gql } from "@apollo/client"

const useTransferTodos = (sourceOccurrenceId: string, targetOccurrenceId: string) => {
    return useMutation(
        gql`
            mutation TransferTodos($sourceOccurrenceId: ID!, $targetOccurrenceId: ID!) {
                transferTodos(sourceOccurrenceId: $sourceOccurrenceId, targetOccurrenceId: $targetOccurrenceId)
            }
        `,
        { variables: { sourceOccurrenceId, targetOccurrenceId } },
    )
}

export default useTransferTodos
