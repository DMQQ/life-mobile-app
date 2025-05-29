import { useReducer } from "react";
import { Keyboard } from "react-native";
import useCreateTodo from "../mutation/useCreateTodo";

export interface TodoInput {
  index: number;
  value: string;
}

export type Action =
  | { type: "add"; payload: string }
  | { type: "remove"; payload: number }
  | { type: "clear"; payload: any };

const initialValues = {
  index: 0,
  todos: [] as TodoInput[],
};

const MAX_TODOS = 8;

const reducer = (state: typeof initialValues, action: Action) => {
  switch (action.type) {
    case "add":
      if (state.todos.length > MAX_TODOS || action.payload.trim() === "")
        return state;
      const index = state.index + 1;
      return {
        index,
        todos: [{ index, value: action.payload }, ...state.todos],
      };
    case "remove":
      const filtered = state.todos.filter(
        (todo) => todo.index !== action.payload
      );
      return {
        ...state,
        todos: filtered,
      };
    case "clear":
      return {
        ...state,
        todos: [],
      };
    default:
      return state;
  }
};

export default function useTodos(
  timelineId: string,
  onSuccessfulSave?: () => void
) {
  const [state, dispatch] = useReducer(reducer, initialValues);

  const {
    createTodo,
    state: { loading },
  } = useCreateTodo(timelineId);

  const onSaveTodos = async () => {
    if (loading || !timelineId || state.todos.length === 0) return;

    const filteredTodos = state.todos.filter(
      (todo) => todo.value.trim().length > 0
    );

    try {
      const promises = filteredTodos.map((todo) =>
        createTodo({ variables: { title: todo.value, timelineId } })
      );

      await Promise.all(promises);
    } catch (error) {
      console.log("error", error);
    } finally {
      dispatch({ type: "clear", payload: undefined });
      onSuccessfulSave?.();
    }
  };

  return { state, dispatch, onSaveTodos, loading };
}
