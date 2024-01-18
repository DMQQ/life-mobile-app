import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import useCachedResources from "./hooks/useCachedResources";
import Navigation from "./navigation";
import { store } from "./utils/redux";
import {
  ApolloProvider,
  InMemoryCache,
  ApolloClient,
  ApolloLink,
  from,
  createHttpLink,
} from "@apollo/client";
import ThemeContextProvider from "./utils/context/ThemeContext";
import * as Notifications from "expo-notifications";
import Url from "./constants/Url";
import Colors from "./constants/Colors";

import { onError } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";
import { getItemAsync, deleteItemAsync } from "expo-secure-store";
import { STORE_KEY } from "./utils/hooks/useUser";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

let token: string | undefined;

const withToken = setContext(async () => {
  // if you have a cached value, return it immediately
  if (token) return { token };

  return await getItemAsync(STORE_KEY).then((v) => {
    let user = JSON.parse(v || "{}") as { token: string } | null;

    if (token) return { token };

    if (user !== undefined && typeof user?.token === "string")
      token = user.token;

    return { token };
  });
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

const resetToken = onError(({ networkError, graphQLErrors, response }) => {
  if (
    (networkError && networkError?.statusCode === 401) ||
    graphQLErrors?.[0].extensions.response.statusCode === 403 ||
    response?.errors?.[0].message === "Forbidden resource"
  ) {
    token = undefined;
    deleteItemAsync(STORE_KEY);
  }
});

const httpLink = createHttpLink({
  uri: Url.API + "/graphql",
});

const link = from([
  withToken.concat(resetToken),
  authMiddleware.concat(httpLink),
]);

const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link,
});

export default function App() {
  const isLoadingComplete = useCachedResources();

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <ThemeContextProvider>
        <ApolloProvider client={apolloClient}>
          <SafeAreaView style={{ flex: 1, backgroundColor: Colors.primary }}>
            <Provider store={store}>
              <StatusBar translucent />
              <Navigation />
            </Provider>
          </SafeAreaView>
        </ApolloProvider>
      </ThemeContextProvider>
    );
  }
}
