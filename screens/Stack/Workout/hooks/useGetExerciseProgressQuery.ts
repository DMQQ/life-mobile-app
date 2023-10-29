import { gql, useQuery } from "@apollo/client";
import useUser from "../../../../utils/hooks/useUser";
import { ExerciseProgress } from "../../../../types";

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

  const { data } = useQuery(GetExerciseProgressQuery, {
    context: {
      headers: {
        token: usr.token,
      },
    },
    variables: {
      exerciseId: exerciseId,
    },

    fetchPolicy: "cache-first",

    skip: exerciseId === undefined,
  });

  return (data?.exerciseProgress || []) as ExerciseProgress[];
}
