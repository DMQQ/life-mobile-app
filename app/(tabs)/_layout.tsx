import { Redirect, useSegments } from "expo-router"
import { NativeTabs } from "expo-router/unstable-native-tabs"
import useUser from "@/utils/hooks/useUser"
import Colors from "@/constants/Colors"
import Color from "color"

export default function TabsLayout() {
    const { isAuthenticated, isLoading } = useUser()
    const segments = useSegments()
    const isNested = segments.length > 2

    if (isLoading) return null
    if (!isAuthenticated) return <Redirect href="/(auth)/landing" />

    return (
        <NativeTabs
            hidden={isNested}
            backgroundColor={Color(Colors.primary).alpha(0.75).hex()}
            iconColor={Colors.secondary}
            indicatorColor={Colors.secondary}
        >
            <NativeTabs.Trigger name="home">
                <NativeTabs.Trigger.Icon sf="house" />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="goals">
                <NativeTabs.Trigger.Icon sf="target" />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="wallet">
                <NativeTabs.Trigger.Icon sf="dollarsign" />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="timeline">
                <NativeTabs.Trigger.Icon sf="calendar" />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="chat">
                <NativeTabs.Trigger.Icon sf={"sparkle"} />
            </NativeTabs.Trigger>
        </NativeTabs>
    )
}
