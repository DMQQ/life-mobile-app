import { Stack } from "expo-router"
import Colors from "@/constants/Colors"

export default function SpendingLimitsLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: Colors.primary },
                headerTintColor: Colors.foreground,
                contentStyle: { backgroundColor: Colors.primary },
            }}
        >
            <Stack.Screen name="index" options={{ title: "Spending Limits" }} />
            <Stack.Screen name="create" options={{ title: "Create limit", headerBackTitle: "Limit" }} />
        </Stack>
    )
}
