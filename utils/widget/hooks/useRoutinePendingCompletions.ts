import { gql, useMutation } from "@apollo/client"
import { useCallback } from "react"
import store from "../store"
import { ExtensionStorage } from "@bacons/apple-targets"

const COMPLETE_OCCURRENCE = gql`
    mutation CompleteOccurrenceFromWidget($input: CompleteOccurrenceInput!) {
        completeOccurrence(input: $input) {
            id
            isCompleted
        }
    }
`

const COMPLETE_TODO = gql`
    mutation CompleteOccurrenceTodoFromWidget($input: CompleteOccurrenceTodoInput!) {
        completeOccurrenceTodo(input: $input) {
            id
            isCompleted
        }
    }
`

export default function useRoutinePendingCompletions() {
    const [completeOccurrence] = useMutation(COMPLETE_OCCURRENCE)
    const [completeTodo] = useMutation(COMPLETE_TODO)

    const processPending = useCallback(async () => {
        // Process event-level completions — queued as { id, isCompleted } JSON strings
        const rawEvents = store.get("routine_pending_completions")
        if (rawEvents) {
            let items: { id: string; isCompleted: boolean }[] = []
            try {
                const parsed = JSON.parse(rawEvents)
                // Support both old format (string[]) and new format ({ id, isCompleted }[])
                if (Array.isArray(parsed)) {
                    items = parsed.map((entry: any) =>
                        typeof entry === "string"
                            ? { id: entry, isCompleted: true }
                            : entry,
                    )
                }
            } catch {}
            if (items.length) {
                store.set("routine_pending_completions", JSON.stringify([]))
                await Promise.allSettled(
                    items.map((item) =>
                        completeOccurrence({ variables: { input: { id: item.id, isCompleted: item.isCompleted } } }),
                    ),
                )
            }
        }

        // Process todo-level completions — queued as { todoId, eventId, date, isCompleted } JSON strings
        const rawTodos = store.get("routine_pending_todo_completions")
        if (rawTodos) {
            let jsonStrings: string[] = []
            try { jsonStrings = JSON.parse(rawTodos) } catch {}
            let items: { todoId: string; isCompleted: boolean }[] = []
            for (const s of jsonStrings) {
                try { items.push(JSON.parse(s)) } catch {}
            }
            if (items.length) {
                store.set("routine_pending_todo_completions", JSON.stringify([]))
                await Promise.allSettled(
                    items.map((item) =>
                        completeTodo({ variables: { input: { id: item.todoId, isCompleted: item.isCompleted } } }),
                    ),
                )
            }
        }

        ExtensionStorage.reloadWidget()
    }, [completeOccurrence, completeTodo])

    return { processPending }
}
