import { Stack } from "expo-router"
import Colors from "@/constants/Colors"

export default function WorkoutLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: Colors.primary },
                contentStyle: { backgroundColor: Colors.primary },
                animation: "default",
            }}
        >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="[id]" />
            <Stack.Screen name="create" options={{ title: "Create workout", headerTitleAlign: "center" }} />
            <Stack.Screen name="exercise/[id]" />
            <Stack.Screen
                name="pending/[id]"
                options={{ presentation: "modal", headerShown: false }}
                initialParams={{ delayTimerStart: 0, workoutId: "" }}
            />
            <Stack.Screen name="summary/[id]" options={{ headerTitle: "Summary" }} />
        </Stack>
    )
}
