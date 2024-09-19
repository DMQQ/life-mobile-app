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
import useOffline from "@/utils/hooks/useOffline";

export default function Root({ navigation }: ScreenProps<"Root">) {
  const workout = useAppSelector((s) => s.workout);

  const user = useAppSelector((s) => s.user);

  const offline = useOffline("RootScreen");

  const { data: gql, loading } = useQuery(GET_MAIN_SCREEN, {
    variables: {
      range: [
        moment().subtract(1, "day").startOf("week").format("YYYY-MM-DD"),
        moment().subtract(1, "day").endOf("week").format("YYYY-MM-DD"),
      ],
    },
    onCompleted: (data) => offline.save("RootScreen", data),
  });

  const data = offline.isOffline ? offline.data || {} : gql;

  return (
    <ScreenContainer style={{ padding: 0 }}>
      <Header
        titleAnimatedStyle={{}}
        title={`Hello, ${user?.user?.email.split("@")[0]}`}
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
