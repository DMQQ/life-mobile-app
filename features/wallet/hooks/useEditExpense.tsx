import { invalidateGetMainScreen } from "@/utils/schemas/GET_MAIN_SCREEN"
import { gql, useMutation } from "@apollo/client"

export const useEditExpense = () => {
    const [editExpense] = useMutation(
        gql`
            mutation EditExpense(
                $amount: Float!
                $description: String!
                $type: String!
                $category: String!
                $expenseId: ID!
                $date: String!
                $spontaneousRate: Float
            ) {
                editExpense(
                    amount: $amount
                    description: $description
                    type: $type
                    category: $category
                    expenseId: $expenseId
                    date: $date
                    spontaneousRate: $spontaneousRate
                ) {
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
