import { gql, useMutation } from "@apollo/client";
import { GET_TIMELINE } from "../query/useGetTimelineById";
import { Timeline } from "@/types";

export const COMPLETE_TIMELINE = gql`
  mutation CompleteTimeline($id: String!) {
    completeTimeline(id: $id) {
      id
      isCompleted
    }
  }
`;

interface TimelineById {
  timelineById: Timeline;
}

export default function useCompleteTimeline(timelineId: string) {
  return useMutation(COMPLETE_TIMELINE, {
    variables: {
      id: timelineId,
    },

    update(cache, { data: { completeTimeline } }) {
      const data = cache.readQuery({
        query: GET_TIMELINE,
        variables: { id: timelineId },
      }) as TimelineById;

      const copy = {
        timelineById: {
          ...data.timelineById,
          isCompleted: completeTimeline.isCompleted,
        },
      } as TimelineById;

      cache.writeQuery({
        data: copy,
        query: GET_TIMELINE,
        variables: { id: timelineId },
        overwrite: true,
      });
    },

    onError(err) {
      console.log(JSON.stringify(err, null, 2));
    },
  });
}
