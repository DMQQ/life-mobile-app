import { graphql } from "@/gql/gql"
import { useMutation } from "@apollo/client"

export const REFUND_EXPENSE = graphql(`
    mutation refundExpense($expenseId: ID!) {
        refundExpense(expenseId: $expenseId) {
            id
            type
        }
    }
`)

export default function useRefund(onCompleted?: (data: { refundExpense: { id: string; type: string } }) => void) {
    return useMutation(REFUND_EXPENSE, {
        refetchQueries: ["GetWallet"],
        onCompleted,
        onError: (error) => {
            console.error("Error refunding expense:", JSON.stringify(error, null, 2))
        },
    })
}
