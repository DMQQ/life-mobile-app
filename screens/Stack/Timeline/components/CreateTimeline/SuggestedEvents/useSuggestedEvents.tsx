import moment from "moment";
import { useState } from "react";
import { CommonEvents } from "../CommonEvents.data";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { InitialValuesType } from "../../../hooks/mutation/useCreateTimeline";

type EventType = (typeof CommonEvents)[0];

export default function useSuggestedEvents(props: {
  createTimelineAsync: (input: InitialValuesType) => Promise<void>;
  initialValues: InitialValuesType;
}) {
  const [selected, setSelected] = useState<Partial<EventType>>({});

  const [subCategory, setSubCategory] = useState<string>("");

  const [time, setTime] = useState<Date>();

  const handleSelectQuickOption = (item: (typeof CommonEvents)[0]) => {
    setSelected((prev) => (prev.name === item.name ? {} : item));
    setSubCategory("");
    setTime(undefined);
  };

  const handleSelectSubCategory = (sub: string) => {
    setSubCategory((prev) => (prev === sub ? "" : sub));
  };

  const handleSetTime = (date:Date) => {
   setTime(date)
  };

  const endTime = moment(time)
    .add(1, "hour")
    .toDate()
    .toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  const handleSubmit = async () => {
    if (time === undefined) return;

    let title = selected.name as string;
    if (subCategory) title += ` - ${subCategory}`;

    const _time = {
      begin: time?.toLocaleTimeString("pl-PL", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })!,
      end: endTime,
    };

    const finalData = {
      title,
      desc: selected.content || "",
      ..._time,
      tags: "pre-made-event",
      date: moment().format("YYYY-MM-DD"),
    };

    await props.createTimelineAsync({ ...props.initialValues, ...finalData });

    setTime(undefined);
    setSelected({});
    setSubCategory("");
  };

  return {
    selected,
    subCategory,
    time,
    handleSelectQuickOption,
    handleSelectSubCategory,
    handleSetTime,
    handleSubmit,
    endTime,
  };
}
