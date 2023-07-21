import moment from "moment";
import { Calendar as RNCalendar } from "react-native-calendars";
import Colors from "../../constants/Colors";
import { AntDesign } from "@expo/vector-icons";
import { useState, useMemo } from "react";
import { DateData, MarkedDates } from "react-native-calendars/src/types";
import { gql, useQuery } from "@apollo/client";
import useUser from "../../utils/hooks/useUser";
import { StyleSheet } from "react-native";

interface CalendarProps {
  onDayPress: (day: DateData) => void;
}

const GET_MONTHLY_EVENTS = gql`
  query GetMonthlyEvents($date: String!) {
    timelineMonth(date: $date) {
      date
    }
  }
`;

const styles = StyleSheet.create({
  calendar: {
    backgroundColor: Colors.primary,
    calendarBackground: Colors.primary,
    dayTextColor: "#fff",
    textDisabledColor: "#5e5e5e",
    monthTextColor: Colors.secondary,
    textMonthFontSize: 20,
    textMonthFontWeight: "bold",
    selectedDayBackgroundColor: Colors.secondary,
    arrowColor: Colors.secondary,
  },
});

export default function Calendar({ onDayPress }: CalendarProps) {
  const usr = useUser();

  const { data, refetch } = useQuery(GET_MONTHLY_EVENTS, {
    variables: { date: moment().format("YYYY-MM-DD") },
    context: {
      headers: {
        authentication: usr.token,
      },
    },
    onError: (err) => console.log(JSON.stringify(err, null, 2)),
  });

  const onMonthChange = async (date: { dateString: string }) =>
    await refetch({
      date: moment(date.dateString).format("YYYY-MM-DD"),
    });

  const renderArrow = (direction: "left" | "right") => (
    <AntDesign name={`arrow${direction}`} color={Colors.secondary} size={20} />
  );

  const [selected, setSelected] = useState("");

  const markedDates: MarkedDates = useMemo(() => {
    const marked: MarkedDates = {};
    (data?.timelineMonth as { date: string }[])?.forEach((event) => {
      const existing = (marked[event.date]?.dots as any[]) || [];

      marked[event.date] = {
        dots: [
          ...existing,
          {
            color: "#6186D2",
          },
        ].slice(0, 3),
      };
    });

    marked[selected] = {
      selected: true,
      selectedColor: "#6186D2",
    };

    return marked;
  }, [selected, data?.timelineMonth]);

  return (
    <RNCalendar
      markingType="multi-dot"
      onMonthChange={onMonthChange}
      enableSwipeMonths
      markedDates={markedDates}
      onDayPress={(event) => {
        setSelected(event.dateString);
        onDayPress(event);
      }}
      renderArrow={renderArrow}
      theme={styles.calendar as any}
    />
  );
}
