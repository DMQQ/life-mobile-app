import ScreenContainer from "../../components/ui/ScreenContainer";
import { ScreenProps } from "../../types";
import useUser from "../../utils/hooks/useUser";
import { gql, useQuery } from "@apollo/client";
import AvailableBalanceWidget from "../../components/HomeScreenWidgets/AvailableBalanceWidget";
import TodaysTimelineEvents from "../../components/HomeScreenWidgets/TodaysTimelinEvents";
import AccountActions from "../../components/HomeScreenWidgets/AccountActions";
import { ReactNode, useEffect } from "react";
import { Text, TextProps, View, ViewProps } from "react-native";
import Colors from "../../constants/Colors";
import Color from "color";
import { FontAwesome5 } from "@expo/vector-icons";
import WorkoutWidget from "./Workout/components/WorkoutWidget";
import { useAppSelector } from "../../utils/redux";

const GET = gql`
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
  const { removeUser, token, user } = useUser();
  const workout = useAppSelector((s) => s.workout);

  const { data } = useQuery(GET, {
    context: {
      headers: {
        authentication: token,
        token,
      },
    },
  });

  useEffect(() => {
    navigation.setOptions({
      headerTitle: "Hello " + user?.email,
    });
  }, [user]);

  return (
    <ScreenContainer style={{ padding: 10 }} scroll>
      <AvailableBalanceWidget data={data?.wallet} />

      <TodaysTimelineEvents data={data?.timelineByCurrentDate} />

      {workout.isWorkoutPending && <WorkoutWidget />}

      <AccountActions navigation={navigation} route={undefined} />
    </ScreenContainer>
  );
}
