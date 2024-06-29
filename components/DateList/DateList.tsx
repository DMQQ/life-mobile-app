import moment, { Moment } from "moment";
import { memo, useCallback, useLayoutEffect, useRef, useState } from "react";
import { View, VirtualizedList, Text } from "react-native";
import Date from "./Date";
import MonthSelectList from "./MonthSelectList";
import { createDates } from "./fns";
import { Padding } from "@/constants/Values";
import { useNavigation } from "@react-navigation/native";

interface DateListProps {
  selectedDate: string;
  setSelected: React.Dispatch<React.SetStateAction<string>>;
  onMenuPress: Function;
  dayEvents: {
    [key: string]: number;
  };
}

const date = (today: Moment, month: string) => {
  const year = today.year();
  const monthIndex = moment.months().indexOf(month);
  return moment([year, monthIndex]).format("YYYY-MM-DD");
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

    const [dates, setDates] = useState<string[]>(createDates(moment()));

    const listRef = useRef<VirtualizedList<string>>(null);

    function onMonthChange(newMonth: string) {
      const realDate = moment();

      const dt = date(today, newMonth);
      const newDates = createDates(moment(dt));

      if (newMonth === moment.months()[realDate.month()]) {
        setSelected(realDate.format("YYYY-MM-DD"));
      } else {
        const firstOfMonth = [...dt.split("-").slice(0, 2), "01"].join("-");
        setSelected(firstOfMonth);
      }

      setDates(newDates);
      setMonth(newMonth);
    }

    useLayoutEffect(() => {
      listRef.current?.scrollToItem({
        item: dates.find((d) => d === selectedDate)!,
        animated: true,
      });
    }, [month]);

    const snapOffsets = dates.map((_, index) => (75 + Padding.xs * 2) * index);

    const navigation = useNavigation<any>();

    const renderItem = useCallback(
      ({ item }: { item: string }) => (
        <Date
          tasks={dayEvents[item] || 0}
          date={item}
          isSelected={selectedDate === item}
          onPress={() => setSelected(item)}
          onLongPress={() => {
            setSelected(item);
            navigation.navigate("TimelineCreate", {
              selectedDate: item,
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
              padding: Padding.m,
              fontWeight: "bold",
            }}
          >
            {moment.months()[today.month()]} {moment(selectedDate).year()}
          </Text>
        </View>
        <MonthSelectList selected={month} onPress={onMonthChange} />
        <VirtualizedList
          initialNumToRender={today.get("d") < 5 ? 5 : 31}
          snapToOffsets={snapOffsets}
          removeClippedSubviews
          showsHorizontalScrollIndicator={false}
          getItemLayout={getItemLayout}
          ref={listRef}
          horizontal
          getItem={(arr, i) => arr[i] as any}
          getItemCount={(it) => it.length}
          data={dates}
          keyExtractor={(item) => item}
          renderItem={renderItem}
        />
      </View>
    );
  }
);

export default DateList;
