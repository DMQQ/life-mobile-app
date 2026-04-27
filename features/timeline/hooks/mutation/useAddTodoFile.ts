import { gql, useMutation } from "@apollo/client"

const ADD_TODO_FILE = gql`
    mutation AddTodoFile($input: AddTodoFileInput!) {
        addTodoFile(input: $input) {
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
