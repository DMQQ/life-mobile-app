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
import { TimelineScreenLoader } from "../components/LoaderSkeleton";
import ListContainer from "../components/ListContainer";
import { Padding } from "@/constants/Layout";

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

const iconColor = "#fff";

export default function Timeline({
  navigation,
}: TimelineScreenProps<"Timeline">) {
  const { data, selected, setSelected, loading } = useGetTimeLineQuery();

  const { data: monthData, refetch } = useQuery(GET_MONTHLY_EVENTS, {
    variables: { date: moment().format("YYYY-MM-DD") },

    onError: (err) => console.log(JSON.stringify(err, null, 2)),
  });

  const onDayPress = (day: { dateString: string }) =>
    setSelected(day.dateString);

  const createTimeline = () =>
    navigation.navigate("TimelineCreate", {
      selectedDate: selected,
      mode: "create",
    });

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
    <ScrollView showsVerticalScrollIndicator={false}>
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

      <TimelineScreenLoader loading={loading} />

      {!loading && data?.timeline.length === 0 && (
        <View style={timelineStyles.notFoundContainer}>
          <NotFound />
        </View>
      )}
    </ScrollView>
  );
}
