import { createStackNavigator } from "@react-navigation/stack";
import CreateTimeLineEventModal from "./CreateTimeLineModal";
import TimelineDetails from "./TimelineDetails";
import Timeline from "./Timeline";
import { useNavigation } from "@react-navigation/native";
import ImagesPreview from "./ImagesPreview";
import { useEffect } from "react";
import type { TimelineRootStack as RootStackParamList } from "../types";
import {
  fadeInFromBottomAndScaleUp,
  horizontalAnimation,
} from "../../../../navigation/assets/screen_animations";
import ScheduleScreen from "./Schedule";
import type { RootStackScreenProps } from "../../../../types";

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
      />
      <Stack.Screen
        name="TimelineCreate"
        component={CreateTimeLineEventModal}
      />
      <Stack.Screen
        options={{
          headerTitle: "Images",
          headerTitleAlign: "center",
          ...horizontalAnimation,
        }}
        name="ImagesPreview"
        component={ImagesPreview}
      />

      <Stack.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
