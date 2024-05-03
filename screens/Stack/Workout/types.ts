import { ParamListBase } from "@react-navigation/native";
import { Exercise, StackScreenProps } from "../../../types";

export interface WorkoutStackParamList extends ParamListBase {
  Exercise: { exerciseId: string };
  Workouts: undefined;
  Workout: { workoutId: string };
  WorkoutCreate: undefined;
  PendingWorkout: {
    workoutId: string;
    delayTimerStart?: number;
    exerciseId: string;
  };
  WorkoutSummary?: { workoutId?: string };
}

export type WorkoutScreenProps<T extends keyof WorkoutStackParamList> =
  StackScreenProps<WorkoutStackParamList, T>;
