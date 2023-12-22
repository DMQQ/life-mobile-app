import { createStackNavigator } from "@react-navigation/stack";
import CreateTimeLineEventModal from "./pages/TimelineCreate";
import TimelineDetails from "./pages/TimelineDetails";
import Timeline from "./pages/Timeline";
import { useNavigation } from "@react-navigation/native";
import ImagesPreview from "./pages/ImagesPreview";
import { useEffect } from "react";
import type { TimelineRootStack as RootStackParamList } from "./types";
import {
  fadeInFromBottomAndScaleUp,
  horizontalAnimation,
} from "@/navigation/assets/screen_animations";
import ScheduleScreen from "./pages/Schedule";
import type { RootStackScreenProps } from "@/types";
import moment from "moment";

const Stack = createStackNavigator<RootStackParamList>();

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
      screenOptions={{ ...fadeInFromBottomAndScaleUp }}
    >
      <Stack.Screen name="Timeline" component={Timeline} />
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
        }}
      />
      <Stack.Screen
        options={{
          headerTitle: "Images",
          headerTitleAlign: "center",
          ...horizontalAnimation,
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
        options={{ headerShown: false }}
        initialParams={{
          selected: moment().format("YYYY-MM-DD"),
        }}
      />
    </Stack.Navigator>
  );
}
