import { createNativeStackNavigator } from "@react-navigation/native-stack"
import Colors from "@/constants/Colors"
import AiWidget from "./pages/AiWidget"
import AiChatScreen from "./pages/AiChatScreen"

type AiStackParamList = {
    AiWidget: undefined
    AiChatScreen: undefined
}

const Stack = createNativeStackNavigator<AiStackParamList>()

export default function AiScreens() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Colors.primary },
            }}
        >
            <Stack.Screen name="AiWidget" component={AiWidget} />
            <Stack.Screen name="AiChatScreen" component={AiChatScreen} />
        </Stack.Navigator>
    )
}
