import Colors from "@/constants/Colors"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { useEffect, useRef, useState } from "react"
import { AddSubExpenseSheetHandle } from "../../components/Expense/AddSubExpenseSheet"
import useCreateExpensePage from "../../hooks/useCreateExpensePage"
import { CreateExpenseProvider } from "../../context/CreateExpenseContext"
import Form from "./Form"
import AIScanner from "./AIScanner"

const PARAM_DEFAULTS = {
    type: null,
    amount: 0,
    category: "",
    date: "",
    description: "",
    shouldOpenPhotoPicker: false,
    isEditing: false,
}

export type CreateExpenseStackParams = {
    Form: {}
    AIScanner: {}
}

const Stack = createNativeStackNavigator<CreateExpenseStackParams>()

export default function CreateExpenseStack({ route }: any) {
    const params = { ...PARAM_DEFAULTS, ...(route.params ?? {}) }
    const hookData = useCreateExpensePage(params)
    const [isInputFocused, setIsInputFocused] = useState(false)
    const subexpenseSheetRef = useRef<AddSubExpenseSheetHandle | null>(null)

    useEffect(() => {
        if (!hookData.state.type) hookData.methods.setType("expense")
    }, [])

    return (
        <CreateExpenseProvider value={{ ...hookData, isInputFocused, setIsInputFocused, subexpenseSheetRef }}>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: { backgroundColor: Colors.primary },
                    headerTintColor: Colors.foreground,
                    headerShadowVisible: false,
                    headerTransparent: true,
                }}
            >
                <Stack.Screen name="Form" component={Form} options={{ headerShown: true, title: "Expense" }} />
                <Stack.Screen
                    name="AIScanner"
                    component={AIScanner}
                    options={{
                        headerShown: true,
                        title: "AI Scanner",

                        headerBackButtonDisplayMode: "minimal",
                    }}
                />
            </Stack.Navigator>
        </CreateExpenseProvider>
    )
}
