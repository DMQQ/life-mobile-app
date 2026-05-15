import { Redirect } from "expo-router"
import { useEffect } from "react"
import { useApolloClient } from "@apollo/client"
import useUser from "@/utils/hooks/useUser"
import useNotifications from "@/utils/hooks/useNotifications"
import useQuickActions from "@/utils/hooks/useQuickActions"
import { useActivityManager } from "@/utils/hooks/useActivityManager"
import useWidgets from "@/utils/widget/hooks/useWidgets"

export default function Index() {
    const { isAuthenticated, loadUser, isLoading, removeUser } = useUser()
    const client = useApolloClient()
    const { sendTokenToServer } = useNotifications()

    useQuickActions()
    useActivityManager()
    useWidgets()

    useEffect(() => { loadUser() }, [])

    useEffect(() => {
        if (isAuthenticated) {
            sendTokenToServer().catch(async (err) => {
                const cause = err?.cause
                if (cause?.extensions?.response?.statusCode === 403) {
                    await client.resetStore()
                    await removeUser()
                }
            })
        }
    }, [isAuthenticated])

    if (isLoading) return null

    if (!isAuthenticated) return <Redirect href="/(auth)/landing" />

    return <Redirect href="/(tabs)/home" />
}
