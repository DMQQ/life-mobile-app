import {
    ApolloClient,
    ApolloLink,
    ApolloProvider,
    createHttpLink,
    from,
    InMemoryCache,
    useApolloClient,
} from "@apollo/client"
import { setContext } from "@apollo/client/link/context"
import * as Notifications from "expo-notifications"
import { getItemAsync } from "expo-secure-store"
import * as SplashScreen from "expo-splash-screen"
import { StatusBar } from "expo-status-bar"
import { useEffect } from "react"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Provider } from "react-redux"
import ErrorBoundary from "./components/ErrorBoundary"
import Colors from "./constants/Colors"
import Url from "./constants/Url"
import Navigation, { navigationRef } from "./navigation"
import ThemeContextProvider from "./utils/context/ThemeContext"
import { ScrollYContextProvider } from "./utils/context/ScrollYContext"
import useDeeplinking from "./utils/hooks/useDeeplinking"
import useNotifications from "./utils/hooks/useNotifications"
import useQuickActions from "./utils/hooks/useQuickActions"
import useUser, { STORE_KEY } from "./utils/hooks/useUser"
import { useActivityManager } from "./utils/hooks/useActivityManager"
import { store } from "./utils/redux"
import useWidgets from "./utils/widget/hooks/useWidgets"
import { setLogVerbosity } from "@apollo/client"
import * as Sentry from "@sentry/react-native"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { SearchMenuProvider } from "./contexts/SearchMenuContext"
import { AiChatProvider } from "./contexts/AiChatContext"
import { KeyboardProvider } from "react-native-keyboard-controller"

Sentry.init({
    enableNative: true,
    attachScreenshot: true,
    enableAutoPerformanceTracing: true,
    attachViewHierarchy: true,
})

setLogVerbosity("error")

SplashScreen.preventAutoHideAsync()

SplashScreen.setOptions({
    duration: 500,
    fade: true,
})

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
    }),
})

const withToken = setContext(async () => {
    try {
        const stored = await getItemAsync(STORE_KEY)
        const user = stored ? JSON.parse(stored) : null
        const token = user?.token || ""

        return { token }
    } catch (error) {
        return { token: "" }
    }
})

const authMiddleware = new ApolloLink((op, forw) => {
    const { token } = op.getContext()

    op.setContext(() => ({
        headers: {
            authentication: token || "",
        },
    }))
    return forw(op)
})

const httpLink = createHttpLink({
    uri: Url.API + "/graphql",
})

const link = from([withToken, authMiddleware.concat(httpLink)])

const cache = new InMemoryCache()

const apolloClient = new ApolloClient({
    cache,
    link,
})

function AppContent() {
    const { isAuthenticated, loadUser, isLoading, removeUser } = useUser()
    const client = useApolloClient()
    const { sendTokenToServer } = useNotifications(navigationRef as any)

    useQuickActions(navigationRef as any)
    useActivityManager()
    useWidgets()

    useEffect(() => {
        loadUser()
    }, [])

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

    const linking = useDeeplinking(navigationRef as any)

    return (
        <>
            <StatusBar />
            <Navigation isAuthenticated={isAuthenticated} isLoading={isLoading} linking={linking} />
        </>
    )
}

function App() {
    return (
        <SafeAreaProvider style={{ flex: 1, backgroundColor: Colors.primary }}>
            <ErrorBoundary>
                <KeyboardProvider>
                    <GestureHandlerRootView style={{ flex: 1 }}>
                        <BottomSheetModalProvider>
                            <ThemeContextProvider>
                                <ScrollYContextProvider>
                                    <SearchMenuProvider>
                                        <ApolloProvider client={apolloClient}>
                                            <Provider store={store}>
                                                <AiChatProvider>
                                                    <AppContent />
                                                </AiChatProvider>
                                            </Provider>
                                        </ApolloProvider>
                                    </SearchMenuProvider>
                                </ScrollYContextProvider>
                            </ThemeContextProvider>
                        </BottomSheetModalProvider>
                    </GestureHandlerRootView>
                </KeyboardProvider>
            </ErrorBoundary>
        </SafeAreaProvider>
    )
}

export default Sentry.wrap(App)
