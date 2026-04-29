import { gql, useMutation } from "@apollo/client"

const DELETE_ACTIVITY = gql`
    mutation DeleteActivity($id: ID!) {
        deleteExpense(id: $id)
    }
`

export default function useDeleteActivity() {
    const [deleteActivity, { data, loading, error }] = useMutation(DELETE_ACTIVITY, {
        refetchQueries: ["GetWallet", "SubAccounts", "GetMainScreen", "Limits"],
    })

    return { deleteActivity, data, loading, error }
}
