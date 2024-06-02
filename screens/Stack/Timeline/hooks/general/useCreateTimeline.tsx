import { useEffect, useState } from "react";
import { useFormik } from "formik";
import moment from "moment";
import useCreateTimelineMutation from "../mutation/useCreateTimeline";
import useGetTimelineById from "../query/useGetTimelineById";
import useEditTimeline from "../mutation/useEditTimeline";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import TimelineCreateHeader from "../../components/CreateTimeline/TimelineCreateHeader";
import { TimelineScreenProps } from "../../types";

export default function useCreateTimeline({
  route,
  navigation,
}: TimelineScreenProps<"TimelineCreate">) {
  const {
    handleSubmit,
    initialValues,
    validationSchema,
    state: { loading: isLoading },
  } = useCreateTimelineMutation({
    selectedDate: route.params.selectedDate,
  });

  const isEditing = route.params.mode === "edit";

  const { data } = useGetTimelineById(route.params.timelineId || "", {
    skip: !isEditing,
  });

  const { editTimeline, initialFormProps: initialEditFormValues } =
    useEditTimeline(route.params.timelineId || "", isEditing);

  const initialFormValues =
    isEditing && data !== undefined
      ? initialEditFormValues
      : {
          ...initialValues,
          date: route.params.selectedDate,
          begin: moment().format("HH:mm:ss"),
          end: moment().add(1, "hours").format("HH:mm:ss"),
          notification: "none",
        };

  const formikSubmitForm = async (input: typeof initialFormValues) => {
    if (isEditing) {
      await editTimeline(input, route.params.selectedDate);
    } else {
      await handleSubmit(input);
    }
  };

  const f = useFormik({
    onSubmit: formikSubmitForm,
    validationSchema: validationSchema,
    initialValues: initialFormValues,
    enableReinitialize: isEditing,
  });

  const timePicker = (formik: any, type: "begin" | "end") => {
    DateTimePickerAndroid.open({
      value: new Date(),
      mode: "time",
      display: "default",

      is24Hour: true,

      onChange: (_, date) =>
        formik.setFieldValue(type, moment(date).format("HH:mm:ss")),
    });
  };

  const handleChangeDate = () => {
    DateTimePickerAndroid.open({
      value: moment(route.params.selectedDate).toDate(),
      mode: "date",

      is24Hour: true,

      onChange(_, date) {
        navigation.setParams({
          selectedDate: moment(date).format("YYYY-MM-DD"),
        });
        f.setFieldValue("date", moment(date).format("YYYY-MM-DD"));
      },
    });
  };

  const [optionsVisible, setOptionsVisible] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      header: (props) => (
        <TimelineCreateHeader
          {...props}
          handleChangeDate={handleChangeDate}
          selectedDate={route.params.selectedDate}
          onToggleOptions={() => setOptionsVisible((p) => !p)}
        />
      ),
    });
  }, [optionsVisible, f.values.date]);

  return {
    f,
    timePicker,
    optionsVisible,
    setOptionsVisible,
    isLoading,
    isEditing,
    initialEditFormValues,
    initialValues,
    handleSubmit,
  };
}
