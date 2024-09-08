import ScreenContainer from "@/components/ui/ScreenContainer";
import TodaysTimelineEvents from "@/screens/Stack/Home/components/EventsWidget";
import AvailableBalanceWidget from "@/screens/Stack/Home/components/WalletWidget";
import { ScreenProps } from "@/types";
import { useAppSelector } from "@/utils/redux";
import { GET_MAIN_SCREEN } from "@/utils/schemas/GET_MAIN_SCREEN";
import { useQuery } from "@apollo/client";
import { ScrollView } from "react-native-gesture-handler";
import WorkoutWidget from "../Workout/components/WorkoutWidget";
import Header from "@/components/ui/Header/Header";
import { AntDesign } from "@expo/vector-icons";
import moment from "moment";

export default function Root({ navigation }: ScreenProps<"Root">) {
  const workout = useAppSelector((s) => s.workout);

  const { data, loading } = useQuery(GET_MAIN_SCREEN, {
    variables: {
      range: [
        moment().subtract(1, "day").startOf("week").format("YYYY-MM-DD"),
        moment().subtract(1, "day").endOf("week").format("YYYY-MM-DD"),
      ],
    },
  });

  return (
    <ScreenContainer style={{ padding: 0 }}>
      <Header
        titleAnimatedStyle={{}}
        title="Hello :)"
        buttons={[
          {
            icon: <AntDesign name="setting" size={20} color="#fff" />,
            onPress: () => navigation.navigate("Settings"),
          },
        ]}
      />
      <ScrollView
        contentContainerStyle={{
          padding: 15,
        }}
      >
        <AvailableBalanceWidget
          data={{
            wallet: data?.wallet,
            statistics: {
              weeklySpendings: data?.weeklySpendings,
            },
          }}
          loading={loading}
        />

        <TodaysTimelineEvents data={data?.timelineByCurrentDate} loading={loading} />

        {workout.isWorkoutPending && <WorkoutWidget />}
      </ScrollView>
    </ScreenContainer>
  );
}
