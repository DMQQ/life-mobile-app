import moment, { Moment } from "moment";
import { Action, Filters } from "../../hooks/useGetWallet";
import { useState } from "react";
import { ScrollView } from "react-native";
import Layout from "@/constants/Layout";
import Button from "@/components/ui/Button/Button";
import Colors from "@/constants/Colors";
import lowOpacity from "@/utils/functions/lowOpacity";
import Color from "color";

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
    ["Last 30 days", [moment().subtract(30, "days"), moment()]],
    ["This month", [moment().startOf("month"), moment().endOf("month")]],
    ["Last month", [moment().subtract(1, "month").startOf("month"), moment().subtract(1, "month").endOf("month")]],
    ["This year", [moment().startOf("year"), moment().endOf("year")]],
  ].reverse() as [string, [Moment, Moment]][];

  const [selected, setSelected] = useState("This year");

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
      showsHorizontalScrollIndicator={false}
      horizontal
      style={{
        width: Layout.screen.width - 30,
      }}
    >
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

export default DateRangePicker;
