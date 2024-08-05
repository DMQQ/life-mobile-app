import CreateTimeLineEventModal from "./pages/TimelineCreate";
import TimelineDetails from "./pages/TimelineDetails";
import Timeline from "./pages/Timeline";
import { useNavigation } from "@react-navigation/native";
import ImagesPreview from "./pages/ImagesPreview";
import { useEffect } from "react";
import type { TimelineRootStack as RootStackParamList } from "./types";
import ScheduleScreen from "./pages/Schedule";
import type { RootStackScreenProps } from "@/types";
import moment from "moment";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Colors } from "react-native/Libraries/NewAppScreen";
import { Platform, View } from "react-native";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function TimelineScreens({
  route,
}: RootStackScreenProps<"TimelineScreens">) {
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (!!route.params?.timelineId) {
      (navigation as any).navigate("TimelineDetails", {
        timelineId: route.params.timelineId,
      });
    } else if (route.params?.selectedDate !== undefined) {
      navigation.navigate("TimelineCreate", {
        selectedDate: route.params.selectedDate,
      });
    }
  }, [route.params]);

  return (
    <Stack.Navigator
      initialRouteName="Timeline"
      screenOptions={{
        animation: "default",
        // statusBarAnimation: "slide",
        animationDuration: 10,
        gestureEnabled: Platform.OS === "ios",
        gestureDirection: "horizontal",
        
      }}
    >
      <Stack.Screen
        name="Timeline"
        component={Timeline}
        options={{ headerShown: false }}
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
      />
      <Stack.Screen
        options={{
          headerTitle: "",
          headerTransparent: true,
          animationTypeForReplace: "pop",
          animation: "none",
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
        name="Schedule"
        component={ScheduleScreen}
        options={({ route }) => ({
          headerTitle: route.params.selectedDate,
          headerTitleAlign: "center",
          headerBackground: () => (
            <View style={{ backgroundColor: Colors.primary }}></View>
          ),
        })}
        initialParams={{
          selected: moment().format("YYYY-MM-DD"),
        }}
      />
    </Stack.Navigator>
  );
}
