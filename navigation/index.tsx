import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import Login from "../screens/Stack/Login";
import Register from "../screens/Stack/Register";
import useUser from "../utils/hooks/useUser";
import { useEffect } from "react";
import Root from "../screens/Stack/Root";
import { RootStackParamList } from "../types";
import Colors from "../constants/Colors";
import Landing from "../screens/Stack/Landing";
import useNotifications from "../utils/hooks/useNotifications";
import TimelineScreens from "../screens/Stack/Timeline";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import BottomTab from "../components/BottomTab/BottomTab";
import WalletScreens from "../screens/Stack/Wallet";
import WorkoutScreens from "../screens/Stack/Workout";
import NotesScreens from "../screens/Stack/Notes/Main";

const Tab = createBottomTabNavigator<RootStackParamList>();

export default function Navigation() {
  const { isAuthenticated, loadUser } = useUser();

  const { sendTokenToServer } = useNotifications();

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      sendTokenToServer();
    }
  }, [isAuthenticated]);

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
        tabBar={(props) => (isAuthenticated ? <BottomTab {...props} /> : null)}
        screenOptions={{
          headerShown: false,
        }}
      >
        {isAuthenticated ? (
          <>
            <Tab.Screen name="Root" component={Root} />

            <Tab.Screen name="WorkoutScreens" component={WorkoutScreens} />

            <Tab.Screen name="WalletScreens" component={WalletScreens} />

            <Tab.Screen name="TimelineScreens" component={TimelineScreens} />

            <Tab.Screen name="NotesScreens" component={NotesScreens} />
          </>
        ) : (
          <>
            <Tab.Screen name="Landing" component={Landing} />
            <Tab.Screen name="Login" component={Login} />
            <Tab.Screen name="Register" component={Register} />
          </>
        )}
      </Tab.Navigator>
    </NavigationContainer>
  );
}
