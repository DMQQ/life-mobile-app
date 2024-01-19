import { useFormik } from "formik";
import ScreenContainer from "../../../../components/ui/ScreenContainer";
import ValidatedInput from "../../../../components/ui/ValidatedInput";
import {
  ActivityIndicator,
  Text,
  ScrollView,
  StyleSheet,
  ToastAndroid,
} from "react-native";
import Colors from "../../../../constants/Colors";
import Button from "../../../../components/ui/Button/Button";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import timelineStyles from "../components/timeline.styles";
import moment from "moment";
import { View } from "react-native";
import Ripple from "react-native-material-ripple";
import Color from "color";
import type { TimelineScreenProps } from "../types";
import CreateRepeatableTimeline from "../components/CreateRepeatableTimeline";
import { useEffect, useState } from "react";
import useCreateTimeline from "../hooks/mutation/useCreateTimeline";
import { Feather } from "@expo/vector-icons";
import useKeyboard from "../../../../utils/hooks/useKeyboard";
import Animated, { ZoomInDown, ZoomOutDown } from "react-native-reanimated";
import SegmentedButtons from "@/components/ui/SegmentedButtons";
import Layout from "@/constants/Layout";
import SuggestedEvents from "../components/SuggestedEvents";
import IconButton from "@/components/ui/IconButton/IconButton";
import useGetTimelineById from "../hooks/query/useGetTimelineById";
import useEditTimeline from "../hooks/mutation/useEditTimeline";
import TimelineCreateHeader from "../components/TimelineCreateHeader";

const styles = StyleSheet.create({
  timeContainer: {
    flexDirection: "row",
    width: "100%",
    backgroundColor: Colors.primary_light,
    borderWidth: 2,
    borderColor: Colors.primary_light,
    borderRadius: 10,
    padding: 7.5,
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeText: {
    color: Colors.secondary,
    fontSize: 25,
    textAlign: "center",
    fontWeight: "bold",
  },
});

const radioOptions = [
  { label: "None", value: "none" },
  { label: "All day", value: "all-day" },
  { label: "Repeatable", value: "repeatable" },
];

export default function CreateTimeLineEventModal({
  route,
  navigation,
}: TimelineScreenProps<"TimelineCreate">) {
  const isKeyboardOpen = useKeyboard();

  const {
    handleSubmit,
    initialValues,
    validationSchema,
    state: { loading: isLoading },
  } = useCreateTimeline({
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

  const dateTimeDefaultOptions = {
    is24Hour: true,
    textColor: Colors.primary,
  } as any;

  const timePicker = (formik: any, type: "begin" | "end") => {
    DateTimePickerAndroid.open({
      value: new Date(),
      mode: "time",
      ...dateTimeDefaultOptions,
      display: "clock",

      onChange(event, date) {
        formik.handleChange(type)(date?.toLocaleTimeString());
      },
    });
  };

  const handleChangeDate = () => {
    DateTimePickerAndroid.open({
      value: moment(route.params.selectedDate).toDate(),
      mode: "date",
      ...dateTimeDefaultOptions,

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

  const TOTAL_PADDING = 30;

  const inputStyle = {
    width: Layout.screen.width - TOTAL_PADDING,
  };

  return (
    <ScreenContainer>
      <ScrollView
        style={{ flex: 1, padding: 5 }}
        showsVerticalScrollIndicator={false}
      >
        {!isEditing && (
          <SuggestedEvents
            createTimelineAsync={handleSubmit}
            initialValues={initialValues}
            date={route.params.selectedDate}
          />
        )}

        <ValidatedInput
          placeholder="Like  'take out the trash' etc.."
          name="title"
          label="Event's title*"
          showLabel
          formik={f}
          helperStyle={{ marginLeft: 2.5 }}
          style={inputStyle}
        />
        <ValidatedInput
          showLabel
          label="Event's content"
          numberOfLines={10}
          multiline
          placeholder="What you wanted to do"
          name="desc"
          formik={f}
          scrollEnabled
          textAlignVertical="top"
          style={inputStyle}
        />

        <ValidatedInput.Label error={false} text="Time range*" />
        <View style={styles.timeContainer}>
          <Ripple
            style={{ flex: 1, padding: 10 }}
            onPress={() => timePicker(f, "begin")}
          >
            <Text style={styles.timeText}>
              {f.values.begin.split(":").slice(0, 2).join(":")}
            </Text>
          </Ripple>

          <Text style={{ color: "gray", padding: 10 }}>to</Text>

          <Ripple
            style={{ flex: 1, padding: 10 }}
            onPress={() => timePicker(f, "end")}
          >
            <Text style={styles.timeText}>
              {f.values.end.split(":").slice(0, 2).join(":")}
            </Text>
          </Ripple>
        </View>

        <CreateRepeatableTimeline
          onClose={() => setOptionsVisible(false)}
          isVisible={optionsVisible}
          formik={f}
        />

        <View style={{ marginTop: 10 }}>
          <ValidatedInput.Label
            error={false}
            text="How to send you notifications?"
          />
          <SegmentedButtons
            containerStyle={{
              borderRadius: 15,
              backgroundColor: Colors.primary_light,
            }}
            buttonTextStyle={{ fontWeight: "400" }}
            buttonStyle={{
              margin: 10,
              height: 40,
            }}
            buttons={radioOptions.map((prev) => ({
              text: prev.label,
              value: prev.value,
            }))}
            value={f.values.notification}
            onChange={(val) => f.setFieldValue("notification", val)}
          />
        </View>
      </ScrollView>

      <SubmitButton
        f={f}
        isEditing={isEditing}
        isKeyboardOpen={isKeyboardOpen || false}
        isLoading={isLoading}
      />
    </ScreenContainer>
  );
}

interface SubmitButtonProps {
  isKeyboardOpen: boolean;
  isLoading: boolean;
  f: any;

  isEditing: boolean;
}

const SubmitButton = (props: SubmitButtonProps) =>
  !props.isKeyboardOpen ? (
    <Animated.View
      entering={ZoomInDown}
      exiting={ZoomOutDown}
      style={{ paddingTop: 10, flexDirection: "row" }}
    >
      <IconButton
        onPress={() => {
          props.f.resetForm();
          ToastAndroid.show("Form reseted", ToastAndroid.SHORT);
        }}
        style={{
          padding: 10,
          width: 55,
          marginRight: 15,
        }}
        icon={<Feather name="trash-2" color={Colors.error} size={22} />}
      />
      <Button
        icon={
          props.isLoading ? (
            <ActivityIndicator
              style={{ marginRight: 5 }}
              size={18}
              color={"#fff"}
            />
          ) : null
        }
        disabled={!(props.f.isValid && !props.f.isSubmitting && props.f.dirty)}
        type="contained"
        callback={() => props.f.handleSubmit()}
        style={[
          timelineStyles.submitButton,
          {
            backgroundColor: !(
              props.f.isValid &&
              !props.f.isSubmitting &&
              props.f.dirty
            )
              ? Color(Colors.secondary).alpha(0.1).string()
              : Colors.secondary,
          },
        ]}
        fontStyle={{ letterSpacing: 1 }}
      >
        {props.isEditing ? "Edit event" : "Create event"}
      </Button>
    </Animated.View>
  ) : null;
