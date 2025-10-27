import { RootStackParamList } from "@/types"
import { NavigationContainerRef } from "@react-navigation/native"
import * as Linking from "expo-linking"
import { useEffect, useRef } from "react"
import { AppState } from "react-native"

export default function useDeeplinking(navigationRef: React.RefObject<NavigationContainerRef<RootStackParamList>>) {
    const appState = useRef(AppState.currentState)
    const pendingUrl = useRef<string | null>(null)

    useEffect(() => {
        const handleDeepLink = async ({ url }: { url: string }) => {
            if (!url) return

            console.log('Deep link received:', url)

            pendingUrl.current = url

            const navigate = () => {
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
                }
                
                pendingUrl.current = null
            }

            if (AppState.currentState === 'active' && navigationRef.current?.isReady()) {
                navigate()
            } else {
                console.log('App not active, storing URL for later:', url)
            }
        }

        const handleAppStateChange = async (nextAppState: string) => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                console.log('App came to foreground')
                
                if (pendingUrl.current) {
                    console.log('Processing pending URL:', pendingUrl.current)
                    
                    setTimeout(() => {
                        if (pendingUrl.current) {
                            handleDeepLink({ url: pendingUrl.current })
                        }
                    }, 500)
                }
            }
            appState.current = nextAppState
        }

        const subscription = Linking.addEventListener("url", handleDeepLink)
        const appStateSubscription = AppState.addEventListener('change', handleAppStateChange)

        Linking.getInitialURL().then((url) => {
            if (url) {
                handleDeepLink({ url })
            }
        })

        return () => {
            subscription.remove()
            appStateSubscription.remove()
        }
    }, [])

    const linking = {
        prefixes: ["mylife://", "https://life.dmqq.dev"],
        config: {
            screens: {
                WalletScreens: "wallet",
                TimelineScreens: "timeline",
                Root: "home",
                GoalsScreens: "goals",
                NotesScreens: "notes",
                Settings: "settings",
            },
        },
    }

    return linking
}
