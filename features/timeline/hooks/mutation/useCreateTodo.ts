import useUser from "@/utils/hooks/useUser"
import { gql, useMutation } from "@apollo/client"
import { GET_OCCURRENCE_BY_ID } from "../query/useGetOccurrenceById"

const useCreateTodo = (occurrenceId: string) => {
    const usr = useUser()

    const [createTodo, state] = useMutation(
        gql`
            mutation CreateOccurrenceTodo($title: String!, $occurrenceId: ID!) {
                createOccurrenceTodo(occurrenceId: $occurrenceId, title: $title) {
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
            }
        `,
        {
            update(cache, data) {
                const existing = cache.readQuery({
                    query: GET_OCCURRENCE_BY_ID,
                    variables: { id: occurrenceId },
                }) as { occurrenceById: any }

                if (!existing?.occurrenceById) return

                const final = {
                    occurrenceById: {
                        ...existing.occurrenceById,
                        todos: [...existing.occurrenceById.todos, data.data.createOccurrenceTodo].sort((a, b) => {
                            if (a.isCompleted !== b.isCompleted) return a.isCompleted - b.isCompleted
                            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                        }),
                    },
                }

                cache.writeQuery({
                    data: final,
                    query: GET_OCCURRENCE_BY_ID,
                    variables: { id: occurrenceId },
                })
            },
            context: {
                headers: { authentication: usr.token },
            },
            onError(er) {
                console.log(er)
            },
        },
    )

    return { createTodo, state }
}

export default useCreateTodo
