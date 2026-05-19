import Colors from "@/constants/Colors"
import { StackScreenProps } from "@/types"
import RefreshContextProvider from "@/utils/context/RefreshContext"
import { ParamListBase } from "@react-navigation/native"
import { NativeStackNavigationOptions, createNativeStackNavigator } from "@react-navigation/native-stack"
import NotificationsScreen from "./components/NotificationsModal"
import SettingsScreen from "./components/SettingsModal"
import Root from "./Root"

interface HomeRootStack extends ParamListBase {
    HomeRoot: undefined
    HomeNotifications: undefined
    HomeSettings: undefined
}

export type HomeScreenProps<Screen extends keyof HomeRootStack> = StackScreenProps<HomeRootStack, Screen>

const Stack = createNativeStackNavigator<HomeRootStack>()

const MODAL_OPTIONS: NativeStackNavigationOptions = {
    presentation: "modal",
    headerShown: true,
}

const NESTED_MODAL_OPTIONS: NativeStackNavigationOptions = {
    presentation: "modal",
    headerShown: false,
}

export default function HomeScreens() {
    return (
        <RefreshContextProvider>
            <Stack.Navigator
                initialRouteName="HomeRoot"
                screenOptions={{
                    headerShown: false,
                    animation: "default",
                }}
            >
                <Stack.Screen name="HomeRoot" component={Root} />
                <Stack.Screen name="HomeNotifications" component={NotificationsScreen} options={MODAL_OPTIONS} />
                <Stack.Screen name="HomeSettings" component={SettingsScreen} options={NESTED_MODAL_OPTIONS} />
            </Stack.Navigator>
        </RefreshContextProvider>
    )
}
