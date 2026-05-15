import { Stack } from "expo-router"
import Colors from "@/constants/Colors"
import RefreshContextProvider from "@/utils/context/RefreshContext"

export default function HomeLayout() {
    return (
        <RefreshContextProvider>
            <Stack screenOptions={{ headerShown: false, animation: "default", contentStyle: { backgroundColor: Colors.primary } }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="notifications" options={{ presentation: "modal", headerShown: false }} />
                <Stack.Screen name="settings" options={{ presentation: "modal", headerShown: false }} />
            </Stack>
        </RefreshContextProvider>
    )
}
