import { Todos } from "@/types";
import useCreateTodo from "./useCreateTodo";
import { useNavigation } from "@react-navigation/native";
import { GET_TIMELINE } from "../query/useGetTimelineById";

const useTransferTodos = (oldTodos: Todos[], newTimelineId: string) => {
  const navigation = useNavigation<any>();

  const { createTodo, state } = useCreateTodo(newTimelineId);
  const handleTransfer = async () => {
    const promiseList = oldTodos.map(({ title }) =>
      createTodo({
        variables: {
          timelineId: newTimelineId,
          title,
        },
      })
    );

    await Promise.all(promiseList);

    await state.client.query({
      query: GET_TIMELINE,
      variables: { id: newTimelineId },
    });

    navigation.navigate("TimelineDetails", {
      timelineId: newTimelineId,
    });
  };

  return handleTransfer;
};

export default useTransferTodos;
