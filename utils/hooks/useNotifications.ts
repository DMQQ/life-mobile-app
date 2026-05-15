import * as Notifications from "expo-notifications"
import { Platform, ToastAndroid } from "react-native"
import { gql, useMutation } from "@apollo/client"
import Constants from "expo-constants"
import { useEffect, useRef, useState } from "react"
import { router } from "expo-router"

const CREATE_NOTIFICATION = gql`
    mutation createNotification($input: SetNotificationsTokenInput!) {
        setNotificationsToken(input: $input)
    }
`

export default function useNotifications() {
    const [notificationToken, setNotificationToken] = useState<string | null>(null)
    const notificationListener = useRef<any>(null)
    const responseListener = useRef<any>(null)
    const lastNotification = Notifications.useLastNotificationResponse()
    const [createNotificationToken] = useMutation(CREATE_NOTIFICATION)

    const handleNotificationNavigation = (data: any) => {
        const { eventId, type } = data || {}

        if (eventId && type === "timeline") {
            router.push(`/(tabs)/timeline/${eventId}`)
        } else if (Array.isArray(eventId) && type === "timeline_missed") {
            router.push({ pathname: "/(tabs)/timeline/missed-events", params: { eventIds: eventId.join(",") } })
        } else if (type === "expenseReminder") {
            router.push("/(tabs)/wallet/create-expense")
        } else if (eventId) {
            router.push(`/(tabs)/timeline/${eventId}`)
        }
    }

    async function registerForPushNotificationsAsync() {
        let token

        if (Platform.OS === "android") {
            await Notifications.setNotificationChannelAsync("default", {
                name: "default",
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: "#FF231F7C",
            })
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync()
        let finalStatus = existingStatus

        if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync()
            finalStatus = status
        }

        if (finalStatus !== "granted") {
            console.warn("Push notification permission not granted")
            return null
        }

        token = await Notifications.getExpoPushTokenAsync({
            projectId: Constants?.expoConfig?.extra?.eas?.projectId || "5596a83c-661a-4477-806f-ee4c8a125f7e",
        })

        return token.data
    }

    async function sendTokenToServer() {
        try {
            const token = await registerForPushNotificationsAsync()
            if (token) {
                await createNotificationToken({ variables: { input: { token } } })
                setNotificationToken(token)
            }
        } catch (error) {
            ToastAndroid.show("Notifications disabled: Couldn't upload token", ToastAndroid.SHORT)
            throw error
        }
    }

    useEffect(() => {
        let timeeout: ReturnType<typeof setTimeout>
        notificationListener.current = Notifications.addNotificationReceivedListener((_notification: any) => {
            // Notification received in foreground
        })

        responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
            const data = response.notification.request.content.data

            timeeout = setTimeout(() => {
                handleNotificationNavigation(data)
            }, 100)
        })

        return () => {
            notificationListener.current?.remove()
            responseListener.current?.remove()
            if (timeeout) {
                clearTimeout(timeeout)
            }
        }
    }, [])

    useEffect(() => {
        if (
            lastNotification?.notification?.request?.content?.data &&
            lastNotification?.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER
        ) {
            const data = lastNotification.notification.request.content.data

            let timeout = setTimeout(() => {
                handleNotificationNavigation(data)
            }, 100)

            return () => {
                clearTimeout(timeout)
            }
        }
    }, [lastNotification])

    return {
        getNotificationToken: registerForPushNotificationsAsync,
        sendTokenToServer,
        notificationToken,
    }
}
