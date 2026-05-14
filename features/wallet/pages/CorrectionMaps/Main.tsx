import { createNativeStackNavigator } from "@react-navigation/native-stack"
import CorrectionMap from "./Index"
import CorrectionMapForm from "./Create"
import Colors from "@/constants/Colors"

const Stack = createNativeStackNavigator<{
    Index: undefined
    Create: {}
}>()

export default function () {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: Colors.primary,
                },
            }}
        >
            <Stack.Screen
                name="Index"
                component={CorrectionMap}
                options={{
                    title: "Correction maps",
                }}
            />
            <Stack.Screen
                name="Create"
                component={CorrectionMapForm}
                options={{
                    headerBackTitle: "List",
                }}
            />
        </Stack.Navigator>
    )
}
