import { Stack } from "expo-router"
import Colors from "@/constants/Colors"
import WalletContextProvider from "@/features/wallet/components/WalletContext"

export default function WalletLayout() {
    return (
        <WalletContextProvider>
            <Stack
                screenOptions={{
                    headerShown: false,
                    headerStyle: { backgroundColor: Colors.primary },
                    contentStyle: { backgroundColor: Colors.primary },
                    animation: "default",
                }}
            >
                <Stack.Screen name="index" />
                <Stack.Screen
                    name="create-expense"
                    options={{ presentation: "modal", headerShown: false }}
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
                <Stack.Screen name="expense/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="charts" options={{ headerShown: false }} />
                <Stack.Screen name="filters" options={{ presentation: "modal" }} />
                <Stack.Screen name="subscription/[id]" />
                <Stack.Screen name="subscription/[id]/edit" options={{ presentation: "modal" }} />
                <Stack.Screen
                    name="edit-balance"
                    options={{
                        presentation: "modal",
                        headerStyle: { backgroundColor: Colors.primary },
                        headerTintColor: Colors.foreground,
                        title: "Edit balance",
                        headerShown: true,
                    }}
                />
                <Stack.Screen name="spending-limits" options={{ presentation: "modal", headerShown: false }} />
                <Stack.Screen name="correction-maps" options={{ presentation: "modal", headerShown: false }} />
                <Stack.Screen name="sub-account/create" options={{ presentation: "modal", headerShown: false }} />
                <Stack.Screen name="sub-account/transfer" options={{ presentation: "modal", headerShown: false }} />
                <Stack.Screen name="expenses-list" />
                <Stack.Screen name="subscriptions-list" />
            </Stack>
        </WalletContextProvider>
    )
}
