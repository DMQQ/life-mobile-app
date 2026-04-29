import { graphql } from "@/gql/gql"
import { useMutation } from "@apollo/client"

const UPLOAD_SUB_EXPENSE = graphql(`
    mutation UploadSubExpense($input: AddMultipleSubExpensesInput!) {
        addMultipleSubExpenses(input: $input) {
            id
            description
            amount
            category
        }
    }
`)

export const useUploadSubExpense = (onCompleted: () => void) => {
    return useMutation(UPLOAD_SUB_EXPENSE, { onCompleted, onError: (e) => console.log(JSON.stringify(e, null, 2)) })
}
