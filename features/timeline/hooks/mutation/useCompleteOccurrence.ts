import { gql, useMutation } from "@apollo/client"
import { GET_OCCURRENCE_BY_ID } from "../query/useGetOccurrenceById"

const COMPLETE_OCCURRENCE = gql`
    mutation CompleteOccurrence($id: ID!, $isCompleted: Boolean!) {
        completeOccurrence(id: $id, isCompleted: $isCompleted) {
            id
            isCompleted
        }
    }
`

export default function useCompleteOccurrence(occurrenceId: string) {
    return useMutation(COMPLETE_OCCURRENCE, {
        variables: { id: occurrenceId, isCompleted: true },

        update(cache, { data: { completeOccurrence } }) {
            const existing = cache.readQuery({
                query: GET_OCCURRENCE_BY_ID,
                variables: { id: occurrenceId },
            }) as { occurrenceById: any }

            if (!existing) return

            cache.writeQuery({
                data: {
                    occurrenceById: {
                        ...existing.occurrenceById,
                        isCompleted: completeOccurrence.isCompleted,
                    },
                },
                query: GET_OCCURRENCE_BY_ID,
                variables: { id: occurrenceId },
                overwrite: true,
            })
        },

        onError(err) {
            console.log("useCompleteOccurrence:", JSON.stringify(err, null, 2))
        },
    })
}
