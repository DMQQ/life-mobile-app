import Colors from "@/constants/Colors"
import { StackScreenProps } from "@/types"
import { ParamListBase } from "@react-navigation/native"
import { createNativeStackNavigator, NativeStackNavigationOptions } from "@react-navigation/native-stack"
import { useEffect } from "react"
import WalletContextProvider from "./components/WalletContext"
import CreateExpenseModal from "./pages/CreateExpense"
import CreateLimits from "./pages/CreateLimits"
import LimitsDetail from "./pages/LimitsDetail"
import CorrectionMaps from "./pages/CorrectionMaps"
import CorrectionMapForm from "./pages/CorrectionMapForm"
import EditBalance from "./pages/EditBalance"
import CreateSubAccount from "./pages/CreateSubAccount"
import TransferSubAccount from "./pages/TransferSubAccount"
import Expense from "./pages/Expense"
import Filters from "./pages/Filters"
import SubscriptionScreen from "./pages/Subscription"
import EditSubscription from "./pages/EditSubscription"
import Wallet from "./pages/Wallet"
import WalletCharts from "./pages/WalletCharts"

interface WalletRootStack extends ParamListBase {
    Wallet: {
        expenseId?: string
    }
    Watchlist: undefined
    Charts: undefined
    EditBalance: undefined
    CreateLimits: undefined
    LimitsDetail: undefined
    CorrectionMaps:
        | { prefill?: { shop?: string; description?: string; category?: string; amount?: number } }
        | undefined
    CorrectionMapForm:
        | {
              prefill?: { shop?: string; description?: string; category?: string; amount?: number }
              editingItem?: import("./hooks/useCorrectionMaps").CorrectionMap
          }
        | undefined
    AiStatsChat: { startDate: string; endDate: string }
    CreateSubAccount:
        | {
              editSubAccount?: {
                  id: string
                  name: string
                  description: string | null
                  color: string
                  icon: string
                  balance: number
              }
          }
        | undefined
    TransferSubAccount: { fromId?: string } | undefined
}

export type WalletScreens<Screen extends keyof WalletRootStack> = StackScreenProps<WalletRootStack, Screen>

const Stack = createNativeStackNavigator<WalletRootStack>()

const MODAL_OPTIONS: NativeStackNavigationOptions = {
    presentation: "modal",
    headerShown: false,
} as const

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
                    options={MODAL_OPTIONS}
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

                <Stack.Screen name="Filters" component={Filters} options={MODAL_OPTIONS} />

                <Stack.Screen name="Subscription" component={SubscriptionScreen as any} />

                <Stack.Screen name="EditSubscription" component={EditSubscription as any} options={MODAL_OPTIONS} />

                <Stack.Screen name="EditBalance" component={EditBalance} options={MODAL_OPTIONS} />

                <Stack.Screen name="CreateLimits" component={CreateLimits} options={MODAL_OPTIONS} />

                <Stack.Screen name="LimitsDetail" component={LimitsDetail} options={{ headerShown: false }} />

                <Stack.Screen name="CorrectionMaps" component={CorrectionMaps} options={MODAL_OPTIONS} />

                <Stack.Screen name="CorrectionMapForm" component={CorrectionMapForm} options={MODAL_OPTIONS} />

                <Stack.Screen name="CreateSubAccount" component={CreateSubAccount} options={MODAL_OPTIONS} />

                <Stack.Screen name="TransferSubAccount" component={TransferSubAccount} options={MODAL_OPTIONS} />
            </Stack.Navigator>
        </WalletContextProvider>
    )
}
