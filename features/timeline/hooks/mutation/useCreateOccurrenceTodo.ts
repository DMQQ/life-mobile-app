import { gql, useMutation } from "@apollo/client"
import useUser from "@/utils/hooks/useUser"
import { GET_OCCURRENCE_BY_ID } from "../query/useGetOccurrenceById"

const CREATE_OCCURRENCE_TODO = gql`
    mutation CreateOccurrenceTodo($occurrenceId: ID!, $title: String!) {
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
`

const useCreateOccurrenceTodo = (occurrenceId: string) => {
    const usr = useUser()

    const [createTodo, state] = useMutation(CREATE_OCCURRENCE_TODO, {
        update(cache, data) {
            const existing = cache.readQuery({
                query: GET_OCCURRENCE_BY_ID,
                variables: { id: occurrenceId },
            }) as { occurrenceById: any }

            if (!existing?.occurrenceById) return

            const newTodo = data.data.createOccurrenceTodo
            const updatedTodos = [...existing.occurrenceById.todos, newTodo].sort((a, b) => {
                if (a.isCompleted !== b.isCompleted) return a.isCompleted - b.isCompleted
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            })

            cache.writeQuery({
                data: {
                    occurrenceById: {
                        ...existing.occurrenceById,
                        todos: updatedTodos,
                    },
                },
                query: GET_OCCURRENCE_BY_ID,
                variables: { id: occurrenceId },
            })
        },

        context: {
            headers: { authentication: usr.token },
        },

        variables: {
            occurrenceId,
        },

        onError(err) {
            console.log("useCreateOccurrenceTodo:", err)
        },
    })

    return { createTodo, state }
}

export default useCreateOccurrenceTodo
