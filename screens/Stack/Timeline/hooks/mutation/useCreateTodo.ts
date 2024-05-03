import useUser from "@/utils/hooks/useUser";
import { gql, useMutation } from "@apollo/client";
import { GET_TIMELINE } from "../query/useGetTimelineById";
import { Timeline } from "@/types";

const useCreateTodo = (timelineId: string) => {
  const usr = useUser();

  const [createTodo, state] = useMutation(
    gql`
      mutation CreateTodo($title: String!, $timelineId: ID!) {
        createTimelineTodos(todos: { title: $title, timelineId: $timelineId }) {
          id
          title
          isCompleted
        }
      }
    `,
    {
      update(cache, data) {
        const timeline = cache.readQuery({
          query: GET_TIMELINE,
          variables: { id: timelineId },
        }) as { timelineById: Timeline };

        const final = {
          timelineById: {
            ...timeline.timelineById,
            todos: [
              ...timeline.timelineById.todos,
              data.data.createTimelineTodos,
            ],
          },
        };

        cache.writeQuery({
          data: final,
          id: cache.identify(final),
          query: GET_TIMELINE,
          variables: { id: timeline.timelineById.id },
        });
      },
      context: {
        headers: {
          authentication: usr.token,
        },
      },
    }
  );

  return { createTodo, state };
};

export default useCreateTodo;
