export interface AiChatMessageItem {
    type: string
    data: any
    subtype?: string
}

export type Personality = "playful" | "finance" | "helpful"
export type Effort = "high" | "low"

export interface Conversation {
    id: string
    title: string | null
    description: string | null
    personality: Personality | null
    effort: Effort | null
    createdAt: string
    updatedAt: string
}

export type ChatMessage =
    | { id: string; role: "user"; userContent: string; createdAt: string }
    | { id: string; role: "assistant"; aiMessages: AiChatMessageItem[]; createdAt: string; status: "success" | "error" }
