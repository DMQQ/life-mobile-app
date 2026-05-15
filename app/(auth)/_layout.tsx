import { Stack } from "expo-router"
import Colors from "@/constants/Colors"

export default function AuthLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: Colors.primary },
                contentStyle: { backgroundColor: Colors.primary },
                animation: "default",
            }}
        >
            <Stack.Screen name="landing" options={{ headerShown: false }} />
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
        </Stack>
    )
}
