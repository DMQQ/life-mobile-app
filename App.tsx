import { ApolloClient, ApolloLink, ApolloProvider, createHttpLink, from, InMemoryCache } from "@apollo/client"
import { setContext } from "@apollo/client/link/context"
import * as Notifications from "expo-notifications"
import { getItemAsync } from "expo-secure-store"
import * as SplashScreen from "expo-splash-screen"
import { StatusBar } from "expo-status-bar"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { MD3DarkTheme, ThemeProvider as PaperThemeProvider } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"
import { Provider } from "react-redux"
import ErrorBoundary from "./components/ErrorBoundary"
import Colors from "./constants/Colors"
import Url from "./constants/Url"
import Navigation from "./navigation"
import ThemeContextProvider from "./utils/context/ThemeContext"
import { STORE_KEY } from "./utils/hooks/useUser"
import { store } from "./utils/redux"

const Md3ThemeExtended = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        primary: Colors.primary,
        primaryContainer: Colors.primary_light,
        secondary: Colors.secondary,
        secondaryContainer: Colors.secondary_light_1,
        tertiary: Colors.ternary,
        tertiaryContainer: Colors.ternary_light_1,
        surface: Colors.primary_dark,
        surfaceVariant: Colors.primary_darker,
        background: Colors.primary,
        error: Colors.error,
        onPrimary: Colors.text_light,
        onSecondary: Colors.text_light,
        onTertiary: Colors.text_light,
        onSurface: Colors.text_light,
        onBackground: Colors.text_light,
        onError: Colors.text_light,
        outline: Colors.primary_lighter,
        outlineVariant: Colors.primary_light,
    },
}

SplashScreen.preventAutoHideAsync()

SplashScreen.setOptions({
    duration: 500,
    fade: true,
})

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
})

const withToken = setContext(async () => {
    try {
        const stored = await getItemAsync(STORE_KEY)
        const user = stored ? JSON.parse(stored) : null
        const token = user?.token || ""

        return { token }
    } catch (error) {
        console.log("Error reading token:", error)
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

export default function App() {
    return (
        <PaperThemeProvider theme={Md3ThemeExtended}>
            <SafeAreaView style={{ flex: 1, backgroundColor: Colors.primary }}>
                <ErrorBoundary>
                    <GestureHandlerRootView style={{ flex: 1 }}>
                        <ThemeContextProvider>
                            <ApolloProvider client={apolloClient}>
                                <Provider store={store}>
                                    <StatusBar backgroundColor={Colors.primary} />
                                    <Navigation />
                                </Provider>
                            </ApolloProvider>
                        </ThemeContextProvider>
                    </GestureHandlerRootView>
                </ErrorBoundary>
            </SafeAreaView>
        </PaperThemeProvider>
    )
}
