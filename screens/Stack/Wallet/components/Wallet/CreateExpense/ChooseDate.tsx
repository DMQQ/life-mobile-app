import Button from "@/components/ui/Button/Button";
import Radio, { RadioGroup } from "@/components/ui/Radio/Radio";
import ThemedCalendar from "@/components/ui/ThemedCalendar/ThemedCalendar";
import Colors from "@/constants/Colors";
import { AntDesign } from "@expo/vector-icons";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import moment from "moment";
import { memo, useEffect, useState } from "react";
import { Platform, Text, View } from "react-native";
import Ripple from "react-native-material-ripple";

interface ChooseDateProps {
  onDismissCalendar: () => void;
  setDateField: (date: Date) => void;
  date: string;

  schedule: boolean;
  onScheduleToggle: () => void;
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

      <Ripple
        onPress={onScheduleToggle}
        style={{
          marginTop: 15,
          backgroundColor: Colors.primary_lighter,
          padding: 15,
          borderRadius: 15,
          flexDirection: "row",
          gap: 15,
          alignItems: "center",
        }}
      >
        <AntDesign name={schedule ? "checkcircle" : "checkcircleo"} size={24} color="#fff" />
        <Text style={{ color: "#fff", fontSize: 16 }}>
          Schedule expense for: {"  "}
          <Text
            style={{
              fontWeight: "bold",
              color: Colors.secondary,
              borderRadius: 30,
              fontSize: 18,
            }}
          >
            {moment(selectedDate).format("YYYY-MM-DD")}
          </Text>
        </Text>
      </Ripple>

      <Button onPress={onDismissCalendar} fontStyle={{ fontSize: 16 }} style={{ marginTop: 25 }}>
        Close Calendar
      </Button>
    </View>
  );
});

export default ChooseDate;
