import { createStackNavigator } from "@react-navigation/stack";
import Wallet from "./Wallet";
import CreateActivity from "./CreateActivity";
import { ParamListBase } from "@react-navigation/native";
import { StackScreenProps } from "../../../types";
import Watchlist from "./Watchlist";

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
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Wallet" component={Wallet} />
      <Stack.Screen name="Watchlist" component={Watchlist} />
    </Stack.Navigator>
  );
}
