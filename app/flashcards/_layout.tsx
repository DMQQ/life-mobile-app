import { Stack } from "expo-router"
import Colors from "@/constants/Colors"

export default function FlashcardsLayout() {
    return (
        <Stack screenOptions={{ animation: "default", contentStyle: { backgroundColor: Colors.primary } }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen
                name="create"
                options={{ headerStyle: { backgroundColor: Colors.primary }, presentation: "modal" }}
            />
            <Stack.Screen
                name="[id]"
                options={{ headerStyle: { backgroundColor: Colors.primary }, headerShown: false }}
            />
            <Stack.Screen
                name="swipe"
                options={{
                    headerStyle: { backgroundColor: Colors.primary },
                    headerShown: false,
                    presentation: "fullScreenModal",
                }}
            />
            <Stack.Screen
                name="create-group"
                options={{ headerStyle: { backgroundColor: Colors.primary }, presentation: "modal" }}
            />
        </Stack>
    )
}
