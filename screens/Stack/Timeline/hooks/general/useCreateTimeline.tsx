import { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import moment from "moment";
import useCreateTimelineMutation from "../mutation/useCreateTimeline";
import useGetTimelineById from "../query/useGetTimelineById";
import useEditTimeline from "../mutation/useEditTimeline";
import TimelineCreateHeader from "../../components/CreateTimeline/TimelineCreateHeader";
import { TimelineScreenProps } from "../../types";

import BottomSheetType from "@gorhom/bottom-sheet";
import { Platform, ToastAndroid } from "react-native";
import { DATE_FORMAT } from "@/utils/functions/parseDate";

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

  const sheetRef = useRef<BottomSheetType>();

  const isEditing = route.params.mode === "edit";

  const { data } = useGetTimelineById(route.params.timelineId || "", {
    skip: !isEditing || route?.params?.timelineId === undefined,
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

  const timePicker = (date: Date, type: "begin" | "end") => {
    f.setFieldValue(type, moment(date).format("HH:mm:ss"));
  };

  const handleChangeDate = (date: Date) => {
    f.setFieldValue("date", moment(date).format(DATE_FORMAT));
  };

  const [optionsVisible, setOptionsVisible] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      header: (props: any) => (
        <TimelineCreateHeader
          {...props}
          handleChangeDate={handleChangeDate}
          selectedDate={route.params.selectedDate}
          onToggleOptions={() => {
            f.resetForm();
            Platform.OS === "android" &&
              ToastAndroid.show("Form reseted", ToastAndroid.SHORT);
          }}
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
    sheetRef,
  };
}
