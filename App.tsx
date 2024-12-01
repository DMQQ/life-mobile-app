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
import { LogBox } from "react-native";

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
  if (token !== undefined) return { token };

  return await getItemAsync(STORE_KEY).then((v) => {
    let user = JSON.parse(v || "{}") as { token: string } | null;

    if (token) return { token };

    if (user !== undefined && typeof user?.token === "string") token = user.token;

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

const httpLink = createHttpLink({
  uri: Url.API + "/graphql",
});

const link = from([withToken, authMiddleware.concat(httpLink)]);

const cache = new InMemoryCache({
  // typePolicies: {
  //   WalletEntity: {
  //     keyFields: ["id"], // Ensure it uses 'id' as the unique key
  //     fields: {
  //       expenses: {
  //         merge(existing = [], incoming) {
  //           return [...existing, ...incoming];
  //         },
  //       },
  //     },
  //   },
  //   ExpenseEntity: {
  //     keyFields: ["id"],
  //   },
  // },
});

const apolloClient = new ApolloClient({
  cache,
  link,
});

LogBox.ignoreLogs([
  "[Reanimated] Reading from `value` during component render. Please ensure that you do not access the `value` property or use `get` method of a shared value while React is rendering a component.",
]);

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeContextProvider>
        <ApolloProvider client={apolloClient}>
          <SafeAreaView style={{ flex: 1, backgroundColor: Colors.primary }}>
            <Provider store={store}>
              <StatusBar backgroundColor={Colors.primary} />
              <Navigation />
            </Provider>
          </SafeAreaView>
        </ApolloProvider>
      </ThemeContextProvider>
    </GestureHandlerRootView>
  );
}
