import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Workout from "./pages/Workout";
import CreateWorkout from "./pages/WorkoutCreate";
import Workouts from "./pages/Workouts";
import ExerciseScreen from "./pages/Exercise";
import { WorkoutStackParamList } from "./types";
import PendingWorkout from "./pages/PendingWorkout";
import Colors from "../../../constants/Colors";
import WorkoutSummary from "./pages/WorkoutSummary";
import { fadeInFromBottomAndScaleUp } from "../../../navigation/assets/screen_animations";

const Stack = createStackNavigator<WorkoutStackParamList>();

export default function WorkoutScreens() {
  return (
    <Stack.Navigator
      initialRouteName="Workouts"
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
      <Stack.Screen
        name="WorkoutCreate"
        component={CreateWorkout}
        options={{
          title: "Create workout",
          headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        initialParams={{
          delayTimerStart: 0,
          workoutId: "",
        }}
        name="PendingWorkout"
        component={PendingWorkout}
        options={{
          presentation: "modal",
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
