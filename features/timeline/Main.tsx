import type { RootStackScreenProps } from "@/types"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import moment from "moment"
import { useEffect } from "react"
import { Platform } from "react-native"
import CreateTimelineTodos from "./pages/CreateTimelineTodos"
import ImagesPreview from "./pages/ImagesPreview"
import Timeline from "./pages/Timeline"
import CreateTimeLineEventModal from "./pages/TimelineCreate"
import TimelineDetails from "./pages/TimelineDetails"
import TodosTransferModal from "./pages/TodosTransferModal"
import type { TimelineRootStack as RootStackParamList } from "./types"

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function TimelineScreens({ route, navigation }: RootStackScreenProps<"TimelineScreens">) {
    useEffect(() => {
        if (!!route.params?.timelineId) {
            ;(navigation as any).navigate("TimelineDetails", {
                ...route.params,
                timelineId: route.params.timelineId,
            })
        } else if (route.params?.selectedDate !== undefined) {
            ;(navigation as any).navigate("TimelineCreate", {
                ...route.params,
            })
        }
    }, [route.params])

    return (
        <Stack.Navigator
            initialRouteName="Timeline"
            screenOptions={{
                gestureEnabled: Platform.OS === "ios",
                gestureDirection: "horizontal",
            }}
        >
            <Stack.Screen name="Timeline" component={Timeline} options={{ headerShown: false }} />
            <Stack.Screen
                name="TimelineDetails"
                component={TimelineDetails}
                options={{ headerShown: false }}
                initialParams={{
                    timelineId: "",
                }}
            />
            <Stack.Screen
                name="TimelineCreate"
                component={CreateTimeLineEventModal}
                initialParams={{
                    selectedDate: moment().format("YYYY-MM-DD"),
                    mode: "create",
                }}
                options={{
                    headerShown: false,
                    presentation: "modal",
                }}
            />
            <Stack.Screen
                options={{
                    headerTitle: "",
                    headerTransparent: true,
                    presentation: "transparentModal",
                }}
                name="ImagesPreview"
                component={ImagesPreview}
                initialParams={{
                    selectedImage: "",
                    timelineId: "",
                }}
            />

            <Stack.Screen
                name="CreateTimelineTodos"
                component={CreateTimelineTodos}
                options={{
                    headerShown: false,
                    presentation: "modal",
                }}
                initialParams={{
                    timelineId: "",
                }}
            />
            <Stack.Screen
                name="TodosTransferModal"
                component={TodosTransferModal}
                options={{
                    headerShown: false,
                    presentation: "modal",
                }}
            />
        </Stack.Navigator>
    )
}
