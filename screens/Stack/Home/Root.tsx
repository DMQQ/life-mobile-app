import { ScreenProps } from "@/types";
import { useQuery } from "@apollo/client";
import AvailableBalanceWidget from "@/screens/Stack/Home/components/WalletWidget";
import TodaysTimelineEvents from "@/screens/Stack/Home/components/EventsWidget";
import WorkoutWidget from "../Workout/components/WorkoutWidget";
import { useAppSelector } from "@/utils/redux";
import { ScrollView } from "react-native-gesture-handler";
import Header from "./components/HomeHeader";
import { GET_MAIN_SCREEN } from "@/utils/schemas/GET_MAIN_SCREEN";
import ScreenContainer from "@/components/ui/ScreenContainer";
import CreateShoppingList from "./components/CreateShoppingList";

export default function Root({ navigation }: ScreenProps<"Root">) {
  const workout = useAppSelector((s) => s.workout);

  const { data, loading } = useQuery(GET_MAIN_SCREEN);

  return (
    <ScreenContainer>
      <Header />
      <ScrollView
        contentContainerStyle={{
          paddingTop: 10,
        }}
      >
        <AvailableBalanceWidget data={data?.wallet} loading={loading} />

        <CreateShoppingList />

        <TodaysTimelineEvents
          data={data?.timelineByCurrentDate}
          loading={loading}
        />

        {workout.isWorkoutPending && <WorkoutWidget />}
      </ScrollView>
    </ScreenContainer>
  );
}
