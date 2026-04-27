import { invalidateGetMainScreen } from "@/utils/schemas/GET_MAIN_SCREEN"
import { gql, useMutation } from "@apollo/client"

export const useEditExpenseNote = () => {
    return useMutation(gql`
        mutation EditExpenseNote($input: EditExpenseNoteInput!) {
            editExpenseNote(input: $input)
        }
    `)
}

export const useEditExpense = () => {
    const [editExpense] = useMutation(
        gql`
            mutation EditExpense($input: EditExpenseInput!) {
                editExpense(input: $input) {
                    id
                }
            }
        `,
        {
            refetchQueries: ["GetWallet", invalidateGetMainScreen()],

            onError(err) {
                console.log(JSON.stringify(err, null, 2))
            },
        },
    )

    return editExpense
}
