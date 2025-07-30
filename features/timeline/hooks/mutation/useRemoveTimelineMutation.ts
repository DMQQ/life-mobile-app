import { gql, useMutation } from "@apollo/client"
import { useNavigation } from "@react-navigation/native"
import moment from "moment"
import { GET_MONTHLY_EVENTS } from "../general/useTimeline"
import { GET_TIMELINE_QUERY } from "../query/useGetTimeLineQuery"

const REMOVE_TIMELINE_EVENT_MUTATION = gql`
    mutation RemoveTimelineEvent($id: String!) {
        removeTimeline(id: $id)
    }
`

export default function useRemoveTimelineMutation(timeline: { id: string; date: string }) {
    const navigation = useNavigation()
    const [remove, { loading }] = useMutation(REMOVE_TIMELINE_EVENT_MUTATION, {
        variables: {
            id: timeline.id,
        },
        refetchQueries: () => {
            return [
                {
                    query: GET_MONTHLY_EVENTS,
                    variables: {
                        date: moment(timeline.date).startOf("month").format("YYYY-MM-DD"),
                    },
                },
                {
                    query: GET_TIMELINE_QUERY,
                    variables: { date: timeline.date },
                },
            ]
        },
        onCompleted() {
            navigation.goBack()
        },
    })

    return { remove, loading }
}
