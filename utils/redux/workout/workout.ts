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
  totalTime: number[];
};

export const workoutSlice = createSlice({
  name: "workout",
  initialState: {
    workoutId: "",

    isWorkoutPending: false,
    exercises: [] as ExerciseExtended[],

    total_exercises: [] as ExerciseExtended[],

    skipped_exercises: [] as ExerciseExtended[],

    activeExerciseIndex: 0,
    currentExercise: {} as ExerciseExtended,

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
      const exs = payload.exercises.map((ex) => ({
        ...ex,
        isSkipped: false,
        isFinished: false,
        totalTime: [],
      }));

      state.exercises = exs;
      state.total_exercises = exs;

      state.title = payload.title;
      state.description = payload.description;

      state.currentExercise = state.total_exercises[state.activeExerciseIndex];

      state.startTime = Date.now();
    },

    runSkipped(state) {
      if (state.isWorkoutPending) return;
      state.isWorkoutPending = true;
      state.exercises = state.skipped_exercises;
      state.activeExerciseIndex = 0;
      state.skipped_exercises = [];
      state.currentExercise = state.exercises[state.activeExerciseIndex];
    },

    next(state, { payload }: { payload: { skip?: boolean } }) {
      if (!state.isWorkoutPending) return;

      if (state.activeExerciseIndex + 1 > state.exercises.length) {
        state.isWorkoutPending = false;
        return;
      }

      state.exercises[state.activeExerciseIndex].isFinished = !payload.skip;
      state.exercises[state.activeExerciseIndex].isSkipped =
        payload.skip || false;

      if (payload.skip) state.skipped_exercises.push(state.currentExercise);

      state.activeExerciseIndex++;

      if (state.activeExerciseIndex > state.exercises.length) return;
      state.currentExercise = state.exercises[state.activeExerciseIndex];
    },

    saveSetTime(state, { payload }) {
      if (typeof state.currentExercise === "undefined") return;

      state.currentExercise.totalTime = [
        ...state.currentExercise.totalTime,
        payload,
      ];
    },

    end(state) {
      state.isWorkoutPending = false;
      state.activeExerciseIndex = 0;
    },

    endAndClear(state) {
      state.workoutId = "";
      state.isWorkoutPending = false;
      state.exercises = [];

      state.total_exercises = [];

      state.skipped_exercises = [];

      (state.activeExerciseIndex = 0), (state.currentExercise = {} as any);

      state.title = "";

      state.description = "";

      state.startTime = 0;
    },
  },
});

export const workoutActions = workoutSlice.actions;
