import moment, { Moment } from "moment";
import { Action, Filters } from "../WalletContext";
import { useEffect, useState } from "react";
import { ScrollView, Text } from "react-native";
import Layout from "@/constants/Layout";
import Button from "@/components/ui/Button/Button";
import Colors from "@/constants/Colors";
import lowOpacity from "@/utils/functions/lowOpacity";
import Color from "color";
import DateTimePicker from "react-native-modal-datetime-picker";

const button = {
  padding: 10,
  paddingHorizontal: 15,
  borderRadius: 7.5,
  backgroundColor: Colors.primary_light,
};

const blueText = Color(Colors.primary).lighten(10).string();

const DateRangePicker = (props: { filters: Filters; dispatch: React.Dispatch<Action> }) => {
  const DateRanges = [
    ["Today", [moment(), moment().add(1, "day")]],
    ["Yesterday", [moment().subtract(1, "day"), moment()]],
    ["Last 7 days", [moment().subtract(7, "days"), moment().add(1, "day")]],
    ["This month", [moment().startOf("month"), moment().endOf("month")]],
    ["Last month", [moment().subtract(1, "month").startOf("month"), moment().subtract(1, "month").endOf("month")]],
    ["This year", [moment().startOf("year"), moment().endOf("year")]],
    ["Last year", [moment().subtract(1, "year").startOf("year"), moment().subtract(1, "year").endOf("year")]],
    ["All time", [moment("2020-01-01"), moment()]],
  ] as [string, [Moment, Moment]][];

  // useEffect(() => {
  //   if (!(props.filters.date.from && props.filters.date.to)) {
  //     const defaultDateRange = DateRanges.find(([label]) => label === "This month");
  //     onDateChange(defaultDateRange![0], defaultDateRange![1][0], defaultDateRange![1][1]);
  //   }
  // }, [props.filters?.date.from, props.filters?.date.to]);

  const [selected, setSelected] = useState("This month");

  const onDateChange = (label: string, from: Moment, to: Moment) => {
    if (label === selected) {
      props.dispatch({ type: "SET_DATE_MAX", payload: "" });
      props.dispatch({ type: "SET_DATE_MIN", payload: "" });
      setSelected("");
      return;
    }
    props.dispatch({
      type: "SET_DATE_MIN",
      payload: from.format("YYYY-MM-DD"),
    });
    props.dispatch({ type: "SET_DATE_MAX", payload: to.format("YYYY-MM-DD") });
    setSelected(label);
  };

  return (
    <ScrollView
      keyboardDismissMode={"on-drag"}
      showsHorizontalScrollIndicator={false}
      horizontal
      style={{
        width: Layout.screen.width - 30,
        marginBottom: 10,
      }}
    >
      <CustomDatePicker setSelected={() => setSelected("Custom")} dispatch={props.dispatch} filters={props.filters} selected={selected} />
      {DateRanges.map(([label, [from, to]]) => (
        <Button
          variant="text"
          key={label.toString()}
          onPress={() => onDateChange(label, from, to)}
          fontStyle={{
            fontSize: 14,
            color: selected === label ? Colors.secondary : blueText,
          }}
          style={[
            button,
            {
              borderWidth: 0.5,
              borderColor: Colors.primary,
              marginRight: 10,
              ...(selected === label && {
                backgroundColor: lowOpacity(Colors.secondary, 0.15),
                borderWidth: 0.5,
                borderColor: lowOpacity(Colors.secondary, 0.5),
              }),
            },
          ]}
        >
          {label}
        </Button>
      ))}
    </ScrollView>
  );
};

const CustomDatePicker = (props: { filters: Filters; dispatch: React.Dispatch<Action>; selected: string; setSelected: () => void }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState<Moment | null>(null);
  const [endDate, setEndDate] = useState<Moment | null>(null);

  const [lastPressed, setLastPressed] = useState<"start" | "end">("start");

  const customDate = startDate && endDate ? [startDate, endDate] : null;

  const isValidDate = (start: Moment | null, end: Moment | null) => {
    return start && end ? start.isValid() && end.isValid() && start.isBefore(end) : true;
  };

  useEffect(() => {
    if (props.selected !== "Custom") {
      setStartDate(null);
      setEndDate(null);
      setLastPressed("start");
    }
  }, [props.selected]);

  useEffect(() => {
    if (customDate && isValidDate(startDate, endDate)) {
      if (startDate) props.dispatch({ type: "SET_DATE_MIN", payload: startDate.format("YYYY-MM-DD") });
      if (endDate) props.dispatch({ type: "SET_DATE_MAX", payload: endDate.format("YYYY-MM-DD") });
    }
  }, [showDatePicker, startDate, endDate]);

  return (
    <>
      <Button
        onPress={() => {
          setShowDatePicker(true);
          props.setSelected();
          setLastPressed("start");
        }}
        variant="text"
        fontStyle={{
          fontSize: 14,
          color: !!customDate ? Colors.secondary : blueText,
        }}
        style={[
          button,
          {
            borderWidth: 0.5,
            borderColor: Colors.primary,
            marginRight: 10,
            ...(!!customDate && {
              backgroundColor: lowOpacity(Colors.secondary, 0.15),
              borderWidth: 0.5,
              borderColor: lowOpacity(Colors.secondary, 0.5),
            }),

            ...(!isValidDate(startDate, endDate) && {
              backgroundColor: lowOpacity(Colors.error, 0.15),
              borderWidth: 0.5,
              borderColor: lowOpacity(Colors.error, 0.5),
            }),
          },
        ]}
      >
        {startDate || endDate ? (
          <>
            <Text
              style={{
                color: lastPressed === "start" && showDatePicker ? Colors.foreground : Colors.secondary,
              }}
            >
              {startDate && startDate.format("DD/MM/YYYY")}
            </Text>
            <Text>{" - "}</Text>
            <Text
              style={{
                color: lastPressed === "end" && showDatePicker ? Colors.foreground : Colors.secondary,
              }}
            >
              {endDate && endDate.format("DD/MM/YYYY")}
            </Text>
          </>
        ) : (
          <Text>Custom</Text>
        )}
      </Button>
      <DateTimePicker
        mode="date"
        isVisible={showDatePicker}
        onConfirm={(date: Date) => {
          const momentDate = moment(date);
          if (lastPressed === "start") {
            setStartDate(momentDate);
            setLastPressed("end");
          } else {
            setEndDate(momentDate);
            setLastPressed("start");
            setShowDatePicker(false);
          }
        }}
        onCancel={() => setShowDatePicker(false)}
      />
    </>
  );
};

export default DateRangePicker;
