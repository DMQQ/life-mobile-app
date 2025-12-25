import Colors from "@/constants/Colors"
import { StackScreenProps } from "@/types"
import { ParamListBase } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { useEffect } from "react"
import WalletContextProvider from "./components/WalletContext"
import CreateExpenseModal from "./pages/CreateExpense"
import CreateLimits from "./pages/CreateLimits"
import EditBalance from "./pages/EditBalance"
import Expense from "./pages/Expense"
import Filters from "./pages/Filters"
import SubscriptionScreen from "./pages/Subscription"
import Wallet from "./pages/Wallet"
import WalletCharts from "./pages/WalletCharts"
import Color from "color"

interface WalletRootStack extends ParamListBase {
    Wallet: {
        expenseId?: string
    }
    Watchlist: undefined
    Charts: undefined
    EditBalance: undefined
    CreateLimits: undefined
}

export type WalletScreens<Screen extends keyof WalletRootStack> = StackScreenProps<WalletRootStack, Screen>

const Stack = createNativeStackNavigator<WalletRootStack>()

export default function WalletScreens({ navigation, route }: WalletScreens<"Wallet">) {
    useEffect(() => {
        if (route.params?.expenseId !== undefined && route.params?.expenseId == null) {
            navigation.navigate("CreateExpense", {
                ...(route.params || {}),
            })
        }
    }, [route.params?.expenseId])

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
                        headerShown: false,
                    }}
                />

                <Stack.Screen
                    name="Charts"
                    component={WalletCharts}
                    options={{
                        headerShown: false,
                    }}
                />

                <Stack.Screen name="Wallet" component={Wallet} />

                <Stack.Screen
                    name="Filters"
                    component={Filters}
                    options={{
                        presentation: "formSheet",
                        headerShown: false,
                        sheetGrabberVisible: true,
                        sheetAllowedDetents: [0.9],
                        contentStyle: {
                            backgroundColor: Color(Colors.primary).alpha(0.5).string(),
                        },
                    }}
                />

                <Stack.Screen name="Subscription" component={SubscriptionScreen as any} />

                <Stack.Screen
                    name="EditBalance"
                    component={EditBalance}
                    options={{
                        presentation: "modal",
                        headerShown: false,
                    }}
                />

                <Stack.Screen
                    name="CreateLimits"
                    component={CreateLimits}
                    options={{
                        presentation: "modal",
                        headerShown: false,
                    }}
                />
            </Stack.Navigator>
        </WalletContextProvider>
    )
}
