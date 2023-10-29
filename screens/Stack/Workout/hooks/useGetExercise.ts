import { gql, useApolloClient, useQuery } from "@apollo/client";
import useUser from "../../../../utils/hooks/useUser";

export default function useGetExercise() {
  const { token } = useUser();

  const apollo = useApolloClient();

  return apollo.readFragment;
}
