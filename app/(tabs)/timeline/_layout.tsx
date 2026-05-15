import { Stack } from "expo-router"
import { Platform } from "react-native"
import Colors from "@/constants/Colors"
import Color from "color"
import { Feather } from "@expo/vector-icons"
import { IconButton } from "@/components"
import { useNavigation } from "expo-router"

export default function TimelineLayout() {
    const navigation = useNavigation()

    return (
        <Stack
            screenOptions={{
                gestureEnabled: Platform.OS === "ios",
                gestureDirection: "horizontal",
                contentStyle: { backgroundColor: Colors.primary },
            }}
        >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen
                name="[id]"
                options={{ headerShown: false }}
                initialParams={{ timelineId: "" }}
            />
            <Stack.Screen
                name="[id]/do"
                options={{ headerShown: false, presentation: "modal" }}
            />
            <Stack.Screen
                name="create"
                initialParams={{ selectedDate: "", mode: "create" }}
                options={{ headerShown: false, presentation: "modal" }}
            />
            <Stack.Screen
                name="images-preview"
                options={{
                    headerTitle: "",
                    headerTransparent: true,
                    presentation: "transparentModal",
                    animation: "fade",
                }}
                initialParams={{ selectedImage: "", timelineId: "" }}
            />
            <Stack.Screen
                name="create-todos"
                options={{
                    headerShown: false,
                    presentation: "modal",
                    contentStyle: { backgroundColor: Color(Colors.primary).alpha(0.5).string() },
                }}
                initialParams={{ timelineId: "" }}
            />
            <Stack.Screen
                name="todos-transfer"
                options={{ headerShown: false, presentation: "modal" }}
            />
            <Stack.Screen
                name="copy-timeline"
                options={{ headerShown: false, presentation: "modal" }}
            />
            <Stack.Screen
                name="missed-events"
                options={{
                    headerShown: true,
                    presentation: "modal",
                    title: "Missed Events",
                    headerBackButtonMenuEnabled: true,
                    headerLeft: () => (
                        <IconButton
                            icon={<Feather name="x" size={20} color={Colors.foreground} />}
                            onPress={() => navigation.goBack()}
                        />
                    ),
                    contentStyle: { backgroundColor: Colors.primary },
                    headerStyle: { backgroundColor: Colors.primary },
                }}
            />
        </Stack>
    )
}
