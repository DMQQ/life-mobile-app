import { CommonActions, DarkTheme, NavigationContainer, NavigationContainerRef } from "@react-navigation/native";
import useUser from "../utils/hooks/useUser";
import React, { useCallback, useEffect } from "react";
import Root from "../screens/Stack/Home/Root";
import { RootStackParamList } from "../types";
import Colors from "../constants/Colors";
import useNotifications from "../utils/hooks/useNotifications";
import TimelineScreens from "../screens/Stack/Timeline/Main";
import { BottomTabBarProps, createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import BottomTab from "../components/BottomTab/BottomTab";
import WalletScreens from "../screens/Stack/Wallet/Main";
import NotesScreens from "../screens/Stack/Notes/Main";
import Settings from "../screens/Stack/Settings/Settings";
import Authentication from "../screens/Stack/Authentication/Main";
import * as QuickActions from "expo-quick-actions";
import GoalsScreens from "../screens/Stack/Goals/Main";
import { useApolloClient } from "@apollo/client";
import { Platform } from "react-native";
import moment from "moment";

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
    }, 500);
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

  if (isLoading) return null;

  return (
    <NavigationContainer
      ref={navigationRef}
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

            {/* <Tab.Screen name="WorkoutScreens" component={WorkoutScreens} /> */}

            <Tab.Screen name="GoalsScreens" component={GoalsScreens} />

            <Tab.Screen name="WalletScreens" component={WalletScreens} />

            <Tab.Screen name="TimelineScreens" component={TimelineScreens} />

            <Tab.Screen name="NotesScreens" component={NotesScreens} />

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
