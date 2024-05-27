import moment, { Moment } from "moment";
import { memo, useCallback, useLayoutEffect, useRef, useState } from "react";
import { View, VirtualizedList, Text } from "react-native";
import Date from "./Date";
import MonthSelectList from "./MonthSelectList";
import { createDates } from "./fns";
import { Padding } from "@/constants/Values";
import { useNavigation } from "@react-navigation/native";

type TDate = {
  date: string;
};

interface DateListProps {
  selectedDate: string;
  setSelected: React.Dispatch<React.SetStateAction<string>>;
  onMenuPress: Function;
  dayEvents: {
    [key: string]: number;
  };
}

const date = (today: Moment, month: string) => {
  const day = today.date().toString();

  const _month = moment.months().findIndex((m) => m === month) + 1; // human readable date
  const _monthStr = _month < 10 ? "0" + _month : _month;
  const _dayStr = +day < 10 ? "0" + day : day;
  const newDate = `${today.year()}-${_monthStr}-${_dayStr}`;

  return newDate;
};

const getItemLayout = (_: any, index: number) => ({
  index,
  length: 75,
  offset: (75 + 5 * 2) * index,
});

const DateList = memo(
  ({ selectedDate, setSelected, dayEvents, onMenuPress }: DateListProps) => {
    const today = moment(selectedDate);
    const [month, setMonth] = useState(moment.months()[today.month()]);

    const [dates, setDates] = useState<TDate[]>(createDates(today));

    const listRef = useRef<VirtualizedList<TDate>>(null);

    function onMonthChange(newMonth: string) {
      if (newMonth === month) return;

      const realDate = moment();

      const dt = date(today, newMonth);
      const newDates = createDates(moment(dt));

      setDates(newDates);

      if (newMonth === moment.months()[realDate.month()]) {
        setSelected(realDate.format("YYYY-MM-DD"));
      } else {
        const firstOfMonth = [...dt.split("-").slice(0, 2), "01"].join("-");
        setSelected(firstOfMonth);
      }

      setMonth(newMonth);
    }

    useLayoutEffect(() => {
      listRef.current?.scrollToItem({
        item: dates.find((d) => d.date === selectedDate)!,
        animated: true,
      });
    }, [month]);

    const snapOffsets = dates.map((_, index) => (75 + Padding.xs * 2) * index);

    const navigation = useNavigation<any>();

    const renderItem = useCallback(
      ({ item }: { item: TDate }) => (
        <Date
          tasks={dayEvents[item.date] || 0}
          {...item}
          isSelected={selectedDate === item.date}
          onPress={() => setSelected(item.date)}
          onLongPress={() => {
            setSelected(item.date);
            navigation.navigate("TimelineCreate", {
              selectedDate: item.date,
            });
          }}
        />
      ),
      [selectedDate, dayEvents]
    );

    return (
      <View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: Padding.m,
          }}
        >
          <Text
            style={{
              color: "#ffffffda",
              fontSize: 30,
              padding: Padding.l,
              fontWeight: "bold",
            }}
          >
            {moment.months()[today.month()]} {moment(selectedDate).year()}
          </Text>
        </View>
        <MonthSelectList selected={month} onPress={onMonthChange} />
        <VirtualizedList
          initialNumToRender={5}
          snapToOffsets={snapOffsets}
          removeClippedSubviews
          showsHorizontalScrollIndicator={false}
          getItemLayout={getItemLayout}
          ref={listRef}
          horizontal
          getItem={(arr, i) => arr[i] as any}
          getItemCount={(it) => it.length}
          data={dates}
          keyExtractor={(item) => item.date}
          renderItem={renderItem}
        />
      </View>
    );
  }
);

export default DateList;
