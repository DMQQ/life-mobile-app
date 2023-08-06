import { Formik } from "formik";
import ScreenContainer from "../../../../components/ui/ScreenContainer";
import ValidatedInput from "../../../../components/ui/ValidatedInput";
import { ActivityIndicator, Text } from "react-native";
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
import { Feather, FontAwesome } from "@expo/vector-icons";
import useKeyboard from "../../../../utils/hooks/useKeyboard";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

export default function CreateTimeLineEventModal({
  route,
  navigation,
}: TimelineScreenProps<"TimelineCreate">) {
  const isKeyboardOpen = useKeyboard();

  const keyboardHideAnimation = useAnimatedStyle(
    () => ({
      transform: [
        {
          translateY: isKeyboardOpen
            ? withTiming(100, { duration: 50 })
            : withTiming(0),
        },
      ],
    }),
    [isKeyboardOpen]
  );

  const {
    handleSubmit,
    initialValues,
    validationSchema,
    state: { loading: isLoading },
  } = useCreateTimeline({
    selectedDate: route.params.selectedDate,
  });

  const timePicker = (formik: any, type: string) => {
    DateTimePickerAndroid.open({
      value: new Date(),
      is24Hour: true,
      mode: "time",
      display: "default",
      positiveButtonLabel: "ok",
      negativeButtonLabel: "cancel",

      onChange(event, date) {
        formik.handleChange(type)(date?.toLocaleTimeString());
      },
    });
  };

  const handleOpenDatePicker = () => {
    DateTimePickerAndroid.open({
      value: moment(route.params.selectedDate).toDate(),
      is24Hour: true,
      mode: "date",
      display: "default",
      positiveButtonLabel: "ok",
      negativeButtonLabel: "cancel",

      onChange(event, date) {
        navigation.setParams({
          selectedDate: moment(date).format("YYYY-MM-DD"),
        });
      },
    });
  };

  const [optionsVisible, setOptionsVisible] = useState(true);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerStyle: {
        backgroundColor: Colors.primary,
      },
      headerRight: () => (
        <Ripple
          onPress={() => setOptionsVisible((v) => !v)}
          style={{ padding: 15 }}
        >
          <FontAwesome name="gear" size={24} color={Colors.secondary} />
        </Ripple>
      ),
    });
  }, [optionsVisible]);

  return (
    <ScreenContainer>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <Text style={timelineStyles.eventTitle}>
          {route.params.selectedDate}
        </Text>
        <Ripple onPress={() => handleOpenDatePicker()}>
          <Feather name="edit" size={24} color={Colors.secondary} />
        </Ripple>
      </View>
      <Formik
        onSubmit={handleSubmit}
        validationSchema={validationSchema}
        initialValues={{
          ...initialValues,
          date: route.params.selectedDate,
          begin: moment().format("HH:mm:ss"),
          end: moment().add(1, "hours").format("HH:mm:ss"),
          notification: "none",
        }}
      >
        {(f) => (
          <>
            <ValidatedInput
              placeholder="Event's title"
              name="title"
              formik={f}
              helperText="Event's title (not required)"
              helperStyle={{ marginLeft: 2.5 }}
            />
            <ValidatedInput
              numberOfLines={f.values.desc.split("\n").length}
              multiline
              placeholder="Event's description"
              helperText="Event's description (2000char's)"
              name="desc"
              formik={f}
            />

            <View
              style={{
                flexDirection: "row",
                width: "100%",
                backgroundColor: Color(Colors.primary).lighten(0.5).hex(),
                borderWidth: 2,
                borderColor: Colors.primary_light,
                borderRadius: 5,
                padding: 7.5,
              }}
            >
              <Ripple
                style={{ flex: 1, padding: 5 }}
                onPress={() => timePicker(f, "begin")}
              >
                <Text style={{ color: Colors.secondary, fontSize: 18 }}>
                  {f.values.begin.split(":").slice(0, 2).join(":")}
                </Text>
              </Ripple>
              <Ripple
                style={{ flex: 1, padding: 5 }}
                onPress={() => timePicker(f, "end")}
              >
                <Text style={{ color: Colors.secondary, fontSize: 18 }}>
                  {f.values.end.split(":").slice(0, 2).join(":")}
                </Text>
              </Ripple>
            </View>

            <CreateRepeatableTimeline
              onClose={() => setOptionsVisible(false)}
              isVisible={optionsVisible}
              formik={f}
            />

            {/* Uncomment when impletemented on server */}

            {/* <RadioGroup
              value={f.values.notification}
              //prettier-ignore
              options={[
              { label: "None", value: "none" },
              { label: "All day", value: "all-day" },
              { label: "Repeatable", value: "repeatable" },
              { label:'Notify before expire', value: 'notify-before-expire'}
            ]}
              onChange={(val) => f.setFieldValue("notification", val)}
            /> */}

            <Animated.View
              style={[
                { position: "absolute", bottom: 0 },
                keyboardHideAnimation,
              ]}
            >
              <Button
                icon={
                  isLoading ? (
                    <ActivityIndicator
                      style={{ marginRight: 5 }}
                      size={18}
                      color={"#fff"}
                    />
                  ) : null
                }
                disabled={!(f.isValid && !f.isSubmitting)}
                type="contained"
                callback={() => f.handleSubmit()}
                style={timelineStyles.submitButton}
                fontStyle={{ textTransform: "none" }}
              >
                Create timeline event
              </Button>
            </Animated.View>
          </>
        )}
      </Formik>
    </ScreenContainer>
  );
}
