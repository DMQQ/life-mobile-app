import { gql, OperationVariables, QueryHookOptions, useQuery } from "@apollo/client"

export const GET_OCCURRENCE_BY_ID = gql`
    query GetOccurrenceById($id: String!) {
        occurrenceById(id: $id) {
            id
            seriesId
            date
            position
            title
            description
            beginTime
            endTime
            isCompleted
            isSkipped
            isAllDay
            isRepeat
            tags
            reminderBeforeMinutes
            finishedAt
            todos {
                id
                title
                isCompleted
                createdAt
                modifiedAt
                finishedAt
                files {
                    id
                    type
                    url
                }
            }
            images {
                id
                url
                type
                name
            }
        }
    }
`

export default function useGetOccurrenceById(id: string, options?: QueryHookOptions<any, OperationVariables>) {
    const state = useQuery(GET_OCCURRENCE_BY_ID, {
        variables: { id },
        ...options,
        skip: !id || options?.skip,
    })

    return { ...state, data: state?.data?.occurrenceById }
}
