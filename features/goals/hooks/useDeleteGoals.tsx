import { gql, useMutation } from "@apollo/client"
import { GET_GOALS } from "./hooks"

export default function useDeleteGoals() {
    const [removeGroup, { error, data }] = useMutation(
        gql`
            mutation DeleteGoalsCategory($id: ID!) {
                deleteGoals(id: $id) {
                    isDeleted
                }
            }
        `,
        {
            refetchQueries: [
                {
                    query: GET_GOALS,
                },
            ],
        },
    )

    return { removeGroup, error, data }
}
