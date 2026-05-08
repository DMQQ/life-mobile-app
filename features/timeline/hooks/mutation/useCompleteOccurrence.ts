import { GET_OCCURRENCE_BY_ID } from "@/features/timeline/hooks/query/useGetOccurrenceById"
import { gql, useMutation } from "@apollo/client"

const COMPLETE_OCCURRENCE = gql`
    mutation CompleteOccurrence($input: CompleteOccurrenceInput!) {
        completeOccurrence(input: $input) {
            id
            isCompleted
        }
    }
`

export default function useCompleteOccurrence(occurrenceId: string) {
    return useMutation(COMPLETE_OCCURRENCE, {
        update(cache, { data }) {
            const result = data?.completeOccurrence
            if (!result) return
            cache.modify({
                id: cache.identify({ __typename: "OccurrenceView", id: occurrenceId }),
                fields: {
                    isCompleted: () => result.isCompleted,
                },
            })
            if (result.id !== occurrenceId) {
                cache.modify({
                    id: cache.identify({ __typename: "OccurrenceView", id: result.id }),
                    fields: {
                        isCompleted: () => result.isCompleted,
                    },
                })
            }
        },
        refetchQueries: [{ query: GET_OCCURRENCE_BY_ID, variables: { id: occurrenceId } }],
        onError(err) {
            console.log("useCompleteOccurrence:", JSON.stringify(err, null, 2))
        },
    })
}
