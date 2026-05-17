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
import CopyTimelineModal from "./pages/CopyTimelineModal"
import MissedEventsModal from "./pages/MissedEventsModal"
import TimelineDoScreen from "./pages/TimelineDoScreen"
import type { TimelineRootStack as RootStackParamList } from "./types"
import Color from "color"
import Colors from "@/constants/Colors"
import { IconButton } from "@/components"
import { AntDesign } from "@expo/vector-icons"

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
            <Stack.Screen
                name="Timeline"
                component={Timeline}
                options={{
                    headerShown: false,
                }}
            />
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
                    presentation: "transparentModal",
                    animation: "fade",
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
                    contentStyle: {
                        backgroundColor: Color(Colors.primary).alpha(0.5).string(),
                    },
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
            <Stack.Screen
                name="CopyTimelineModal"
                component={CopyTimelineModal}
                options={{
                    headerShown: false,
                    presentation: "modal",
                }}
            />

            <Stack.Screen
                name="MissedEventsModal"
                component={MissedEventsModal}
                options={{
                    headerShown: true,
                    presentation: "modal",
                    title: "Missed Events",
                    headerBackButtonMenuEnabled: true,
                    headerLeft: () => (
                        <IconButton
                            icon={<AntDesign name="close" size={20} color={Colors.foreground} />}
                            onPress={() => navigation.goBack()}
                        />
                    ),
                    contentStyle: {
                        backgroundColor: Colors.primary,
                    },
                    headerStyle: {
                        backgroundColor: Colors.primary,
                    },
                }}
            />
            <Stack.Screen
                name="TimelineDo"
                component={TimelineDoScreen}
                options={{
                    headerShown: false,
                    presentation: "modal",
                }}
            />
        </Stack.Navigator>
    )
}
