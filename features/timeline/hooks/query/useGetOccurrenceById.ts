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
            todos {
                id
                title
                isCompleted
                createdAt
                modifiedAt
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
    const { data, refetch, loading } = useQuery(GET_OCCURRENCE_BY_ID, {
        variables: { id },
        ...options,
        skip: !id || options?.skip,
    })

    return { data: data?.occurrenceById, refetch, loading }
}
