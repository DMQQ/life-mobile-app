import { gql, useMutation } from "@apollo/client";
import useUser from "../../../../../utils/hooks/useUser";
import { GET_TIMELINE } from "../query/useGetTimelineById";

export default function useCompleteTodo(props: {
  todoId: string;
  timelineId: string;
}) {
  const { token } = useUser();

  const [completeTodo, state] = useMutation(
    gql`
      mutation CompleteTodo($todoId: ID!) {
        completeTimelineTodo(id: $todoId) {
          isCompleted
        }
      }
    `,
    {
      context: {
        headers: {
          authentication: token,
        },
      },

      update(cache) {
        const data = cache.readQuery({
          query: GET_TIMELINE,
          variables: { id: props.timelineId },
        }) as any;

        const todos = data?.timelineById.todos.map((todo: any) => {
          if (todo.id === props.todoId) {
            return {
              ...todo,
              isCompleted: true,
            };
          }

          return todo;
        });

        cache.writeQuery({
          query: GET_TIMELINE,
          variables: { id: props.timelineId },
          data: {
            timelineById: {
              ...data?.timelineById,
              todos,
            },
          },
        });
      },
    }
  );

  return {
    completeTodo: () =>
      completeTodo({
        variables: {
          todoId: props.todoId,
        },
      }),
  };
}
