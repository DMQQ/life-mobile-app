import { Timeline } from "@/types"
import useUser from "@/utils/hooks/useUser"
import { gql, useMutation } from "@apollo/client"
import { GET_TIMELINE } from "../query/useGetTimelineById"

const useCreateTodo = (timelineId: string) => {
    const usr = useUser()

    const [createTodo, state] = useMutation(
        gql`
            mutation CreateTodo($title: String!, $timelineId: ID!) {
                createTimelineTodos(todos: { title: $title, timelineId: $timelineId }) {
                    id
                    title
                    isCompleted
                    createdAt
                    modifiedAt
                }
            }
        `,
        {
            update(cache, data) {
                const timeline = cache.readQuery({
                    query: GET_TIMELINE,
                    variables: { id: timelineId },
                }) as { timelineById: Timeline }

                const final = {
                    timelineById: {
                        ...timeline.timelineById,
                        todos: [...timeline.timelineById.todos, data.data.createTimelineTodos].sort((a, b) => {
                            if (a.isCompleted !== b.isCompleted) {
                                return a.isCompleted - b.isCompleted
                            }
                            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                        }),
                    },
                }

                cache.writeQuery({
                    data: final,
                    id: cache.identify(final),
                    query: GET_TIMELINE,
                    variables: { id: timeline.timelineById.id },
                })
            },
            context: {
                headers: {
                    authentication: usr.token,
                },
            },
            onError(er) {
                console.log(er)
            },
        },
    )

    return { createTodo, state }
}

export default useCreateTodo
