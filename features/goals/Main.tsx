import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Goals from "./pages/Goals";
import CreateGoal from "./pages/CreateGoal";
import IconPicker from "./pages/IconPicker";
import Goal from "./pages/Goal";
import UpdateGoalEntry from "./pages/UpdateGoalEntry";

const Stack = createNativeStackNavigator();

export default function Main() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Goals" component={Goals} />
      <Stack.Screen name="CreateGoal" component={CreateGoal} options={{ title: "Create Goal", presentation: "modal" }} />
      <Stack.Screen name="Goal" component={Goal} options={{ title: "Goal" }} />
      <Stack.Screen name="UpdateGoalEntry" component={UpdateGoalEntry} options={{ title: "Update Goal Entry", presentation: "modal" }} />
      <Stack.Screen
        name="IconPicker"
        component={IconPicker}
        options={{
          title: "Icon Picker",
          presentation: "modal",
        }}
      />
    </Stack.Navigator>
  );
}
