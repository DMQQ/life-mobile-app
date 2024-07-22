import ThemedCalendar from "@/components/ui/ThemedCalendar/ThemedCalendar";
import Colors from "@/constants/Colors";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { memo, useState } from "react";
import { View } from "react-native";

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
      <View style={{ marginTop: 10 }}>
        <ThemedCalendar
          onDayPress={onDayPress}
          markedDates={{
            [selectedDate]: {
              selected: true,
              selectedColor: Colors.secondary,
            },
          }}
        />
      </View>
    );
  },
  (prev, next) => prev.date === next.date
);

export default ChooseDate;
