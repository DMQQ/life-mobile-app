import { useMutation, useQuery } from "@apollo/client"
import { useCallback, useEffect, useRef, useState } from "react"
import { AI_CHAT, AI_CONVERSATION, AI_CONVERSATIONS } from "../gql"
import { AiChatMessageItem, ChatMessage } from "../types"

function mapServerMessages(serverMsgs: any[]): ChatMessage[] {
    return serverMsgs.map((msg, i) => {
        if (msg.role === "user") {
            return {
                id: `s-${i}`,
                role: "user" as const,
                userContent: msg.userContent ?? "",
                createdAt: msg.createdAt,
            }
        }
        return {
            id: `s-${i}`,
            role: "assistant" as const,
            aiMessages: (msg.aiMessages ?? []) as AiChatMessageItem[],
            createdAt: msg.createdAt,
            status: "success" as const,
        }
    })
}

export function useAiChat(initialConversationId?: string) {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState("")
    const initialized = useRef(false)

    const { data: convData } = useQuery(AI_CONVERSATION, {
        variables: { id: initialConversationId ?? "" },
        skip: !initialConversationId,
    })

    useEffect(() => {
        if (!initialized.current && convData?.aiConversation?.messages) {
            setMessages(mapServerMessages(convData.aiConversation.messages))
            initialized.current = true
        }
    }, [convData])

    const [aiChatMutation] = useMutation(AI_CHAT)

    const send = useCallback(
        async (
            text: string,
            startDate: string,
            endDate: string,
            personality?: string,
            effort?: string,
        ): Promise<boolean> => {
            const trimmed = text.trim()
            if (!trimmed || busy) return false

            const userMsg: ChatMessage = {
                id: Date.now().toString(),
                role: "user",
                userContent: trimmed,
                createdAt: new Date().toISOString(),
            }

            setMessages((prev) => [...prev, userMsg])
            setBusy(true)
            setError("")

            try {
                const { data } = await aiChatMutation({
                    variables: {
                        input: {
                            message: trimmed,
                            conversationId,
                            startDate,
                            endDate,
                            ...(!conversationId && personality ? { personality } : {}),
                            ...(!conversationId && effort ? { effort } : {}),
                        },
                    },
                    refetchQueries: conversationId ? [] : [{ query: AI_CONVERSATIONS }],
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
                        aiMessages: result.messages ?? [],
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
        [busy, conversationId, aiChatMutation],
    )

    const reset = useCallback(() => {
        setMessages([])
        setConversationId(undefined)
        setError("")
        initialized.current = false
    }, [])

    return { messages, busy, error, send, conversationId, reset, title: convData?.aiConversation?.title ?? "Chat" }
}
