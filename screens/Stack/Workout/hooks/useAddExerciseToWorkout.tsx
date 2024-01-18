import { gql, useMutation } from "@apollo/client";
import { GET_WORKOUT } from "../../../../utils/schemas/GET_WORKOUT";

const ADD_EXERCISE_TO_WORKOUT = gql`
  mutation AddExerciseToWorkout($exerciseId: String!, $workoutId: String!) {
    assignExerciseToWorkout(exerciseId: $exerciseId, workoutId: $workoutId)
  }
`;

export default function useAddExerciseToWorkout(
  workoutId?: string,
  exerciseId?: string
) {
  const [addExercise] = useMutation(ADD_EXERCISE_TO_WORKOUT, {});

  function add(_workoutId: string, _exerciseId: string) {
    return addExercise({
      variables: {
        workoutId: workoutId || _workoutId,
        exerciseId: exerciseId || _exerciseId,
      },
      update(cache) {
        cache.modify({
          fields: {
            workout(workouts = []) {
              cache.readQuery({
                query: GET_WORKOUT,
                variables: { id: _workoutId },
              });
            },
          },
        });
      },
    });
  }

  return { add };
}
