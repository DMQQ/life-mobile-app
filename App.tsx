import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import Navigation from "./navigation";
import { store } from "./utils/redux";
import { ApolloProvider, InMemoryCache, ApolloClient, ApolloLink, from, createHttpLink } from "@apollo/client";
import ThemeContextProvider from "./utils/context/ThemeContext";
import * as Notifications from "expo-notifications";
import Url from "./constants/Url";
import Colors from "./constants/Colors";
import { setContext } from "@apollo/client/link/context";
import { getItemAsync } from "expo-secure-store";
import { STORE_KEY } from "./utils/hooks/useUser";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
import ErrorBoundary from "./components/ErrorBoundary";

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 500,
  fade: true,
});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const withToken = setContext(async () => {
  try {
    const stored = await getItemAsync(STORE_KEY);
    const user = stored ? JSON.parse(stored) : null;
    const token = user?.token || "";

    return { token };
  } catch (error) {
    console.log("Error reading token:", error);
    return { token: "" };
  }
});

const authMiddleware = new ApolloLink((op, forw) => {
  const { token } = op.getContext();

  op.setContext(() => ({
    headers: {
      authentication: token || "",
    },
  }));
  return forw(op);
});

const httpLink = createHttpLink({
  uri: Url.API + "/graphql",
});

const link = from([withToken, authMiddleware.concat(httpLink)]);

const cache = new InMemoryCache();

const apolloClient = new ApolloClient({
  cache,
  link,
});

export default function App() {
  return (
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
  );
}
