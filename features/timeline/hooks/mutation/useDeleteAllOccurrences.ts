import { gql, useMutation } from "@apollo/client"
import moment from "moment"

const DELETE_OCCURRENCE = gql`
    mutation DeleteOccurrence($input: DeleteOccurrenceInput!) {
        deleteOccurrence(input: $input)
    }
`

export default function useDeleteAllOccurrences(timeline: { id: string; date: string }, onCompleted?: () => any) {
    const [remove, { loading }] = useMutation(DELETE_OCCURRENCE, {
        variables: {
            input: { id: timeline.id, scope: "KEEP_FILLED" },
        },
        update(cache) {
            cache.evict({ fieldName: "occurrences" })
            cache.evict({
                fieldName: "occurrenceMonth",
                args: { date: moment(timeline.date).startOf("month").format("YYYY-MM-DD") },
            })
            cache.gc()
        },
        onCompleted,
    })

    return { remove, loading }
}
