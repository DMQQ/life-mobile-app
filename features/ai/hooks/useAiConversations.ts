import { useQuery } from "@apollo/client"
import { AI_CONVERSATIONS } from "../gql"
import { Conversation } from "../types"

export function useAiConversations() {
    const { data, loading, refetch } = useQuery(AI_CONVERSATIONS)
    const conversations: Conversation[] = data?.aiConversations ?? []
    return { conversations, loading, refetch }
}
