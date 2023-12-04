import { createStackNavigator } from "@react-navigation/stack";
import Landing from "../Landing";
import Login from "./Login";
import Register from "./Register";
import { fadeInFromBottomAndScaleUp } from "../../../navigation/assets/screen_animations";

const Stack = createStackNavigator();

const AuthenticationScreens = () => (
  <Stack.Navigator
    initialRouteName="Landing"
    screenOptions={{
      ...fadeInFromBottomAndScaleUp,
    }}
  >
    <Stack.Screen name="Landing" component={Landing} />
    <Stack.Screen name="Login" component={Login} />
    <Stack.Screen name="Register" component={Register} />
  </Stack.Navigator>
);

export default AuthenticationScreens;
