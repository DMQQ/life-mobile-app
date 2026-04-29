import { graphql } from "@/gql/gql"
import { useMutation } from "@apollo/client"

const EDIT_BALANCE = graphql(`
    mutation EditBalance($input: EditWalletBalanceInput!) {
        editWalletBalance(input: $input) {
            id
            balance
            income
            paycheckDate
        }
    }
`)

export default function useEditWallet(onCompleted: () => void) {
    const [editBalance, { data, loading, error }] = useMutation(EDIT_BALANCE, {
        onCompleted,
        onError: (error) => {
            console.error(error)
        },
    })

    return { editBalance, data, loading, error }
}
