import Button from "@/components/ui/Button/Button";
import ThemedCalendar from "@/components/ui/ThemedCalendar/ThemedCalendar";
import Colors from "@/constants/Colors";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import moment from "moment";
import { memo, useEffect, useState } from "react";
import { Platform, View } from "react-native";

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

    useEffect(() => {
      setSelectedDate(moment(date).format("YYYY-MM-DD"));
    }, [date]);

    const onDayPress = (day: { dateString: string; timestamp: number }) => {
      setSelectedDate(day.dateString);

      console.log(day);

      if (Platform.OS === "ios") {
        setDateField(new Date(day.timestamp));
        onDismissCalendar();
      } else {
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
      }
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

        <Button
          onPress={onDismissCalendar}
          fontStyle={{ fontSize: 16 }}
          style={{ marginTop: 25 }}
        >
          Close Calendar
        </Button>
      </View>
    );
  },
  (prev, next) => prev.date === next.date
);

export default ChooseDate;
