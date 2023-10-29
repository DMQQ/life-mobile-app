import { useFormik } from "formik";
import ScreenContainer from "../../../../components/ui/ScreenContainer";
import ValidatedInput from "../../../../components/ui/ValidatedInput";
import { ActivityIndicator, Text, ScrollView, StyleSheet } from "react-native";
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
import { AntDesign } from "@expo/vector-icons";
import useKeyboard from "../../../../utils/hooks/useKeyboard";
import Animated, { ZoomInDown, ZoomOutDown } from "react-native-reanimated";
import { RadioGroup } from "../../../../components/ui/Radio/Radio";

const styles = StyleSheet.create({
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  timeContainer: {
    flexDirection: "row",
    width: "100%",
    backgroundColor: Color(Colors.primary).lighten(0.5).hex(),
    borderWidth: 2,
    borderColor: Colors.primary_light,
    borderRadius: 5,
    padding: 7.5,
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeText: {
    color: Colors.secondary,
    fontSize: 18,
    textAlign: "center",
  },
});

const radioOptions = [
  { label: "None", value: "none" },
  { label: "All day", value: "all-day" },
  { label: "Repeatable", value: "repeatable" },
  { label: "Notify before expire", value: "notify-before-expire" },
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

  const f = useFormik({
    onSubmit: handleSubmit,
    validationSchema: validationSchema,
    initialValues: {
      ...initialValues,
      date: route.params.selectedDate,
      begin: moment().format("HH:mm:ss"),
      end: moment().add(1, "hours").format("HH:mm:ss"),
      notification: "none",
    },
  });

  const dateTimeDefaultOptions = {
    display: "default",
    positiveButtonLabel: "ok",
    negativeButtonLabel: "cancel",
    is24Hour: true,
  } as any;

  const timePicker = (formik: any, type: string) => {
    DateTimePickerAndroid.open({
      value: new Date(),
      mode: "time",
      ...dateTimeDefaultOptions,

      onChange(event, date) {
        formik.handleChange(type)(date?.toLocaleTimeString());
      },
    });
  };

  const handleOpenDatePicker = () => {
    DateTimePickerAndroid.open({
      value: moment(route.params.selectedDate).toDate(),
      mode: "date",
      ...dateTimeDefaultOptions,

      onChange(_, date) {
        navigation.setParams({
          selectedDate: moment(date).format("YYYY-MM-DD"),
        });
      },
    });
  };

  const [optionsVisible, setOptionsVisible] = useState(true);

  useEffect(() => {
    navigation.setOptions({
      header: (props) => (
        <View style={styles.header}>
          <Ripple style={{ padding: 10 }} onPress={props.navigation.goBack}>
            <AntDesign name="arrowleft" color="#fff" size={23} />
          </Ripple>

          <Ripple onPress={handleOpenDatePicker}>
            <Text style={[timelineStyles.eventTitle]}>
              {route.params.selectedDate}
            </Text>
          </Ripple>
          <Ripple
            style={{ padding: 10 }}
            onPress={() => setOptionsVisible((p) => !p)}
          >
            <AntDesign name="setting" color={"#fff"} size={23} />
          </Ripple>
        </View>
      ),
    });
  }, [optionsVisible]);

  return (
    <ScreenContainer>
      <ScrollView style={{ flex: 1 }}>
        <ValidatedInput
          placeholder="Event's title"
          name="title"
          formik={f}
          helperText="Event's title (not required)"
          helperStyle={{ marginLeft: 2.5 }}
        />
        <ValidatedInput
          numberOfLines={10}
          multiline
          placeholder="Event's description"
          helperText="Event's description (2000char's)"
          name="desc"
          formik={f}
          scrollEnabled
          textAlignVertical="top"
        />

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

        <RadioGroup
          value={f.values.notification}
          options={radioOptions}
          onChange={(val) => f.setFieldValue("notification", val)}
        />
      </ScrollView>

      <SubmitButton
        f={f}
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
}

const SubmitButton = (props: SubmitButtonProps) =>
  !props.isKeyboardOpen ? (
    <Animated.View
      entering={ZoomInDown}
      exiting={ZoomOutDown}
      style={{ paddingTop: 10 }}
    >
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
        disabled={!(props.f.isValid && !props.f.isSubmitting)}
        type="contained"
        callback={() => props.f.handleSubmit()}
        style={[
          timelineStyles.submitButton,
          {
            backgroundColor: !(props.f.isValid && !props.f.isSubmitting)
              ? Color(Colors.secondary).alpha(0.1).string()
              : Colors.secondary,
          },
        ]}
        fontStyle={{ textTransform: "none", letterSpacing: 1 }}
      >
        CREATE EVENT
      </Button>
    </Animated.View>
  ) : null;
