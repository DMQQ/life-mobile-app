import { gql, useMutation } from "@apollo/client"

const ADD_TODO_FILE = gql`
    mutation AddTodoFile($todoId: ID!, $type: String!, $url: String!) {
        addTodoFile(todoId: $todoId, type: $type, url: $url) {
            id
            type
            url
        }
    }
`

export default function useAddTodoFile() {
    const [addTodoFile, { data, loading, error }] = useMutation(ADD_TODO_FILE, {
        onError: (error) => {
            console.error("Error adding todo file:", error)
        },
    })

    return { addTodoFile, data, loading, error }
}