import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Workout from "./views/Workout";
import CreateWorkout from "./views/WorkoutCreate";
import Workouts from "./views/Workouts";
import ExerciseScreen from "./views/Exercise";
import { WorkoutStackParamList } from "./types";
import PendingWorkout from "./views/PendingWorkout";
import { horizontalAnimation } from "../../../navigation/assets/screen_animations";
import Colors from "../../../constants/Colors";
import WorkoutSummary from "./views/WorkoutSummary";
import { useAppSelector } from "../../../utils/redux";

const Stack = createStackNavigator<WorkoutStackParamList>();

export default function WorkoutScreens() {
  const workout = useAppSelector((s) => s.workout);
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
        },
      }}
    >
      <Stack.Screen
        name="Workouts"
        component={Workouts}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Workout" component={Workout} />
      <Stack.Screen name="Exercise" component={ExerciseScreen} />
      <Stack.Screen name="WorkoutCreate" component={CreateWorkout} />
      <Stack.Screen
        initialParams={{
          delayTimerStart: 0,
          workoutId: "",
        }}
        name="PendingWorkout"
        component={PendingWorkout}
        options={{
          presentation: "modal",
          ...horizontalAnimation,
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="WorkoutSummary"
        component={WorkoutSummary}
        options={{
          headerTitle: "Summary",
        }}
      />
    </Stack.Navigator>
  );
}
