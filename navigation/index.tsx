import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import useUser from "../utils/hooks/useUser";
import { useCallback, useEffect } from "react";
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
import ScreenContainer from "../components/ui/ScreenContainer";
import { ActivityIndicator } from "react-native";
import Settings from "../screens/Stack/Settings/Settings";
import Authentication from "../screens/Stack/Authentication/Main";

const LoaderScreen = () => (
  <ScreenContainer style={{ justifyContent: "center", alignItems: "center" }}>
    <ActivityIndicator color={"white"} size={45} />
  </ScreenContainer>
);

const Tab = createBottomTabNavigator<RootStackParamList>();

export default function Navigation() {
  const { isAuthenticated, loadUser, isLoading } = useUser();

  const { sendTokenToServer } = useNotifications();

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

  return (
    <NavigationContainer
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
        }}
      >
        {isLoading && <Tab.Screen name="Loader" component={LoaderScreen} />}

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
