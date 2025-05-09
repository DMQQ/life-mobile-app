import { CommonActions, DarkTheme, NavigationContainer, NavigationContainerRef } from "@react-navigation/native";
import useUser from "../utils/hooks/useUser";
import React, { useCallback, useEffect } from "react";
import Root from "../screens/home/Root";
import { RootStackParamList } from "../types";
import Colors from "../constants/Colors";
import useNotifications from "../utils/hooks/useNotifications";
import TimelineScreens from "../screens/timeline/Main";
import { BottomTabBarProps, createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import BottomTab from "../components/BottomTab/BottomTab";
import WalletScreens from "../screens/wallet/Main";
import Settings from "../screens/settings/Settings";
import Authentication from "../screens/authentication/Main";
import * as QuickActions from "expo-quick-actions";
import GoalsScreens from "../screens/goals/Main";
import { useApolloClient } from "@apollo/client";
import { Platform } from "react-native";
import moment from "moment";
import * as Linking from "expo-linking";

export const navigationRef = React.createRef<NavigationContainerRef<RootStackParamList>>();

const Tab = createBottomTabNavigator<RootStackParamList>();

export default function Navigation() {
  const { isAuthenticated, loadUser, isLoading, token, removeUser } = useUser();
  const client = useApolloClient();
  const { sendTokenToServer } = useNotifications(navigationRef);

  useEffect(() => {
    loadUser();
  }, []);

  const handleQuickAction = (action: QuickActions.Action) => {
    setTimeout(() => {
      if (!action || !navigationRef.current) return;

      switch (action?.id) {
        case "0":
          navigationRef.current?.navigate<any>({
            name: "WalletScreens",
            params: {
              expenseId: null,
            },
          });
          break;
        case "1":
          navigationRef.current.navigate({
            name: "TimelineScreens",
            params: {
              selectedDate: moment(new Date()).format("YYYY-MM-DD"),
            },
          });
          break;
        case "2":
          navigationRef.current.navigate<any>({
            name: "GoalsScreens",
            params: {
              selectedDate: moment(new Date()).format("YYYY-MM-DD"),
            },
          });
          break;
        default:
          break;
      }
    }, 300);
  };

  useEffect(() => {
    const quickActions = async () => {
      const initial = QuickActions.initial;

      if (initial) {
        handleQuickAction(initial);
      }

      QuickActions.addListener(handleQuickAction);

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
      ]);
    };

    quickActions();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      sendTokenToServer().catch(async (err) => {
        const cause = err?.cause;

        if (cause?.extensions?.response?.statusCode === 403) {
          await client.resetStore();
          await removeUser();
        }
      });
    }
  }, [isAuthenticated]);

  const renderTab = useCallback((props: BottomTabBarProps) => (isAuthenticated ? <BottomTab {...props} /> : null), [isAuthenticated]);

  useEffect(() => {
    const handleDeepLink = async ({ url }: { url: string }) => {
      if (!url) return;

      console.log("Received URL:", url);

      setTimeout(() => {
        if (url.includes("wallet/create-expense")) {
          navigationRef.current?.navigate<any>({
            name: "WalletScreens",
            params: {
              expenseId: null,
            },
          });
        } else if (url.includes("wallet/expense/id/")) {
          const expenseId = url.split("/").pop();

          navigationRef.current?.navigate<any>("WalletScreens", {
            screen: "Wallet",
            params: { expenseId },
          });
        } else if (url.includes("timeline/id/")) {
          const timelineId = url.split("/").pop();

          navigationRef.current?.navigate("TimelineScreens", {
            timelineId,
          });
        } else if (url.includes("timeline")) {
          navigationRef.current?.navigate("TimelineScreens", {
            screen: "",
          });
        }
      }, 300);
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

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
  };

  if (isLoading) return null;

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
      theme={{
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: Colors.primary,
        },
      }}
    >
      <Tab.Navigator
        initialRouteName={isLoading ? "Loader" : "Root"}
        tabBar={renderTab}
        screenOptions={{
          headerShown: false,
          headerStyle: {
            backgroundColor: Colors.primary,
          },
        }}
      >
        {isAuthenticated ? (
          <>
            <Tab.Screen name="Root" component={Root} />

            <Tab.Screen name="GoalsScreens" component={GoalsScreens} />

            <Tab.Screen name="WalletScreens" component={WalletScreens as any} />

            <Tab.Screen name="TimelineScreens" component={TimelineScreens} />

            <Tab.Screen name="Settings" component={Settings} />
          </>
        ) : (
          <>
            <Tab.Screen name="Authentication" component={Authentication} />
          </>
        )}
      </Tab.Navigator>
    </NavigationContainer>
  );
}
