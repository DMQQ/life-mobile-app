import { gql, useMutation } from "@apollo/client"

const GET_GROUPS = gql`
    query GetGroups {
        groups {
            id
            name
            description
            createdAt
        }
    }
`

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
