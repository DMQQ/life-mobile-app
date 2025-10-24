import { gql, useMutation } from "@apollo/client"

const REMOVE_TODO_FILE = gql`
    mutation RemoveTodoFile($fileId: ID!) {
        removeTodoFile(fileId: $fileId)
    }
`

export default function useRemoveTodoFile() {
    const [removeTodoFile, { data, loading, error }] = useMutation(REMOVE_TODO_FILE, {
        onError: (error) => {
            console.error("Error removing todo file:", error)
        },
    })

    return { removeTodoFile, data, loading, error }
}