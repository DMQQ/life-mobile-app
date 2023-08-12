import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Exercise } from "../../../types";

type StartPayload = PayloadAction<{
  workoutId: string;
  exercises: Exercise[];
  title: string;
  description: string;
}>;

type ExerciseExtended = Exercise & {
  isSkipped: boolean;
  isFinished: boolean;
  totalTime: number;
};

export const workoutSlice = createSlice({
  name: "workout",
  initialState: {
    workoutId: "",

    isWorkoutPending: false,
    exercises: [] as ExerciseExtended[],

    skipped_exercises: [] as ExerciseExtended[],

    activeExerciseIndex: 0,
    currentExercise: {} as ExerciseExtended,

    selectedExercise: {} as ExerciseExtended,

    title: "",

    description: "",

    startTime: 0,

    options: {
      rest: 60 * 3, // 3 min
      prepareTime: 2, // 2s
    },
  },
  reducers: {
    start(state, { payload }: StartPayload) {
      state.workoutId = payload.workoutId;
      state.activeExerciseIndex = 0;
      state.isWorkoutPending = true;
      state.exercises = payload.exercises.map((ex) => ({
        ...ex,
        isSkipped: false,
        isFinished: false,
        totalTime: 0,
      }));

      state.title = payload.title;
      state.description = payload.description;

      state.currentExercise = state.exercises[state.activeExerciseIndex];

      state.startTime = Date.now();
    },

    next(state, { payload }: { payload: { skip?: boolean } }) {
      if (state.activeExerciseIndex + 1 > state.exercises.length) {
        state.isWorkoutPending = false;
        return;
      }

      state.exercises[state.activeExerciseIndex] = {
        ...state.exercises[state.activeExerciseIndex],
        isFinished: !payload.skip,
        isSkipped: payload.skip || false,
      };

      if (payload.skip)
        state.skipped_exercises = [
          ...state.skipped_exercises,
          state.currentExercise,
        ];

      state.activeExerciseIndex++;

      state.currentExercise = state.exercises[state.activeExerciseIndex];
    },

    end(state) {
      state.isWorkoutPending = false;
      state.activeExerciseIndex = 0;
    },
  },
});

export const workoutActions = workoutSlice.actions;
