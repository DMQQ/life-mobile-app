import { gql } from "@apollo/client"

const AI_MESSAGE_FIELDS = gql`
    fragment AiMessageFields on AiChatMessageItem {
        type
        subtype
        data
    }
`

export const AI_CHAT = gql`
    ${AI_MESSAGE_FIELDS}
    mutation AiChat($input: AiChatInput!) {
        aiChat(input: $input) {
            conversationId
            messages {
                ...AiMessageFields
            }
        }
    }
`

export const AI_CONTEXT_CHAT = gql`
    ${AI_MESSAGE_FIELDS}
    mutation AiContextChat($input: AiChatInput!) {
        aiChat(input: $input) {
            conversationId
            messages {
                ...AiMessageFields
            }
        }
    }
`

export const AI_CONVERSATIONS = gql`
    query AiConversations {
        aiConversations {
            id
            title
            description
            personality
            effort
            createdAt
            updatedAt
        }
    }
`

export const AI_CONVERSATION = gql`
    ${AI_MESSAGE_FIELDS}
    query AiConversation($id: String!) {
        aiConversation(id: $id) {
            id
            title
            description
            createdAt
            updatedAt
            messages {
                role
                userContent
                aiMessages {
                    ...AiMessageFields
                }
                createdAt
            }
        }
    }
`
