/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import {
  CompositeScreenProps,
  NavigatorScreenParams,
  ParamListBase,
  RouteProp,
} from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { StackNavigationProp } from "@react-navigation/stack";

export interface ScreenProps<Route extends keyof RootStackParamList> {
  navigation: StackNavigationProp<RootStackParamList, Route>;
  route: RouteProp<RootStackParamList, Route>;
}

export interface StackScreenProps<
  T extends ParamListBase,
  Route extends keyof T
> {
  navigation: StackNavigationProp<T, Route>;
  route: RouteProp<T, Route>;
}

export type RootStackParamList = {
  Loader?: undefined;

  DEFAULT: any;

  Root: undefined;

  Login: undefined;

  Register: undefined;

  WorkoutScreens: undefined;

  Landing: undefined;

  TimelineScreens: {
    timelineId?: string;
  };

  WalletScreens: undefined;

  ImagesPreview: { uri: string };

  NotesScreens: undefined;

  Settings: undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;

export interface Workout {
  workoutId: string;
  title: string;
  description: string;
  type: string;
  difficulty: string;

  exercises: Exercise[];
}

export interface Exercise {
  sets?: number;
  reps?: number;

  exerciseId: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  muscleGroup: string;
  equipment: string;
  image: string;
  tips: {
    tipId: string;
    text: string;
    image: string;
  }[];
}

export interface ExerciseProgress {
  exerciseProgressId: string;
  exerciseId: string;
  reps: number;
  weight: number;
  sets: number;
  date: string;
}

export interface Wallet {
  id: string;
  balance: number;
  expenses: Expense[];
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: string;
  balanceBeforeInteraction: number;
  category: string;
}

export interface Timeline {
  id: string;
  title: string;
  description: string;
  userId: string | null | undefined;
  date: string;
  beginTime: string;
  endTime: string;
  isCompleted: boolean;
  tags: string;

  files: IFile[];

  todos: Todos[];
}

export interface Todos {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface IFile {
  id: string;
  url: string;
  timelineId: string | undefined;
}
