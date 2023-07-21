import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import useCachedResources from "./hooks/useCachedResources";
import Navigation from "./navigation";
import { store } from "./utils/redux";
import { ApolloProvider, InMemoryCache, ApolloClient } from "@apollo/client";
import ThemeContextProvider from "./utils/context/ThemeContext";

import * as Notifications from "expo-notifications";
import Url from "./constants/Url";
import Colors from "./constants/Colors";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const dev = true;

const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  uri: Url.API + "/graphql",

  defaultOptions: {
    mutate: {
      context: {
        headers: {
          token: store.getState().user.token,
        },
      },
    },
    query: {
      context: {
        headers: {
          token: store.getState().user.token,
        },
      },
    },
  },
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
