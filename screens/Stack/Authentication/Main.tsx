import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Colors from "@/constants/Colors";

const Stack = createNativeStackNavigator();

const AuthenticationScreens = () => (
  <Stack.Navigator
    initialRouteName="Landing"
    screenOptions={{
      headerStyle: {
        backgroundColor: Colors.primary,
      },
      animation: "simple_push",
    }}
  >
    <Stack.Screen
      name="Landing"
      component={Landing}
      options={{ headerShown: false }}
    />
    <Stack.Screen name="Login" component={Login} />
    <Stack.Screen name="Register" component={Register} />
  </Stack.Navigator>
);

export default AuthenticationScreens;
