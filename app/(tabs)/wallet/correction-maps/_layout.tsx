import { Stack } from "expo-router"
import Colors from "@/constants/Colors"

export default function CorrectionMapsLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: Colors.primary },
                contentStyle: { backgroundColor: Colors.primary },
            }}
        >
            <Stack.Screen name="index" options={{ title: "Correction maps" }} />
            <Stack.Screen name="create" options={{ headerBackTitle: "List" }} />
        </Stack>
    )
}
