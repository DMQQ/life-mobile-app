import ScreenContainer from "../../components/ui/ScreenContainer";
import { ScreenProps } from "../../types";
import useUser from "../../utils/hooks/useUser";
import { gql, useQuery } from "@apollo/client";
import AvailableBalanceWidget from "../../components/HomeScreenWidgets/AvailableBalanceWidget";
import TodaysTimelineEvents from "../../components/HomeScreenWidgets/TodaysTimelinEvents";
import AccountActions from "../../components/HomeScreenWidgets/AccountActions";
import { useEffect } from "react";

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
    <ScreenContainer style={{ padding: 10 }}>
      <AvailableBalanceWidget data={data?.wallet} />

      <TodaysTimelineEvents data={data?.timelineByCurrentDate} />

      <AccountActions navigation={navigation} />
    </ScreenContainer>
  );
}
