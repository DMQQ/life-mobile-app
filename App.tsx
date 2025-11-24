import { ApolloClient, ApolloLink, ApolloProvider, createHttpLink, from, InMemoryCache } from "@apollo/client"
import { setContext } from "@apollo/client/link/context"
import * as Notifications from "expo-notifications"
import { getItemAsync } from "expo-secure-store"
import * as SplashScreen from "expo-splash-screen"
import { StatusBar } from "expo-status-bar"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"
import { Provider } from "react-redux"
import ErrorBoundary from "./components/ErrorBoundary"
import Colors from "./constants/Colors"
import Url from "./constants/Url"
import Navigation from "./navigation"
import ThemeContextProvider from "./utils/context/ThemeContext"
import { ScrollYContextProvider } from "./utils/context/ScrollYContext"
import { STORE_KEY } from "./utils/hooks/useUser"
import { store } from "./utils/redux"
import * as Sentry from "@sentry/react-native"
import { setLogVerbosity } from "@apollo/client"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"

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

if (!__DEV__)
    Sentry.init({
        dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
        sendDefaultPii: true,
    })

export default Sentry.wrap(function App() {
    return (
        <SafeAreaProvider style={{ flex: 1, backgroundColor: Colors.primary }}>
            <ErrorBoundary>
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <BottomSheetModalProvider>
                        <ThemeContextProvider>
                            <ScrollYContextProvider>
                                <ApolloProvider client={apolloClient}>
                                    <Provider store={store}>
                                        <StatusBar backgroundColor={Colors.primary} />
                                        <Navigation />
                                    </Provider>
                                </ApolloProvider>
                            </ScrollYContextProvider>
                        </ThemeContextProvider>
                    </BottomSheetModalProvider>
                </GestureHandlerRootView>
            </ErrorBoundary>
        </SafeAreaProvider>
    )
})
