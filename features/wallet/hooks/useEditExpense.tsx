import { invalidateGetMainScreen } from "@/utils/schemas/GET_MAIN_SCREEN"
import { graphql } from "@/gql/gql"
import { useMutation } from "@apollo/client"

const EDIT_EXPENSE_NOTE = graphql(`
    mutation EditExpenseNote($input: EditExpenseNoteInput!) {
        editExpenseNote(input: $input)
    }
`)

const EDIT_EXPENSE = graphql(`
    mutation EditExpense($input: EditExpenseInput!) {
        editExpense(input: $input) {
            id
        }
    }
`)

export const useEditExpenseNote = () => {
    return useMutation(EDIT_EXPENSE_NOTE)
}

export const useEditExpense = () => {
    const [editExpense] = useMutation(EDIT_EXPENSE, {
        refetchQueries: ["GetWallet", invalidateGetMainScreen()],
        onError(err) {
            console.log(JSON.stringify(err, null, 2))
        },
    })

    return editExpense
}
