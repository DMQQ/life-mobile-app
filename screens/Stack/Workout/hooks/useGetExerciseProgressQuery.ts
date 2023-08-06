import { gql, useQuery } from "@apollo/client";
import useUser from "../../../../utils/hooks/useUser";

const GetExerciseProgressQuery = gql`
  query GetExerciseProgress($exerciseId: ID!) {
    exerciseProgress(exerciseId: $exerciseId) {
      exerciseProgressId
      date
      sets
      reps
      weight
    }
  }
`;

export default function useGetExerciseProgressQuery(
  exerciseId: string | undefined
) {
  const usr = useUser();

  return useQuery(GetExerciseProgressQuery, {
    context: {
      headers: {
        token: usr.token,
      },
    },
    variables: {
      exerciseId: exerciseId,
    },

    skip: exerciseId === undefined,
  });
}
