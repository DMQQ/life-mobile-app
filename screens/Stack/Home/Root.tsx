import { ScreenProps } from "@/types";
import useUser from "@/utils/hooks/useUser";
import { gql, useQuery } from "@apollo/client";
import AvailableBalanceWidget from "@/screens/Stack/Home/components/WalletWidget";
import TodaysTimelineEvents from "@/screens/Stack/Home/components/EventsWidget";
import AccountActions from "@/screens/Stack/Home/components/AccountWidget";
import { View } from "react-native";
import WorkoutWidget from "../Workout/components/WorkoutWidget";
import { useAppSelector } from "@/utils/redux";
import { ScrollView } from "react-native-gesture-handler";
import NoteWidget from "./components/NoteWidget";
import Header from "./components/HomeHeader";

const GET_MAIN_SCREEN = gql`
  query GetRootView {
    timelineByCurrentDate {
      id
      title
      description
      date
      beginTime
      endTime
      isCompleted
    }
    wallet {
      balance
      expenses {
        id
        amount
        description
      }
    }
  }
`;

export default function Root({ navigation }: ScreenProps<"Root">) {
  const { token } = useUser();
  const workout = useAppSelector((s) => s.workout);

  const { data } = useQuery(GET_MAIN_SCREEN, {
    context: {
      headers: {
        authentication: token,
        token,
      },
    },
  });

  return (
    <View style={{ flex: 1 }}>
      <Header />
      <ScrollView style={{ flex: 1, paddingHorizontal: 10 }}>
        <AvailableBalanceWidget data={data?.wallet} />

        <TodaysTimelineEvents data={data?.timelineByCurrentDate} />

        {workout.isWorkoutPending && <WorkoutWidget />}

        <NoteWidget />

        <AccountActions navigation={navigation} />
      </ScrollView>
    </View>
  );
}
