import { invalidateGetMainScreen } from "@/utils/schemas/GET_MAIN_SCREEN"
import { gql, useMutation } from "@apollo/client"

const EDIT_EXPENSE_NOTE = gql`
    mutation EditExpenseNote($input: EditExpenseNoteInput!) {
        editExpenseNote(input: $input)
    }
`

const EDIT_EXPENSE = gql`
    mutation EditExpense($input: EditExpenseInput!) {
        editExpense(input: $input) {
            id
            shop
            note
            tags
            shopEntity {
                id
                name
                image
            }
        }
    }
`

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
