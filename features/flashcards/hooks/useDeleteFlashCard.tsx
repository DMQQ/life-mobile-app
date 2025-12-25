import { gql, useMutation } from "@apollo/client"
import { GET_GROUPS } from "."

export default function useDeleteFlashCard() {
    const [removeGroup, { error, data }] = useMutation(
        gql`
            mutation DeleteFlashCardGroup($groupId: String!) {
                removeflashCardGroup(groupId: $groupId) {
                    isDeleted
                }
            }
        `,
        {
            refetchQueries: [
                {
                    query: GET_GROUPS,
                },
            ],
        },
    )

    return { removeGroup, error, data }
}
