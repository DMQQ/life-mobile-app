import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Wallet from "./pages/Wallet";
import CreateActivity from "./pages/CreateActivity";
import { ParamListBase } from "@react-navigation/native";
import { StackScreenProps } from "@/types";
import Watchlist from "./pages/Watchlist";
import Colors from "@/constants/Colors";
import WalletCharts from "./pages/WalletCharts";
import CreateExpenseModal from "./pages/CreateExpense";

import ExpoenseFiltersSheet from "./components/Sheets/ExpenseFiltersSheet";
import WalletContextProvider from "./components/WalletContext";
import Expense from "./pages/Expense";
import { useEffect } from "react";

interface WalletRootStack extends ParamListBase {
  Wallet: {
    expenseId?: string;
  };
  Watchlist: undefined;
  Charts: undefined;
}

export type WalletScreens<Screen extends keyof WalletRootStack> = StackScreenProps<WalletRootStack, Screen>;

const Stack = createNativeStackNavigator<WalletRootStack>();

export default function WalletScreens({ navigation, route }: WalletScreens<"Wallet">) {
  useEffect(() => {
    if (route.params?.expenseId !== undefined && route.params?.expenseId == null) {
      navigation.navigate("CreateExpense", {
        ...(route.params || {}),
      });
    }
  }, [route.params?.expenseId]);

  return (
    <WalletContextProvider>
      <Stack.Navigator
        initialRouteName="Wallet"
        screenOptions={{
          headerShown: false,
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          animation: "default",
        }}
      >
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

        <Stack.Screen
          name={"CreateExpense"}
          component={CreateExpenseModal}
          options={{
            presentation: "modal",
          }}
          initialParams={{
            type: null,
            amount: 0,
            category: "",
            date: "",
            description: "",
            shouldOpenPhotoPicker: false,
            isEditing: false,
          }}
        />

        <Stack.Screen
          name="Expense"
          component={Expense}
          options={{
            presentation: "modal",
          }}
        />

        <Stack.Screen
          name="Charts"
          component={WalletCharts}
          options={{
            presentation: "modal",
            headerShown: false,
          }}
        />

        <Stack.Screen name="Wallet" component={Wallet} />

        <Stack.Screen
          name="Filters"
          component={ExpoenseFiltersSheet}
          options={{
            presentation: "modal",
          }}
        />
      </Stack.Navigator>
    </WalletContextProvider>
  );
}
