import { createStackNavigator } from "@react-navigation/stack";
import Wallet from "./pages/Wallet";
import CreateActivity from "./pages/CreateActivity";
import { ParamListBase } from "@react-navigation/native";
import { StackScreenProps } from "../../../types";
import Watchlist from "./pages/Watchlist";
import Colors from "@/constants/Colors";

import { fadeInFromBottomAndScaleUp } from "@/navigation/assets/screen_animations";

interface WalletRootStack extends ParamListBase {
  Wallet: undefined;
  Watchlist: undefined;
}

export type WalletScreens<Screen extends keyof WalletRootStack> =
  StackScreenProps<WalletRootStack, Screen>;

const Stack = createStackNavigator<WalletRootStack>();

export default function WalletScreens() {
  return (
    <Stack.Navigator
      initialRouteName="Wallet"
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: Colors.primary,
        },

        ...fadeInFromBottomAndScaleUp,
      }}
    >
      <Stack.Screen name="Wallet" component={Wallet} />
      <Stack.Screen
        name="Watchlist"
        component={Watchlist}
        options={{
          headerShown: true,
          title: "Create shopping list",
          headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="CreateActivity"
        component={CreateActivity}
        options={{
          headerShown: true,
          title: "",
        }}
      />
    </Stack.Navigator>
  );
}
