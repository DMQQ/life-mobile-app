import { gql, useMutation } from "@apollo/client";
import useUser from "../../../../../utils/hooks/useUser";

interface CompleteTodoVariables {}

interface CompleteTodo {}

const COMPLETE_TODO = gql``;

export default function useCompleteTodo() {
  const { token } = useUser();

  const [completeTodo] = useMutation<CompleteTodo, CompleteTodoVariables>(
    COMPLETE_TODO,
    {}
  );

  return;
}
