import { gql } from "@apollo/client"

// ─── Shared Fragment ─────────────────────────────────────────────────────────

export const OCCURRENCE_FIELDS = gql`
    fragment OccurrenceFields on OccurrenceView {
        id
        seriesId
        date
        position
        title
        description
        beginTime
        endTime
        isCompleted
        isSkipped
        isAllDay
        isRepeat
        tags
        todos {
            id
            title
            isCompleted
            createdAt
            modifiedAt
            files {
                id
                type
                url
            }
        }
        images {
            id
            url
            type
            name
        }
    }
`

// ─── Mutations ───────────────────────────────────────────────────────────────

export const CREATE_EVENT = gql`
    mutation CreateEvent(
        $title: String!
        $desc: String!
        $date: String!
        $begin: String!
        $end: String!
        $tags: String!
        $repeatCount: Int
        $repeatOn: String
        $repeatEveryNth: Int
        $startDate: String
        $todos: [String!]
    ) {
        createEvent(
            input: {
                title: $title
                description: $desc
                date: $date
                beginTime: $begin
                endTime: $end
                tags: $tags
                todos: $todos
            }
            repeat: {
                repeatCount: $repeatCount
                repeatOn: $repeatOn
                repeatEveryNth: $repeatEveryNth
                startDate: $startDate
            }
        ) {
            ...OccurrenceFields
        }
    }
    ${OCCURRENCE_FIELDS}
`

export const COPY_OCCURRENCE = gql`
    mutation CopyOccurrence($occurrenceId: ID!, $newDate: String) {
        copyOccurrence(occurrenceId: $occurrenceId, input: { newDate: $newDate }) {
            ...OccurrenceFields
        }
    }
    ${OCCURRENCE_FIELDS}
`
