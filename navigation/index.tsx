import { DarkTheme, NavigationContainer, NavigationContainerRef } from "@react-navigation/native";
import useUser from "../utils/hooks/useUser";
import React, { useCallback, useEffect } from "react";
import Root from "../features/home/Root";
import { RootStackParamList } from "../types";
import Colors from "../constants/Colors";
import useNotifications from "../utils/hooks/useNotifications";
import TimelineScreens from "../features/timeline/Main";
import { BottomTabBarProps, createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import BottomTab from "../components/BottomTab/BottomTab";
import WalletScreens from "../features/wallet/Main";
import Settings from "../features/settings/Settings";
import Authentication from "../features/authentication/Main";

import GoalsScreens from "../features/goals/Main";
import { useApolloClient } from "@apollo/client";
import useQuickActions from "@/utils/hooks/useQuickActions";
import useDeeplinking from "@/utils/hooks/useDeeplinking";

export const navigationRef = React.createRef<NavigationContainerRef<RootStackParamList>>();

const Tab = createBottomTabNavigator<RootStackParamList>();

export default function Navigation() {
  useQuickActions(navigationRef);
  const { isAuthenticated, loadUser, isLoading, removeUser } = useUser();
  const client = useApolloClient();
  const { sendTokenToServer } = useNotifications(navigationRef);

  useEffect(() => {
    loadUser();
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

  const linking = useDeeplinking();

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
