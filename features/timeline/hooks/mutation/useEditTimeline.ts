import { gql, useMutation } from "@apollo/client"
import { useNavigation } from "@react-navigation/native"
import { GET_MONTHLY_EVENTS } from "../general/useTimeline"
import useGetTimelineById, { GET_TIMELINE } from "../query/useGetTimelineById"
import { GET_TIMELINE_QUERY } from "../query/useGetTimeLineQuery"

const EDIT_TIMELINE = gql`
    mutation EditTimeline(
        $id: ID!
        $title: String!
        $desc: String!
        $date: String!
        $begin: String!
        $end: String!
        $tags: String!
    ) {
        editTimeline(
            id: $id
            input: { title: $title, description: $desc, date: $date, beginTime: $begin, endTime: $end, tags: $tags }
        ) {
            id
            title
            description
            date
            beginTime
            endTime
            isCompleted
            isAllDay

            todos {
                id
                title
                isCompleted
            }

            images {
                id
                url
                type
            }
        }
    }
`

export default function useEditTimeline(timelineId: string, isEditing: boolean) {
    const { data } = useGetTimelineById(timelineId || "", {
        skip: !isEditing,
    })

    const navigation = useNavigation()

    const initialFormProps = {
        title: data?.title,
        desc: data?.description,
        date: data?.date,
        begin: data?.beginTime,
        end: data?.endTime,
        notification: "none",

        // These wont be changed
        tags: "UNTAGGED",
        repeatCount: "0",
        repeatUntil: "unspecified",
        repeatOn: "",
        repeatEveryNth: "",
    }

    const [edit] = useMutation(EDIT_TIMELINE, {
        update(cache, { data: { editTimeline } }) {
            cache.writeQuery({
                data: {
                    timelineById: editTimeline,
                },
                query: GET_TIMELINE,
                variables: { id: timelineId },
                overwrite: true,
            })
        },

        onCompleted() {
            navigation.canGoBack() && navigation.goBack()
        },

        refetchQueries: (result) => {
            return [
                {
                    query: GET_TIMELINE_QUERY,
                    variables: { date: result.data?.editTimeline?.date },
                },
                {
                    query: GET_TIMELINE_QUERY,
                    variables: { date: initialFormProps?.date },
                },
                {
                    query: GET_MONTHLY_EVENTS,
                    variables: { date: result.data?.editTimeline?.date },
                },
            ]
        },
    })

    const editTimeline = async (input: typeof initialFormProps, date: string) => {
        await edit({
            variables: {
                id: timelineId,
                title: input.title,
                desc: input.desc,
                begin: input.begin,
                end: input.end,
                tags: input.tags,
                date: date,
            },
        })
    }

    return { editTimeline, initialFormProps }
}
