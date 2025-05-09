import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Workout from "./pages/Workout";
import CreateWorkout from "./pages/WorkoutCreate";
import Workouts from "./pages/Workouts";
import CreateExercise from "./pages/CreateExercise";
import { WorkoutStackParamList } from "./types";
import PendingWorkout from "./pages/PendingWorkout";
import Colors from "@/constants/Colors";
import WorkoutSummary from "./pages/WorkoutSummary";

const Stack = createNativeStackNavigator<WorkoutStackParamList>();

export default function WorkoutScreens() {
  return (
    <Stack.Navigator
      initialRouteName="Workouts"
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        animation: "default",
      }}
    >
      <Stack.Screen name="Workouts" component={Workouts} options={{ headerShown: false }} />
      <Stack.Screen name="Workout" component={Workout} />
      <Stack.Screen name="Exercise" component={CreateExercise} />
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
