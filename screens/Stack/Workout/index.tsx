import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Workout from "./screens/Workout";
import CreateWorkout from "./screens/WorkoutCreate";
import Workouts from "./screens/Workouts";
import ExerciseScreen from "./screens/Exercise";
import { WorkoutStackParamList } from "./types";
import PendingWorkout from "./screens/PendingWorkout";
import Colors from "../../../constants/Colors";
import WorkoutSummary from "./screens/WorkoutSummary";
import { fadeInFromBottomAndScaleUp } from "../../../navigation/assets/screen_animations";

const Stack = createStackNavigator<WorkoutStackParamList>();

export default function WorkoutScreens() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        ...fadeInFromBottomAndScaleUp,
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
          //  ...horizontalAnimation,
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
