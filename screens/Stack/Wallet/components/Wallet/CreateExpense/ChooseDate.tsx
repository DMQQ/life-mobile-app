import Colors from "@/constants/Colors";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { memo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Calendar } from "react-native-calendars";

const ChooseDate = memo(
  ({
    onDismissCalendar,
    setDateField,
    date,
  }: {
    onDismissCalendar: () => void;
    setDateField: (date: Date) => void;
    date: string;
  }) => {
    const [selectedDate, setSelectedDate] = useState(date);

    const onDayPress = (day: { dateString: string }) => {
      setSelectedDate(day.dateString);
      DateTimePickerAndroid.open({
        value: new Date(day.dateString),
        mode: "time",
        display: "clock",
        onChange: (event, date) => {
          if (event.type === "set" && date instanceof Date) {
            setDateField(date);
            onDismissCalendar();
            DateTimePickerAndroid.dismiss("time");
          }
        },
      });
    };

    return (
      <View>
        <Calendar
          onDayPress={onDayPress}
          markedDates={{
            [selectedDate]: {
              selected: true,
              selectedColor: Colors.secondary,
            },
          }}
          theme={styles.calendar}
          style={styles.calendarContainer}
        />
      </View>
    );
  },
  (prev, next) => prev.date === next.date
);

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

  calendarContainer: { borderRadius: 15, marginTop: 10, paddingBottom: 5 },
});

export default ChooseDate;
