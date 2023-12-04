import { gql, useQuery } from "@apollo/client";
import useUser from "../../../../utils/hooks/useUser";
import { Workout } from "../../../../types";

const GetWorkoutsQuery = gql`
  query GetWorkouts {
    workouts {
      workoutId
      title
      description
      type
      difficulty

      exercises {
        exerciseId
      }
    }
  }
`;

export default function useGetWorkoutsQuery() {
  const usr = useUser();

  return useQuery<{ workouts: Workout[] }>(GetWorkoutsQuery, {
    context: {
      headers: {
        token: usr.token,
      },
    },
  });
}
