import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Workout from "./Workout";
import CreateWorkout from "./WorkoutCreate";
import Workouts from "./Workouts";
import ExerciseScreen from "./Exercise";
import { WorkoutStackParamList } from "./types";
import PendingWorkout from "./PendingWorkout";
import { horizontalAnimation } from "../../../navigation/assets/screen_animations";
import Colors from "../../../constants/Colors";

const Stack = createStackNavigator<WorkoutStackParamList>();

export default function WorkoutScreens() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
        },
      }}
    >
      <Stack.Screen name="Workouts" component={Workouts} />
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
        }}
      />
    </Stack.Navigator>
  );
}
