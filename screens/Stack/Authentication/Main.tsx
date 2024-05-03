import { createStackNavigator } from "@react-navigation/stack";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { fadeInFromBottomAndScaleUp } from "@/navigation/assets/screen_animations";
import Colors from "@/constants/Colors";

const Stack = createStackNavigator();

const AuthenticationScreens = () => (
  <Stack.Navigator
    initialRouteName="Landing"
    screenOptions={{
      ...fadeInFromBottomAndScaleUp,
      headerStyle: {
        backgroundColor: Colors.primary,
      },
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
