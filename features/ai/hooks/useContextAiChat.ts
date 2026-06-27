import { useMutation } from "@apollo/client"
import { useCallback, useState } from "react"
import { AI_CONTEXT_CHAT } from "../gql"
import { AiChatMessageItem, ChatMessage } from "../types"

export type AiContextType = "expense" | "subscription" | "goal" | "event"

interface Options {
    contextType: AiContextType
    contextId: string
}

export function useContextAiChat({ contextType, contextId }: Options) {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [conversationId, setConversationId] = useState<string | undefined>()
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState("")

    const [aiChatMutation] = useMutation(AI_CONTEXT_CHAT)

    const send = useCallback(
        async (text: string): Promise<boolean> => {
            const trimmed = text.trim()
            if (!trimmed || busy) return false

            setMessages((prev) => [
                ...prev,
                { id: Date.now().toString(), role: "user", userContent: trimmed, createdAt: new Date().toISOString() },
            ])
            setBusy(true)
            setError("")

            try {
                const { data } = await aiChatMutation({
                    variables: {
                        input: {
                            message: trimmed,
                            conversationId,
                            contextType,
                            contextId,
                            personality: "helpful",
                            effort: "high",
                        },
                    },
                })

                const result = data?.aiChat
                if (!result) throw new Error("Empty response")

                if (!conversationId && result.conversationId) {
                    setConversationId(result.conversationId)
                }

                setMessages((prev) => [
                    ...prev,
                    {
                        id: (Date.now() + 1).toString(),
                        role: "assistant" as const,
                        aiMessages: (result.messages ?? []) as AiChatMessageItem[],
                        createdAt: new Date().toISOString(),
                        status: "success" as const,
                    },
                ])
                return true
            } catch (e: any) {
                const errMsg = e?.graphQLErrors?.[0]?.message ?? e?.message ?? "Connection failed."
                setError(errMsg)
                setMessages((prev) => [
                    ...prev,
                    {
                        id: (Date.now() + 1).toString(),
                        role: "assistant" as const,
                        aiMessages: [],
                        createdAt: new Date().toISOString(),
                        status: "error" as const,
                    },
                ])
                return false
            } finally {
                setBusy(false)
            }
        },
        [busy, conversationId, contextType, contextId, aiChatMutation],
    )

    const reset = useCallback(() => {
        setMessages([])
        setConversationId(undefined)
        setError("")
    }, [])

    return { messages, busy, error, send, reset }
}
