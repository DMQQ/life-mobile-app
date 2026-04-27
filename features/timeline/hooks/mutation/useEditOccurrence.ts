import { gql, useMutation } from "@apollo/client"
import { useNavigation } from "@react-navigation/native"
import { GET_MONTHLY_OCCURRENCES } from "../general/useTimeline"
import useGetOccurrenceById, { GET_OCCURRENCE_BY_ID } from "../query/useGetOccurrenceById"
import { GET_OCCURRENCES_QUERY } from "../query/useGetOccurrencesQuery"

const EDIT_OCCURRENCE = gql`
    mutation EditOccurrence($input: EditOccurrenceArgsInput!) {
        editOccurrence(input: $input) {
            id
            seriesId
            date
            title
            description
            beginTime
            endTime
            isCompleted
            isAllDay
            isRepeat
            tags
            todos {
                id
                title
                isCompleted
                createdAt
                modifiedAt
            }
            images {
                id
                url
                type
            }
        }
    }
`

export default function useEditOccurrence(occurrenceId: string, isEditing: boolean) {
    const { data } = useGetOccurrenceById(occurrenceId || "", {
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
        tags: data?.tags || "UNTAGGED",
        repeatCount: "0",
        repeatOn: "",
        repeatEveryNth: "",

        scope: "THIS_ONLY",
    }

    const [edit] = useMutation(EDIT_OCCURRENCE, {
        update(cache, { data: { editOccurrence } }) {
            cache.writeQuery({
                data: { occurrenceById: editOccurrence },
                query: GET_OCCURRENCE_BY_ID,
                variables: { id: occurrenceId },
                overwrite: true,
            })
        },

        onCompleted() {
            navigation.canGoBack() && navigation.goBack()
        },

        refetchQueries: (result) => [
            {
                query: GET_OCCURRENCES_QUERY,
                variables: { date: result.data?.editOccurrence?.date },
            },
            {
                query: GET_OCCURRENCES_QUERY,
                variables: { date: initialFormProps?.date },
            },
            {
                query: GET_MONTHLY_OCCURRENCES,
                variables: { date: result.data?.editOccurrence?.date },
            },
        ],
    })

    const editOccurrence = async (
        input: typeof initialFormProps,
        date: string,
        scope: "THIS_ONLY" | "ALL" = "THIS_ONLY",
    ) => {
        await edit({
            variables: {
                input: {
                    id: occurrenceId,
                    input: {
                        title: input.title,
                        description: input.desc,
                        beginTime: input.begin,
                        endTime: input.end,
                        tags: input.tags,
                        date,
                    },
                    scope,
                },
            },
        })
    }

    return { editOccurrence, initialFormProps, isRepeat: data?.isRepeat }
}
