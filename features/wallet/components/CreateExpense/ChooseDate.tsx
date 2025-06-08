import Button from "@/components/ui/Button/Button";
import ThemedCalendar from "@/components/ui/ThemedCalendar/ThemedCalendar";
import Colors from "@/constants/Colors";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import moment from "moment";
import { memo, useEffect, useState } from "react";
import { Platform, Text, View } from "react-native";
import Animated, { SlideInDown, SlideInUp, SlideOutDown } from "react-native-reanimated";

interface ChooseDateProps {
  onDismissCalendar: () => void;
  setDateField: (date: Date) => void;
  date: string;

  schedule: boolean;
  onScheduleToggle: (isScheduled: boolean) => void;
}

const ChooseDate = memo(({ onDismissCalendar, setDateField, date, schedule, onScheduleToggle }: ChooseDateProps) => {
  const [selectedDate, setSelectedDate] = useState(date);

  useEffect(() => {
    setSelectedDate(moment(date).format("YYYY-MM-DD"));
  }, [date]);

  const onDayPress = (day: { dateString: string; timestamp: number }) => {
    setSelectedDate(day.dateString);

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

    const isScheduled = moment(day.dateString).isAfter(moment());

    onScheduleToggle(isScheduled);
  };

  return (
    <Animated.View style={{ marginTop: 10 }} entering={SlideInDown} exiting={SlideOutDown}>
      <ThemedCalendar
        onDayPress={onDayPress}
        markedDates={{
          [selectedDate]: {
            selected: true,
            selectedColor: Colors.secondary,
          },
        }}
      />
      <Text style={{ color: "gray", marginTop: 15, fontSize: 12 }}>
        Selecting a date will also select the time of the day. You can change the time by selecting the date again.
        {"\n\n"}
        If you want to schedule the expense for a specific date and time that is greater than the current date and time,
      </Text>

      <Button onPress={onDismissCalendar} fontStyle={{ fontSize: 16 }} style={{ marginTop: 25 }}>
        Close Calendar
      </Button>
    </Animated.View>
  );
});

export default ChooseDate;
