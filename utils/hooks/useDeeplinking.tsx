import { RootStackParamList } from "@/types"
import { LinkingOptions, NavigationContainerRef } from "@react-navigation/native"
import * as Notifications from "expo-notifications"
import { useEffect, useMemo, useRef } from "react"
import { AppState } from "react-native"

import * as Linking from "expo-linking"

const prefix = Linking.createURL("/")

export default function useDeeplinking(navigationRef: React.RefObject<NavigationContainerRef<RootStackParamList>>) {
    const navigate = (url: string) => {
        console.log("Deeplink URL:", url)
        if (!url.startsWith("mylife") && !url.startsWith("lifeapp")) return

        if (url.includes("wallet/create-expense")) {
            navigationRef.current?.navigate<any>({
                name: "WalletScreens",
                params: {
                    expenseId: null,
                },
            })
        } else if (url.includes("wallet/expense/id/")) {
            const expenseId = url.split("/").pop()

            navigationRef.current?.navigate<any>("WalletScreens", {
                screen: "Wallet",
                params: { expenseId },
            })
        } else if (url.includes("timeline/id/")) {
            const timelineId = url.split("/").pop()

            navigationRef.current?.navigate("TimelineScreens", {
                timelineId,
            })
        } else if (url.includes("timeline")) {
            navigationRef.current?.navigate("TimelineScreens", {
                screen: "",
            })
        } else if (url.includes("activity/")) {
            // Handle Live Activity deep links
            const eventId = url.split("/").pop()
            console.log("Live Activity deep link for eventId:", eventId)
            
            // You can navigate to a specific screen or show a completion modal
            // For now, let's navigate to timeline
            navigationRef.current?.navigate("TimelineScreens", {
                screen: "",
            })
        }
    }

    const linking = useMemo(() => {
        return {
            prefixes: [prefix],

            getInitialURL: async () => {
                const url = await Linking.getInitialURL()

                if (url != null) {
                    return url
                }

                const response = Notifications.getLastNotificationResponse()

                return response?.notification.request.content.data.eventId
            },

            subscribe(listener) {
                const linkingSubscription = Linking.addEventListener("url", ({ url }) => {
                    navigate(url)

                    listener(url)
                })

                const pushNotificationSubscription = Notifications.addNotificationResponseReceivedListener(
                    (response) => {
                        const url = response.notification.request.content.data.eventId

                        listener(url as string)
                    },
                )

                return () => {
                    linkingSubscription.remove()
                    pushNotificationSubscription.remove()
                }
            },
        } as LinkingOptions<RootStackParamList>
    }, [])

    useEffect(() => {
        const initialListener = async () => {
            const initialUrl = await Linking.getInitialURL()

            if (initialUrl == null) return

            const timeout = setTimeout(() => {
                navigate(initialUrl)
            }, 100)

            return () => clearTimeout(timeout)
        }

        initialListener()
    }, [])

    return linking
}
