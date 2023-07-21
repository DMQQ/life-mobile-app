import { gql, useQuery } from "@apollo/client";
import { Workout } from "../../../types";
import useUser from "../../hooks/useUser";

export const GET_WORKOUTS = gql`
  query GetWorkouts {
    workouts {
      id
      date
      userId
      exercises {
        id
        name
        description
        image
        exercise_progress(paging: { skip: 0, limit: 5 }) {
          id
          reps
          sets
          weight
        }
      }
    }
  }
`;

interface Offset {
  skip: number;
  take: number;
}

export const useGetWorkouts = (offset?: Offset) => {
  const { token } = useUser();

  return useQuery<{ workouts: Workout[] }>(GET_WORKOUTS, {
    context: {
      headers: {
        authentication: token,
      },
    },
    variables: {
      ...offset,
    },
  });
};
