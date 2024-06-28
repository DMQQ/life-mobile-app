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
import timelineStyles from "../components/timeline.styles";
import { View } from "react-native";
import Ripple from "react-native-material-ripple";
import Color from "color";
import type { TimelineScreenProps } from "../types";
import CreateRepeatableTimeline from "../components/CreateTimeline/CreateRepeatableTimeline";
import useCreateTimeline from "../hooks/general/useCreateTimeline";
import { Feather } from "@expo/vector-icons";
import useKeyboard from "../../../../utils/hooks/useKeyboard";
import Animated, { ZoomInDown, ZoomOutDown } from "react-native-reanimated";
import SegmentedButtons from "@/components/ui/SegmentedButtons";
import Layout from "@/constants/Layout";
import SuggestedEvents from "../components/CreateTimeline/SuggestedEvents/SuggestedEvents";
import IconButton from "@/components/ui/IconButton/IconButton";

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
    f,
    isLoading,
    optionsVisible,
    setOptionsVisible,
    timePicker,
    isEditing,
    initialValues,
    handleSubmit,
    sheetRef,
  } = useCreateTimeline({ route, navigation });

  const TOTAL_PADDING = 30;

  const inputStyle = {
    width: Layout.screen.width - TOTAL_PADDING,
  };

  return (
    <>
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
            numberOfLines={f.values.desc.split("\n").length + 3}
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
              style={{ flex: 1, padding: 5 }}
              onPress={() => timePicker(f, "begin")}
            >
              <Text style={styles.timeText}>
                {f.values.begin.split(":").slice(0, 2).join(":")}
              </Text>
            </Ripple>

            <Text style={{ color: "gray", padding: 5 }}>to</Text>

            <Ripple
              style={{ flex: 1, padding: 5 }}
              onPress={() => timePicker(f, "end")}
            >
              <Text style={styles.timeText}>
                {f.values.end.split(":").slice(0, 2).join(":")}
              </Text>
            </Ripple>
          </View>

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

      <CreateRepeatableTimeline formik={f} ref={sheetRef as any} />
    </>
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
      style={{ padding: 5, flexDirection: "row", paddingTop: 15 }}
    >
      <IconButton
        onPress={() => {
          props.f.resetForm();
          ToastAndroid.show("Form reseted", ToastAndroid.SHORT);
        }}
        style={{
          padding: 7.5,
          width: 35,
          marginRight: 15,
        }}
        icon={<Feather name="trash-2" color="#fff" size={20} />}
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
        fontStyle={{ fontSize: 16 }}
      >
        {props.isEditing ? "Save changes" : "Create new event"}
      </Button>
    </Animated.View>
  ) : null;
