import { ApolloClient, ApolloLink, ApolloProvider, createHttpLink, from, InMemoryCache } from "@apollo/client"
import { setContext } from "@apollo/client/link/context"
import * as Notifications from "expo-notifications"
import { getItemAsync } from "expo-secure-store"
import * as SplashScreen from "expo-splash-screen"
import * as SystemUI from "expo-system-ui"
import { StatusBar } from "expo-status-bar"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Provider } from "react-redux"
import ErrorBoundary from "@/components/ErrorBoundary"
import Colors from "@/constants/Colors"
import Url from "@/constants/Url"
import ThemeContextProvider from "@/utils/context/ThemeContext"
import { ScrollYContextProvider } from "@/utils/context/ScrollYContext"
import { STORE_KEY } from "@/utils/hooks/useUser"
import { store } from "@/utils/redux"
import { setLogVerbosity } from "@apollo/client"
import * as Sentry from "@sentry/react-native"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { SearchMenuProvider } from "@/contexts/SearchMenuContext"
import { AiChatProvider } from "@/contexts/AiChatContext"
import GlobalAiChat from "@/features/ai/GlobalAiChat"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { Stack } from "expo-router"
import { DarkTheme, ThemeProvider } from "@react-navigation/native"

Sentry.init({
    enableNative: true,
    attachScreenshot: true,
    enableAutoPerformanceTracing: true,
    attachViewHierarchy: true,
})

setLogVerbosity("error")

const AppTheme = {
    ...DarkTheme,
    colors: { ...DarkTheme.colors, background: Colors.primary, card: Colors.primary },
}

SystemUI.setBackgroundColorAsync(Colors.primary)

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
    } catch {
        return { token: "" }
    }
})

const authMiddleware = new ApolloLink((op, forw) => {
    const { token } = op.getContext()
    op.setContext(() => ({
        headers: { authentication: token || "" },
    }))
    return forw(op)
})

const httpLink = createHttpLink({ uri: Url.API + "/graphql" })
const link = from([withToken, authMiddleware.concat(httpLink)])
const cache = new InMemoryCache()
const apolloClient = new ApolloClient({ cache, link })

export default Sentry.wrap(function RootLayout() {
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
                                                    <StatusBar style="light" />
                                                    <ThemeProvider value={AppTheme}>
                                                    <Stack
                                                        screenOptions={{
                                                            headerShown: false,
                                                            contentStyle: { backgroundColor: Colors.primary },
                                                        }}
                                                    >
                                                        <Stack.Screen name="index" />
                                                        <Stack.Screen name="(tabs)" />
                                                        <Stack.Screen name="(auth)" />
                                                        {/*<Stack.Screen name="workout" />
                                                        <Stack.Screen name="flashcards" />*/}
                                                    </Stack>
                                                    </ThemeProvider>
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
})
