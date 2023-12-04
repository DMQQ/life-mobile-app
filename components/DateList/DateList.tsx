import moment, { Moment } from "moment";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { View, VirtualizedList, Text } from "react-native";
import Date from "./Date";
import MonthSelectList from "./MonthSelectList";
import { createDates, createFutureDates } from "./fns";

type TDate = {
  date: string;
  dayName: string;
  dayNumber: number;
};

interface DateListProps {
  selectedDate: string;
  setSelected: React.Dispatch<React.SetStateAction<string>>;

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

export default function DateList({
  selectedDate,
  setSelected,
  dayEvents,
}: DateListProps) {
  const today = moment();
  const [dates, setDates] = useState<TDate[]>(createDates());
  const [month, setMonth] = useState(moment.months()[today.month()]);

  const listRef = useRef<VirtualizedList<TDate>>(null);

  function onMonthChange(newMonth: string) {
    if (newMonth === month) return;

    const dt = date(today, newMonth);
    const newDates = createDates(dt);

    setDates(newDates);

    if (newMonth === moment.months()[today.month()]) {
      setSelected(today.format("YYYY-MM-DD"));
    } else {
      const firstOfMonth = [...dt.split("-").slice(0, 2), "01"].join("-");
      setSelected(firstOfMonth);
    }

    setMonth(newMonth);
  }

  useLayoutEffect(() => {
    listRef.current?.scrollToItem({
      item: dates.find((d) => d.date === selectedDate)!,
      animated: false,
    });
  }, [month]);

  const onEndReached = () => {
    setDates((prev) => [
      ...prev,
      ...createFutureDates(dates[dates.length - 1].date, 5),
    ]);
  };

  const getItemLayout = (_: any, index: number) => ({
    index,
    length: 75,
    offset: (75 + 5 * 2) * index,
  });

  const snapOffsets = dates.map((_, index) => (75 + 10) * index);

  return (
    <View>
      <Text
        style={{
          color: "#ffffffda",
          fontSize: 30,
          padding: 15,
          fontWeight: "bold",
        }}
      >
        {month} {moment(selectedDate).year()}
      </Text>
      <MonthSelectList selected={month} onPress={onMonthChange} />
      <VirtualizedList
        //  snapToOffsets={snapOffsets}
        // style={{ padding: 5 }}
        removeClippedSubviews
        onEndReached={onEndReached}
        showsHorizontalScrollIndicator={false}
        getItemLayout={getItemLayout}
        ref={listRef}
        horizontal
        getItem={(arr, i) => arr[i] as any}
        getItemCount={(it) => it.length}
        data={dates}
        keyExtractor={(item) => item.date}
        renderItem={({ item }) => (
          <Date
            tasks={dayEvents[item.date] || 0}
            {...item}
            isSelected={selectedDate === item.date}
            onPress={() => setSelected(item.date)}
          />
        )}
      />
    </View>
  );
}
