import { gql, useMutation } from "@apollo/client";
import useUser from "../../../../../utils/hooks/useUser";
import { GET_MONTHLY_EVENTS } from "../general/useTimeline";
import moment from "moment";

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
    refetchQueries: [
      {
        query: GET_MONTHLY_EVENTS,
        variables: {
          date: moment().format("YYYY-MM-DD"),
        },

        context: {
          headers: {
            authentication: usr.token,
          },
        },
      },
    ],
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
