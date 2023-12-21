import { ScreenProps } from "@/types";
import useUser from "@/utils/hooks/useUser";
import { gql, useQuery } from "@apollo/client";
import AvailableBalanceWidget from "@/components/HomeScreenWidgets/AvailableBalanceWidget";
import TodaysTimelineEvents from "@/components/HomeScreenWidgets/TodaysTimelinEvents";
import AccountActions from "@/components/HomeScreenWidgets/AccountActions";
import { Text, View } from "react-native";
import Colors, { randColor } from "../../constants/Colors";
import { AntDesign } from "@expo/vector-icons";
import WorkoutWidget from "./Workout/components/WorkoutWidget";
import { useAppSelector } from "@/utils/redux";

import Ripple from "react-native-material-ripple";
import { ScrollView } from "react-native-gesture-handler";

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

const Header = () => (
  <View
    style={{
      paddingHorizontal: 20,
      padding: 12.5,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: Colors.primary,
    }}
  >
    <Text style={{ color: "#fff", fontSize: 20 }}>Hello Damian</Text>

    <Ripple
      style={{
        backgroundColor: "#fff",
        borderRadius: 10,
        paddingHorizontal: 10,
        padding: 5,
        flexDirection: "row",
      }}
    >
      <Text style={{ color: Colors.primary, fontSize: 16, marginRight: 5 }}>
        Account
      </Text>
      <AntDesign name="user" color={Colors.primary} size={22} />
    </Ripple>
  </View>
);

const Note = (props: { marginRight: number; text: string }) => (
  <View
    style={[
      {
        backgroundColor: randColor(),
        borderRadius: 15,
        padding: 15,
        flex: 1,
      },
      { marginRight: props.marginRight },
    ]}
  >
    <Text
      numberOfLines={5}
      style={{
        color: "#fff",
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 5,
      }}
    >
      Pinned note
    </Text>
    <Text numberOfLines={5} style={{ color: "#fff", fontSize: 18 }}>
      {props.text}
    </Text>
  </View>
);

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

  const { notes } = useAppSelector((st) => st.notes);

  return (
    <View style={{ flex: 1 }}>
      <Header />
      <ScrollView style={{ flex: 1, paddingHorizontal: 10 }}>
        <AvailableBalanceWidget data={data?.wallet} />

        <TodaysTimelineEvents data={data?.timelineByCurrentDate} />

        {workout.isWorkoutPending && <WorkoutWidget />}

        {notes.length > 2 && (
          <View style={{ flexDirection: "row", marginTop: 15 }}>
            <Note marginRight={15} text={notes[0].content} />
            <Note marginRight={0} text={notes[1].content} />
          </View>
        )}

        <AccountActions navigation={navigation} />
      </ScrollView>
    </View>
  );
}
