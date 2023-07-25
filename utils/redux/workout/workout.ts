import { createSlice } from "@reduxjs/toolkit";
import { Exercise } from "../../../types";

export const workoutSlice = createSlice({
  name: "workout",
  initialState: {
    workoutId: "",

    isWorkoutPending: false,
    exercises: [] as (Exercise & { isSkipped: boolean; isFinished: boolean })[],

    activeExerciseIndex: 0,
    currentExercise: {} as Exercise,

    selectedExercise: {} as Exercise,

    title: "",

    description: "",

    options: {
      rest: 120, // 2 min
      prepareTime: 2, // 2s
    },
  },
  reducers: {
    start(
      state,
      {
        payload,
      }: {
        payload: {
          workoutId: string;
          exercises: Exercise[];
          title: string;
          description: string;
        };
      }
    ) {
      state.workoutId = payload.workoutId;
      state.activeExerciseIndex = 0;
      state.isWorkoutPending = true;
      state.exercises = payload.exercises.map((ex) => ({
        ...ex,
        isSkipped: false,
        isFinished: false,
      }));

      state.title = payload.title;
      state.description = payload.description;

      state.currentExercise = state.exercises[state.activeExerciseIndex];
    },

    next(state, { payload }: { payload: { skip?: boolean } }) {
      console.log(state.activeExerciseIndex);

      if (state.activeExerciseIndex + 1 > state.exercises.length) {
        state.isWorkoutPending = false;
        return;
      }
      if (payload.skip === undefined) payload.skip = false;

      let temp = [...state.exercises];

      temp[state.activeExerciseIndex] = {
        ...state.exercises[state.activeExerciseIndex],
        isFinished: !payload.skip,
        isSkipped: payload.skip,
      };

      state.activeExerciseIndex += 1;

      if (!payload.skip)
        state.currentExercise = state.exercises[state.activeExerciseIndex];
    },

    end(state) {
      state.isWorkoutPending = false;
      state.activeExerciseIndex = 0;
    },
  },
});

export const workoutActions = workoutSlice.actions;
