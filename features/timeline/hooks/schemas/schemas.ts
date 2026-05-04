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
        priority
        reminderBeforeMinutes
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
    mutation CreateEvent($input: CreateEventWithRepeatInput!) {
        createEvent(input: $input) {
            ...OccurrenceFields
        }
    }
    ${OCCURRENCE_FIELDS}
`

export const COPY_OCCURRENCE = gql`
    mutation CopyOccurrence($input: CopyOccurrenceArgsInput!) {
        copyOccurrence(input: $input) {
            ...OccurrenceFields
        }
    }
    ${OCCURRENCE_FIELDS}
`
