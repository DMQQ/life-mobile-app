import Colors from "@/constants/Colors";
import { StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";

export default function ThemedCalendar(props: any) {
  return (
    <Calendar
      {...props}
      theme={styles.calendar}
      style={[styles.calendarContainer]}
    />
  );
}

const styles = StyleSheet.create({
  calendar: {
    backgroundColor: Colors.primary_light,
    calendarBackground: Colors.primary_light,
    dayTextColor: "#fff",
    textDisabledColor: "#5e5e5e",
    monthTextColor: Colors.secondary,
    textMonthFontSize: 20,
    textMonthFontWeight: "bold",
    selectedDayBackgroundColor: Colors.secondary,
    arrowColor: Colors.secondary,
  },

  calendarContainer: { borderRadius: 15, paddingBottom: 5 },
});
