import { gql, OperationVariables, QueryHookOptions, useQuery } from "@apollo/client"

export const GET_TIMELINE = gql`
    query GetTimeline($id: String!) {
        timelineById(id: $id) {
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

export default function useGetTimelineById(id: string, headers?: QueryHookOptions<any, OperationVariables>) {
    const { data, refetch, loading } = useQuery(GET_TIMELINE, {
        variables: {
            id,
        },
        ...headers,
        skip: !id,
    })

    return { data: data?.timelineById, refetch, loading }
}
