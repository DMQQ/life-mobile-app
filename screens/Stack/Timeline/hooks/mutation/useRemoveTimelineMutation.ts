import { gql, useMutation } from "@apollo/client";
import useUser from "../../../../../utils/hooks/useUser";

const REMOVE_TIMELINE_EVENT_MUTATION = gql`
  mutation RemoveTimelineEvent($id: String!) {
    removeTimeline(id: $id)
  }
`;

export default function useRemoveTimelineMutation(timeline: { id: string }) {
  const usr = useUser();

  const [remove, { loading }] = useMutation(REMOVE_TIMELINE_EVENT_MUTATION, {
    context: {
      headers: {
        authentication: usr.token,
      },
    },
    variables: {
      id: timeline.id,
    },
    refetchQueries: ["GetMonthlyEvents"],
    update(cache) {
      cache.modify({
        fields: {
          timeline(existingTimelineRefs = [], { readField }) {
            return existingTimelineRefs.filter(
              (el: any) => readField("id", el) !== timeline.id
            );
          },
        },
      });
    },
  });

  return { remove, loading };
}
