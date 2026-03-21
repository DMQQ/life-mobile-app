import { gql, useMutation } from "@apollo/client"
import { useCallback } from "react"
import store from "../store"
import { ExtensionStorage } from "@bacons/apple-targets"

const TOGGLE_TIMELINE = gql`
    mutation ToggleTimelineCompletion($id: String!) {
        toggleTimelineCompletion(id: $id) {
            id
            isCompleted
        }
    }
`

const COMPLETE_TODO = gql`
    mutation CompleteTodo($todoId: ID!, $isCompleted: Boolean!, $occurrenceDate: String) {
        completeTimelineTodo(id: $todoId, isCompleted: $isCompleted, occurrenceDate: $occurrenceDate) {
            id
            isCompleted
        }
    }
`

export default function useRoutinePendingCompletions() {
    const [toggle] = useMutation(TOGGLE_TIMELINE)
    const [completeTodo] = useMutation(COMPLETE_TODO)

    const processPending = useCallback(async () => {
        // Process event-level toggles
        const rawEvents = store.get("routine_pending_completions")
        if (rawEvents) {
            let ids: string[] = []
            try { ids = JSON.parse(rawEvents) } catch {}
            if (ids.length) {
                store.set("routine_pending_completions", JSON.stringify([]))
                await Promise.allSettled(ids.map((id) => toggle({ variables: { id } })))
            }
        }

        // Process todo-level toggles (stored as JSON strings by ToggleRoutineTodoIntent)
        const rawTodos = store.get("routine_pending_todo_completions")
        if (rawTodos) {
            let jsonStrings: string[] = []
            try { jsonStrings = JSON.parse(rawTodos) } catch {}
            let items: { todoId: string; eventId: string; date: string; isCompleted: boolean }[] = []
            for (const s of jsonStrings) {
                try { items.push(JSON.parse(s)) } catch {}
            }
            if (items.length) {
                store.set("routine_pending_todo_completions", JSON.stringify([]))
                await Promise.allSettled(
                    items.map((item) =>
                        completeTodo({
                            variables: {
                                todoId: item.todoId,
                                isCompleted: item.isCompleted,
                                occurrenceDate: item.date,
                            },
                        }),
                    ),
                )
            }
        }

        ExtensionStorage.reloadWidget()
    }, [toggle, completeTodo])

    return { processPending }
}
