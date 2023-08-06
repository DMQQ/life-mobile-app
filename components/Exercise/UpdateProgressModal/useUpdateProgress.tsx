import { gql, useMutation } from "@apollo/client";
import { useAppSelector } from "../../../utils/redux";
import UPDATE_PROGRESS, {
  UpdateProgressVariables,
} from "../../../utils/schemas/UPDATE_PROGRESS";
import { ExerciseProgress } from "../../../types";
import { FormikHelpers } from "formik";

const parseValues = (prop: { [key: string | number | symbol]: any }) => {
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

    update(cache, { data: { createExerciseProgress } }) {
      const new_exercise_progress = {
        ...createExerciseProgress,
      } as ExerciseProgress;

      const old_exercise_progress = cache.readQuery({
        query: GetExerciseProgressQuery,
        variables: { exerciseId: props.exerciseId },
      }) as { exerciseProgress: ExerciseProgress[] };

      const copy = {
        exerciseProgress: [
          new_exercise_progress,
          ...old_exercise_progress.exerciseProgress,
        ],
      } as { exerciseProgress: ExerciseProgress[] };

      cache.writeQuery({
        data: copy,
        query: GetExerciseProgressQuery,
        variables: { exerciseId: props.exerciseId },
      });
    },

    onError(err) {},
  });

  interface Input {
    reps: string;
    sets: string;
    weight: string;
  }

  const onSubmit = async (results: Input, formik: FormikHelpers<Input>) => {
    await addExerciseProgress({
      variables: {
        exerciseId: props.exerciseId,
        ...parseValues(results),
      } as UpdateProgressVariables,
    });

    formik.resetForm();
  };

  return { onSubmit };
}
