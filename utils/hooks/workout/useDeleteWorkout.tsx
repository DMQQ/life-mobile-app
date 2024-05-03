import { gql, useMutation } from "@apollo/client";
import useUser from "../useUser";
import { GET_WORKOUTS } from "./useGetWorkouts";
import { Workout } from "../../../types";

const DELETE_WORKOUT = gql`
  mutation DeleteWorkout($id: ID!) {
    deleteWorkout(id: $id)
  }
`;

export default function useDeleteWorkout() {
  const { token } = useUser();

  return useMutation(DELETE_WORKOUT, {
    update(cache, { data: { deleteWorkout } }) {
      const workoutId = deleteWorkout;

      cache.modify({
        fields: {
          workouts() {
            const { workouts } = cache.readQuery({
              query: GET_WORKOUTS,
            }) as { workouts: Workout[] };

            return workouts.filter(
              (workout: Workout) => workout.workoutId !== workoutId
            );
          },
        },
      });
    },
  });
}
