import { Stack } from "expo-router"
import Colors from "@/constants/Colors"

export default function ChatLayout() {
    return (
        <Stack screenOptions={{ headerShown: false, animation: "default", contentStyle: { backgroundColor: Colors.primary } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="ai" />
        </Stack>
    )
}
