import { gql, useMutation } from "@apollo/client"
import moment from "moment"
import { GET_MONTHLY_OCCURRENCES } from "../general/useTimeline"
import { GET_OCCURRENCES_QUERY } from "../query/useGetOccurrencesQuery"

const DELETE_OCCURRENCE = gql`
    mutation DeleteOccurrence($id: ID!, $scope: String) {
        deleteOccurrence(id: $id, scope: $scope)
    }
`

export default function useRemoveTimelineMutation(timeline: { id: string; date: string }, onCompleted?: () => any) {
    const [remove, { loading }] = useMutation(DELETE_OCCURRENCE, {
        variables: {
            id: timeline.id,
            scope: "THIS_ONLY",
        },
        refetchQueries: () => [
            {
                query: GET_MONTHLY_OCCURRENCES,
                variables: { date: moment(timeline.date).startOf("month").format("YYYY-MM-DD") },
            },
            {
                query: GET_OCCURRENCES_QUERY,
                variables: { date: timeline.date },
            },
        ],
        onCompleted,
    })

    return { remove, loading }
}
