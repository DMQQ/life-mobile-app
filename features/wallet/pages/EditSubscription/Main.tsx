import Colors from "@/constants/Colors"
import { Subscription } from "@/types"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import CustomBilling from "./CustomBilling"
import Form from "./Form"

export type EditSubscriptionStackParams = {
    Form: {
        subscription?: Subscription
        customBilling?: { billingDay: string; customBillingMonths: number[] }
    }
    CustomBilling: {
        billingDay: string
        customBillingMonths: number[]
    }
}

const Stack = createNativeStackNavigator<EditSubscriptionStackParams>()

export default function EditSubscriptionStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: Colors.primary },
                headerTintColor: Colors.foreground,
                headerShadowVisible: false,
                headerTransparent: true,
            }}
        >
            <Stack.Screen name="Form" component={Form} options={{ headerShown: true, title: "Subscription" }} />
            <Stack.Screen name="CustomBilling" component={CustomBilling} options={{ title: "Custom Billing" }} />
        </Stack.Navigator>
    )
}
