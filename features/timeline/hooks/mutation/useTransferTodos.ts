import { useMutation, gql } from "@apollo/client"

const useTransferTodos = (sourceOccurrenceId: string, targetOccurrenceId: string) => {
    return useMutation(
        gql`
            mutation TransferTodos($input: TransferTodosInput!) {
                transferTodos(input: $input)
            }
        `,
        { variables: { input: { sourceOccurrenceId, targetOccurrenceId } } },
    )
}

export default useTransferTodos
