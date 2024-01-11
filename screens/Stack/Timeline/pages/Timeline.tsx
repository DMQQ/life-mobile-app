import { View, Text, ScrollView } from "react-native";
import Calendar from "../../../../components/Calendar/Calendar";
import moment from "moment";
import timelineStyles from "../components/timeline.styles";
import Ripple from "react-native-material-ripple";
import useGetTimeLineQuery from "../hooks/query/useGetTimeLineQuery";
import Colors from "../../../../constants/Colors";
import { useEffect, useMemo, useState } from "react";
import Skeleton from "../../../../components/SkeletonLoader/Skeleton";
import { TimelineScreenProps } from "../types";
import TimelineItem from "../components/TimelineItem";
import { AntDesign, Entypo, Ionicons } from "@expo/vector-icons";
import DateList from "../../../../components/DateList/DateList";
import useUser from "../../../../utils/hooks/useUser";
import { gql, useQuery } from "@apollo/client";
import NotFound from "../../Home/components/NotFound";
import BottomSheet from "@gorhom/bottom-sheet";
import CreateTimeLineEventModal from "./TimelineCreate";

export const GET_MONTHLY_EVENTS = gql`
  query GetMonthlyEvents($date: String!) {
    timelineMonth(date: $date) {
      date
    }
  }
`;

const groupDates = (dates: { date: string }[]) => {
  const monthEvents = {} as {
    [date: string]: number;
  };

  for (let { date } of dates) {
    !!monthEvents[date] ? (monthEvents[date] += 1) : (monthEvents[date] = 1);
  }

  return monthEvents;
};

const Loader = (props: { loading: boolean }) =>
  props.loading ? (
    <View style={{ padding: 10 }}>
      <Skeleton
        backgroundColor={Colors.primary_light}
        highlightColor={Colors.primary_lighter}
        size={({ width }) => ({
          width: width - 20,
          height: ((65 + 10) * 3 + 40) * 2 + 30,
        })}
      >
        <View>
          <Skeleton.Item width={(w) => w / 2} height={30} />
          <Skeleton.Item width={(w) => w - 20} height={65} />
          <Skeleton.Item width={(w) => w - 20} height={65} />
          <Skeleton.Item width={(w) => w - 20} height={65} />

          <Skeleton.Item marginTop={30} width={(w) => w / 2} height={30} />
          <Skeleton.Item width={(w) => w - 20} height={65} />
          <Skeleton.Item width={(w) => w - 20} height={65} />
          <Skeleton.Item width={(w) => w - 20} height={65} />
        </View>
      </Skeleton>
    </View>
  ) : null;

const iconColor = "#fff";

export default function Timeline({
  navigation,
}: TimelineScreenProps<"Timeline">) {
  const { data, selected, setSelected, loading } = useGetTimeLineQuery();

  const usr = useUser();

  const { data: monthData, refetch } = useQuery(GET_MONTHLY_EVENTS, {
    variables: { date: moment().format("YYYY-MM-DD") },
    context: {
      headers: {
        authentication: usr.token,
      },
    },
    onError: (err) => console.log(JSON.stringify(err, null, 2)),
  });

  const onDayPress = (day: { dateString: string }) =>
    setSelected(day.dateString);

  const createTimeline = () =>
    navigation.navigate("TimelineCreate", { selectedDate: selected });

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, []);

  const dayEventsSorted = useMemo(
    () => groupDates(monthData?.timelineMonth || []),
    [monthData?.timelineMonth]
  );

  const displayDate =
    moment().format("YYYY-MM-DD") === selected
      ? `Today (${selected})`
      : selected;

  const [switchView, setSwitchView] = useState<"date-list" | "calendar">(
    "date-list"
  );

  const onViewToggle = () => {
    setSwitchView((sw) => (sw === "calendar" ? "date-list" : "calendar"));
  };

  return (
    <ScrollView>
      {switchView === "calendar" && (
        <Calendar
          selected={selected}
          monthData={monthData}
          refetch={refetch}
          onDayPress={onDayPress}
        />
      )}

      {switchView === "date-list" && (
        <DateList
          onMenuPress={() => setSwitchView("calendar")}
          dayEvents={dayEventsSorted}
          selectedDate={selected}
          setSelected={setSelected}
        />
      )}

      <View style={timelineStyles.dateRow}>
        <Text style={timelineStyles.dayHeader}>{displayDate}</Text>

        <Ripple
          onPress={onViewToggle}
          style={{
            paddingHorizontal: 10,
          }}
        >
          {switchView === "calendar" ? (
            <AntDesign name="calendar" color={iconColor} size={24} />
          ) : (
            <Ionicons name="list" size={24} color={iconColor} />
          )}
        </Ripple>
      </View>

      <ListContainer
        date={selected}
        list={data?.timeline || []}
        navigation={navigation}
        onPress={createTimeline}
      />

      <Loader loading={loading} />

      {!loading && data?.timeline.length === 0 && (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 50,
          }}
        >
          <NotFound />
        </View>
      )}
    </ScrollView>
  );
}

const ListContainer = (props: {
  list: any[];
  onPress: () => void;
  navigation: any;
  date: string;
}) => (
  <View style={timelineStyles.listHeading}>
    <View style={timelineStyles.listHeadingContainer}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={timelineStyles.listHeadingText}>My events</Text>

        <Ripple
          style={{ padding: 2.5, marginLeft: 10 }}
          onPress={() =>
            props.navigation.navigate("Schedule", {
              selectedDate: props.date,
            })
          }
        >
          <Entypo name="list" color={"#fff"} size={25} />
        </Ripple>
      </View>

      <Ripple
        style={{
          padding: 7.5,
          paddingHorizontal: 10,
          backgroundColor: Colors.secondary,
          borderRadius: 25,
        }}
        onPress={props.onPress}
      >
        <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 13 }}>
          CREATE EVENT
        </Text>
      </Ripple>
    </View>

    {props.list.map((timeline) => (
      <TimelineItem
        styles={{
          backgroundColor: Colors.primary_lighter,
          borderRadius: 15,
          padding: 20,
          marginBottom: 10,
        }}
        key={timeline.id}
        location="timeline"
        {...timeline}
      />
    ))}
  </View>
);
