import moment from "moment";
import { Calendar as RNCalendar } from "react-native-calendars";
import Colors from "../../constants/Colors";
import { AntDesign } from "@expo/vector-icons";
import { useState, useMemo } from "react";
import { DateData, MarkedDates } from "react-native-calendars/src/types";
import { ApolloQueryResult } from "@apollo/client";
import { StyleSheet, View } from "react-native";
import Text from "@/components/ui/Text/Text";
import { useTheme } from "@/utils/context/ThemeContext";

interface CalendarProps {
  onDayPress: (day: DateData) => void;

  monthData: {
    timelineMonth?: {
      date: string;
    }[];
  };

  selected: string;

  refetch: (
    variables?:
      | Partial<{
          date: string;
        }>
      | undefined
  ) => Promise<ApolloQueryResult<any>>;
}

const styles = StyleSheet.create({
  calendar: {
    backgroundColor: Colors.primary,
    calendarBackground: Colors.primary,
    dayTextColor: Colors.foreground,
    textDisabledColor: "#5e5e5e",
    monthTextColor: Colors.secondary,
    textMonthFontSize: 20,
    textMonthFontWeight: "bold",
    selectedDayBackgroundColor: Colors.secondary,
    arrowColor: Colors.secondary,
  },
});

export default function Calendar({ onDayPress, refetch, selected: propSelected, monthData: data }: CalendarProps) {
  const onMonthChange = async (date: { dateString: string }) =>
    await refetch({
      date: moment(date.dateString).format("YYYY-MM-DD"),
    });

  const renderArrow = (direction: "left" | "right") => <AntDesign name={`arrow${direction}`} color={Colors.secondary} size={20} />;

  const [selected, setSelected] = useState(propSelected || "");

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
      selectedColor: Colors.secondary,
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
