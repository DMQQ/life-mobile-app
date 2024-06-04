import { gql, useQuery } from "@apollo/client";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import useGetTimeLineQuery from "../query/useGetTimeLineQuery";
import { TimelineScreenProps } from "../../types";
import { InteractionManager, ToastAndroid } from "react-native";

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

export default function useTimeline({
  route,
  navigation,
}: TimelineScreenProps<"Timeline">) {
  const { data, selected, setSelected, loading } = useGetTimeLineQuery();

  const [fetchDate, setFetchDate] = useState(moment().format("YYYY-MM-DD"));

  useEffect(() => {
    const selectedMonth = moment(selected).month();
    const currentMonth = moment(fetchDate).month();

    if (selectedMonth !== currentMonth) {
      setFetchDate(selected);
    }
  }, [selected]);

  const { data: monthData, refetch } = useQuery(GET_MONTHLY_EVENTS, {
    variables: { date: fetchDate },

    onError: (err) =>
      ToastAndroid.show("Oh! Something went wrong", ToastAndroid.SHORT),
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

  return {
    data,
    selected,
    setSelected,
    loading,
    monthData,
    refetch,
    onDayPress,
    createTimeline,
    dayEventsSorted,
    displayDate,
    switchView,
    setSwitchView,
    onViewToggle,
  };
}
