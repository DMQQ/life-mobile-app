import ScreenContainer from "@/components/ui/ScreenContainer";
import ValidatedInput from "@/components/ui/ValidatedInput";
import { ActivityIndicator, Text, ScrollView, StyleSheet, Platform, KeyboardAvoidingView } from "react-native";
import Colors from "@/constants/Colors";
import Button from "@/components/ui/Button/Button";
import timelineStyles from "../components/timeline.styles";
import { View } from "react-native";
import Ripple from "react-native-material-ripple";
import Color from "color";
import type { TimelineScreenProps } from "../types";
import CreateRepeatableTimeline from "../components/CreateTimeline/CreateRepeatableTimeline";
import useCreateTimeline from "../hooks/general/useCreateTimeline";
import { AntDesign } from "@expo/vector-icons";
import useKeyboard from "@/utils/hooks/useKeyboard";
import SegmentedButtons from "@/components/ui/SegmentedButtons";
import SuggestedEvents from "../components/CreateTimeline/SuggestedEvents/SuggestedEvents";
import IconButton from "@/components/ui/IconButton/IconButton";
import DateTimePicker from "react-native-modal-datetime-picker";
import { useState } from "react";
import moment from "moment";
import Header from "@/components/ui/Header/Header";
import TimelineCreateHeader from "../components/CreateTimeline/TimelineCreateHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

export default function CreateTimeLineEventModal({ route, navigation }: TimelineScreenProps<"TimelineCreate">) {
  const isKeyboardOpen = useKeyboard();

  const { f, isLoading, timePicker, isEditing, sheetRef, handleChangeDate } = useCreateTimeline({
    route,
    navigation,
  });

  const [datePicker, setDatePicker] = useState<"begin" | "end" | "">("");

  const numberOfLines = f.values.desc.split("\n").length;

  return (
    <ScreenContainer style={{ flex: 1, padding: 0 }}>
      <TimelineCreateHeader
        navigation={navigation}
        handleChangeDate={handleChangeDate}
        selectedDate={route.params.selectedDate}
        onToggleOptions={() => {
          f.resetForm();
        }}
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 15 }}>
          {!isEditing && <SuggestedEvents date={route.params.selectedDate} />}

          <ValidatedInput
            placeholder="Like  'take out the trash' etc.."
            name="title"
            label="Event's title*"
            showLabel
            formik={f}
            helperStyle={{ marginLeft: 2.5 }}
          />
          <ValidatedInput
            showLabel
            label="Event's content"
            numberOfLines={isEditing ? f.values.desc.split("\n").length + 10 : f.values.desc.split("\n").length + 3}
            style={{
              ...(Platform.OS === "ios" && {
                minHeight: (numberOfLines <= 5 ? 5 : numberOfLines) * 20,
              }),
            }}
            multiline
            placeholder="What you wanted to do"
            name="desc"
            formik={f}
            scrollEnabled
            textAlignVertical="top"
          />

          <ValidatedInput.Label error={false} text="Time range*" />
          <View style={styles.timeContainer}>
            <Ripple style={{ flex: 1, padding: 5 }} onPress={() => setDatePicker("begin")}>
              <Text style={styles.timeText}>{f.values.begin.split(":").slice(0, 2).join(":")}</Text>
            </Ripple>

            <Text style={{ color: "gray", padding: 5 }}>to</Text>

            <Ripple style={{ flex: 1, padding: 5 }} onPress={() => setDatePicker("end")}>
              <Text style={styles.timeText}>{f.values.end.split(":").slice(0, 2).join(":")}</Text>
            </Ripple>
          </View>

          <View style={{ marginTop: 10 }}>
            <ValidatedInput.Label error={false} text="How to send you notifications?" />
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

          <TimePickerModal
            isVisible={!!datePicker}
            onConfirm={(currentlySelectedTime) => {
              let finalDate = moment(currentlySelectedTime);

              if (datePicker === "begin") {
                // Set the begin time and if the end time is before the begin time, add 1 hour to the end time
                f.setFieldValue("begin", finalDate.format("HH:mm"));

                if (finalDate.isAfter(moment(f.values.end, "HH:mm"))) {
                  f.setFieldValue("end", finalDate.add(1, "hours").format("HH:mm"));
                }
              }

              if (datePicker === "end") {
                // Set the end time and if the end time is before the begin time, add 1 hour to the end time
                f.setFieldValue("end", finalDate.format("HH:mm"));

                if (finalDate.isBefore(moment(f.values.begin, "HH:mm"))) {
                  f.setFieldValue("begin", finalDate.subtract(1, "hours").format("HH:mm"));
                }
              }

              setDatePicker("");
            }}
            onCancel={() => setDatePicker("")}
          />

          <CreateRepeatableTimeline formik={f} ref={sheetRef as any} />
        </ScrollView>
      </KeyboardAvoidingView>
      <SubmitButton
        f={f}
        openSheet={() => sheetRef.current?.expand()}
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

  openSheet: () => void;
}

const SubmitButton = (props: SubmitButtonProps) => (
  <View style={{ flexDirection: "row", paddingHorizontal: 15 }}>
    <IconButton
      onPress={props.openSheet}
      style={{
        padding: 7.5,
        width: 35,
        marginRight: 15,
      }}
      icon={<AntDesign name="calendar" color="#fff" size={20} />}
    />
    <Button
      icon={props.isLoading ? <ActivityIndicator style={{ marginRight: 5 }} size={18} color={"#fff"} /> : null}
      disabled={!(props.f.isValid && !props.f.isSubmitting && props.f.dirty)}
      type="contained"
      callback={() => props.f.handleSubmit()}
      style={[
        timelineStyles.submitButton,
        {
          backgroundColor: !(props.f.isValid && !props.f.isSubmitting && props.f.dirty)
            ? Color(Colors.secondary).alpha(0.1).string()
            : Colors.secondary,
        },
      ]}
      fontStyle={{ fontSize: 16 }}
    >
      {props.isEditing ? "Save changes" : "Create new event"}
    </Button>
  </View>
);

const TimePickerModal = (props: { isVisible: boolean; onConfirm: (date: Date) => void; onCancel: () => void }) => {
  return <DateTimePicker mode="time" isVisible={props.isVisible} onConfirm={props.onConfirm} onCancel={props.onCancel} />;
};
