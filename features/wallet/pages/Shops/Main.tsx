import { createNativeStackNavigator } from "@react-navigation/native-stack"
import Colors from "@/constants/Colors"
import ShopsIndex from "./Index"
import ShopsCreate from "./Create"
import ShopDetails from "./Details"
import { ShopItem } from "../../hooks/useShops"

export type ShopsStackParams = {
    Index: undefined
    Create: { shop?: ShopItem } | undefined
    Details: { shop: ShopItem }
}

const Stack = createNativeStackNavigator<ShopsStackParams>()

export default function ShopsNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: Colors.primary },
                headerTintColor: Colors.foreground,
                headerShadowVisible: false,
            }}
        >
            <Stack.Screen name="Index" component={ShopsIndex} options={{ title: "Shops" }} />
            <Stack.Screen
                name="Create"
                component={ShopsCreate}
                options={{ headerBackTitle: "Shops" }}
            />
            <Stack.Screen
                name="Details"
                component={ShopDetails}
                options={{ headerBackTitle: "Shops" }}
            />
        </Stack.Navigator>
    )
}
