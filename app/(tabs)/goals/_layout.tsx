import { Stack } from "expo-router"
import Colors from "@/constants/Colors"

export default function GoalsLayout() {
    return (
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.primary } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="create" options={{ title: "Create Goal", presentation: "modal" }} />
            <Stack.Screen name="[id]" options={{ headerShown: false }} />
            <Stack.Screen name="[id]/update-entry" options={{ title: "Update Goal Entry", presentation: "modal" }} />
            <Stack.Screen name="icon-picker" options={{ title: "Icon Picker", presentation: "modal" }} />
        </Stack>
    )
}
