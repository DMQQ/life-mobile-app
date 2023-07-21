import { gql, useMutation } from "@apollo/client";
import { useAppSelector } from "../../../utils/redux";
import UPDATE_PROGRESS, {
  UpdateProgressVariables,
} from "../../../utils/schemas/UPDATE_PROGRESS";
import { Workout } from "../../../types";
import { GET_WORKOUT } from "../../../utils/schemas/GET_WORKOUT";

const parseValues = (prop: { [key: string]: string }) => {
  const obj: {
    [key: string]: number;
  } = {};
  Object.keys(prop).forEach((key) => {
    obj[key] = Number(prop[key]);
  });
  return obj;
};

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

export default function useUpdateProgress(props: {
  workoutId: string;
  onDismiss: () => void;
  exerciseId: string;
}) {
  const token = useAppSelector((st) => st.user.token);
  const workout = useAppSelector((s) => s.workout);

  const [addExerciseProgress] = useMutation(UPDATE_PROGRESS, {
    context: {
      headers: {
        authentication: token,
      },
    },
    onCompleted() {
      props.onDismiss();
    },

    refetchQueries: [
      // {
      //   query: GetExerciseProgressQuery,
      //   variables: {
      //     exerciseId: props.exerciseId,
      //   },
      // },
      "GetExerciseProgress",
    ],

    onError(err) {
      // console.log(JSON.stringify(err, null, 2));
    },
  });

  const onSubmit = async (results: any) => {
    console.log(
      workout.exercises.find((ex) => ex.exerciseId === props.exerciseId)
    );
    await addExerciseProgress({
      variables: {
        exerciseId: props.exerciseId,
        ...parseValues(results),
      } as UpdateProgressVariables,
    });
  };

  return { onSubmit };
}
