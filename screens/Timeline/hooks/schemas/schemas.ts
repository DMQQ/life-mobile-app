import { gql } from "@apollo/client";

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
  ) {
    createTimeline(
      input: {
        title: $title
        description: $desc
        date: $date
        beginTime: $begin
        endTime: $end
        tags: $tags
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
    }
  }
`;
