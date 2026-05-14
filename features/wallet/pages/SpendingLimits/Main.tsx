import { createNativeStackNavigator } from "@react-navigation/native-stack"
import SpendingLimitsIndex from "./Index"
import SpendingLimitsCreate from "./Create"
import Colors from "@/constants/Colors"

const Stack = createNativeStackNavigator<{
    Index: undefined
    Create: undefined
}>()

export default function SpendingLimitsNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: Colors.primary },
                headerTintColor: Colors.foreground,
            }}
        >
            <Stack.Screen name="Index" component={SpendingLimitsIndex} options={{ title: "Spending Limits" }} />
            <Stack.Screen
                name="Create"
                component={SpendingLimitsCreate}
                options={{
                    title: "Create limit",
                    headerBackTitle: "Limit",
                }}
            />
        </Stack.Navigator>
    )
}
