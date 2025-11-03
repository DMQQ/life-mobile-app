import { gql } from "@apollo/client"

export const CREATE_TIMELINE_EVENT = gql`
    mutation CreateTimelineEvent(
        $title: String!
        $desc: String!
        $date: String!
        $begin: String!
        $end: String!
        $tags: String!
        $repeatCount: Int
        $repeatUntil: String
        $repeatOn: String
        $repeatEveryNth: Int
        $todos: [String!]
    ) {
        createTimeline(
            input: {
                title: $title
                description: $desc
                date: $date
                beginTime: $begin
                endTime: $end
                tags: $tags
                todos: $todos
            }
            options: {
                reapeatCount: $repeatCount
                startDate: $date
                repeatUntil: $repeatUntil
                repeatOn: $repeatOn
                repeatEveryNth: $repeatEveryNth
            }
        ) {
            id
            title
            description
            date
            beginTime
            endTime
            tags
            isCompleted

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
        }
    }
`

export const COPY_TIMELINE = gql`
    mutation CopyTimeline($timelineId: ID!, $newDate: String) {
        copyTimeline(timelineId: $timelineId, input: { newDate: $newDate }) {
            id
            title
            description
            date
            beginTime
            endTime
            tags
            isCompleted
            todos {
                id
                title
                isCompleted
                createdAt
                modifiedAt
            }
            images {
                id
                url
                type
            }
        }
    }
`
