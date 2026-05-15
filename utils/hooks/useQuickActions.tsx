import * as QuickActions from "expo-quick-actions"
import moment from "moment"
import { useEffect } from "react"
import { Platform } from "react-native"
import { router } from "expo-router"

export default function useQuickActions() {
    const setupQuickActions = () => {
        const initial = QuickActions.initial

        if (initial) {
            handleQuickAction(initial)
        }

        const listener = QuickActions.addListener(handleQuickAction)

        QuickActions.setItems([
            {
                title: "Wallet",
                subtitle: "Create expense or income",
                icon: Platform.OS === "ios" ? "symbol:plus.circle" : undefined,
                id: "0",
            },
            {
                title: "Timeline",
                subtitle: "Create a new entry",
                icon: Platform.OS === "ios" ? "symbol:plus.circle" : undefined,
                id: "1",
            },
            {
                title: "Goals",
                subtitle: "Create a new goal",
                icon: Platform.OS === "ios" ? "symbol:plus.circle" : undefined,
                id: "2",
            },
        ])

        return listener
    }

    const handleQuickAction = (action: QuickActions.Action) => {
        setTimeout(() => {
            if (!action) return

            switch (action?.id) {
                case "0":
                    router.push("/(tabs)/wallet/create-expense")
                    break
                case "1":
                    router.push({
                        pathname: "/(tabs)/timeline/create",
                        params: { selectedDate: moment(new Date()).format("YYYY-MM-DD"), mode: "create" },
                    })
                    break
                case "2":
                    router.push({
                        pathname: "/(tabs)/goals/create",
                        params: { selectedDate: moment(new Date()).format("YYYY-MM-DD") },
                    })
                    break
                default:
                    break
            }
        }, 300)
    }

    useEffect(() => {
        const listener = setupQuickActions()

        return () => listener.remove()
    }, [])
}
