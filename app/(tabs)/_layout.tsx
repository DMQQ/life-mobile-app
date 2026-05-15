import { Tabs } from "expo-router"
import { Redirect } from "expo-router"
import useUser from "@/utils/hooks/useUser"
import Colors from "@/constants/Colors"
import BottomTab from "@/components/BottomTab/BottomTab"

export default function TabsLayout() {
    const { isAuthenticated, isLoading } = useUser()

    if (isLoading) return null
    if (!isAuthenticated) return <Redirect href="/(auth)/landing" />

    return (
        <Tabs
            tabBar={(props) => <BottomTab {...props} />}
            screenOptions={{
                headerShown: false,
                headerStyle: { backgroundColor: Colors.primary },
                lazy: false,
            }}
        >
            <Tabs.Screen name="home" />
            <Tabs.Screen name="goals" />
            <Tabs.Screen name="wallet" />
            <Tabs.Screen name="timeline" />
        </Tabs>
    )
}
