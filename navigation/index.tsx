import {
  DarkTheme,
  NavigationContainer,
  NavigationContainerRef,
} from "@react-navigation/native";
import useUser from "../utils/hooks/useUser";
import React, { useCallback, useEffect } from "react";
import Root from "../screens/Stack/Home/Root";
import { RootStackParamList } from "../types";
import Colors from "../constants/Colors";
import useNotifications from "../utils/hooks/useNotifications";
import TimelineScreens from "../screens/Stack/Timeline/Main";
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import BottomTab from "../components/BottomTab/BottomTab";
import WalletScreens from "../screens/Stack/Wallet/Main";
import WorkoutScreens from "../screens/Stack/Workout/Main";
import NotesScreens from "../screens/Stack/Notes/Main";
import Settings from "../screens/Stack/Settings/Settings";
import Authentication from "../screens/Stack/Authentication/Main";

export const navigationRef =
  React.createRef<NavigationContainerRef<RootStackParamList>>();

const Tab = createBottomTabNavigator<RootStackParamList>();

export default function Navigation() {
  const { isAuthenticated, loadUser, isLoading } = useUser();

  const { sendTokenToServer } = useNotifications(navigationRef);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      sendTokenToServer();
    }
  }, [isAuthenticated]);

  const renderTab = useCallback(
    (props: BottomTabBarProps) =>
      isAuthenticated ? <BottomTab {...props} /> : null,
    [isAuthenticated]
  );

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

            <Tab.Screen name="WorkoutScreens" component={WorkoutScreens} />

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
