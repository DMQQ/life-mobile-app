import { View, Text, StyleSheet } from "react-native";
import Input from "../../../../components/ui/TextInput/TextInput";
import Colors from "../../../../constants/Colors";
import SegmentedButtons from "../../../../components/ui/SegmentedButtons";
import Ripple from "react-native-material-ripple";
import Color from "color";
import { AntDesign } from "@expo/vector-icons";
import Layout from "../../../../constants/Layout";
import Modal from "../../../../components/ui/Modal";
import Button from "../../../../components/ui/Button/Button";
import { memo } from "react";

const styles = StyleSheet.create({
  arrow_button: {
    backgroundColor: Color(Colors.primary).lighten(0.5).hex(),
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    borderRadius: 5,
  },
  modal_container: {
    backgroundColor: Colors.primary,
    borderRadius: 35,
    padding: 15,
    paddingVertical: 30,
  },
  title_container: {
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  title: {
    color: Colors.secondary,
    fontWeight: "bold",
    fontSize: 20,
  },

  clear_button: {
    backgroundColor: Color(Colors.primary).lighten(0.5).hex(),
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
  },

  clear_button_text: {
    color: Colors.secondary,
    fontWeight: "bold",
    fontSize: 13,
  },
  suggestion_text: {
    color: "gray",
    fontWeight: "bold",
    fontSize: 14,
    marginTop: 15,
  },
  save_button: {
    backgroundColor: Colors.secondary,
    paddingVertical: 15,
    marginTop: 10,
  },
});

interface CreateRepeatableTimelineProps {
  formik: any;

  isVisible: boolean;

  onClose: () => void;
}

const ArrowButton = (props: {
  onPress: () => void;
  arrow: "arrowup" | "arrowdown";
  disabled?: boolean;
}) => (
  <Ripple
    disabled={props.disabled || false}
    onPress={() => props.onPress()}
    style={[styles.arrow_button, { opacity: props.disabled ? 0.5 : 1 }]}
  >
    <AntDesign
      name={props.arrow}
      size={24}
      color={props.arrow === "arrowup" ? Colors.secondary : Colors.error}
    />
  </Ripple>
);

const REPEAT_VARIANTS = [
  {
    text: "Daily",
    value: "daily",
  },
  {
    text: "Weekly",
    value: "weekly",
  },
];

const Txt = (props: { text: string }) => (
  <Text
    style={{
      color: Colors.secondary,
      fontWeight: "bold",
      marginBottom: 5,
    }}
  >
    {props.text}
  </Text>
);

function CreateRepeatableTimeline({
  formik: f,
  isVisible,
  onClose,
}: CreateRepeatableTimelineProps) {
  const onClearFields = () => {
    f.setFieldValue("repeatCount", "");
    f.setFieldValue("repeatOn", "");
    f.setFieldValue("repeatEveryNth", "");
  };

  const segmentedButtons = new Array(7).fill(0).map((_, i) => ({
    text: `${i + 1}`,
    value: `${i + 1}`,
  }));

  const onArrowUpPress = () => {
    f.setFieldValue("repeatCount", (+f.values.repeatCount + 1).toString());
  };

  const onArrowDownPress = () => {
    if (+f.values.repeatCount - 1 < 0) return;
    f.setFieldValue("repeatCount", (+f.values.repeatCount - 1).toString());
  };

  return (
    <Modal
      useNativeDriver
      useNativeDriverForBackdrop
      hideModalContentWhileAnimating
      isVisible={isVisible}
      onBackButtonPress={onClose}
      onBackdropPress={onClose}
      animationIn={"slideInUp"}
      animationOut={"slideOutDown"}
    >
      <View style={styles.modal_container}>
        <View style={styles.title_container}>
          <Text style={styles.title}>Options</Text>

          <Ripple onPress={onClearFields} style={styles.clear_button}>
            <Text style={styles.clear_button_text}>CLEAR</Text>
          </Ripple>
        </View>

        <View>
          <Txt text="Number of events" />

          <Input
            keyboardType="numeric"
            style={{ flex: 1, width: Layout.screen.width - 70 }}
            value={f.values.repeatCount}
            onChangeText={(t) => f.setFieldValue("repeatCount", t)}
            placeholder="Repeat count"
            placeholderTextColor={"gray"}
            left={
              <ArrowButton
                disabled={
                  Number(f.values.repeatCount) === 0 ||
                  f.values.repeatCount === ""
                }
                arrow="arrowdown"
                onPress={onArrowDownPress}
              />
            }
            right={<ArrowButton arrow="arrowup" onPress={onArrowUpPress} />}
          />
        </View>

        <View>
          <Txt text="Repeat variants" />
          <SegmentedButtons
            value={f.values.repeatOn}
            onChange={(value) => f.setFieldValue("repeatOn", value)}
            buttons={REPEAT_VARIANTS}
          />
        </View>

        <View>
          <Txt text="Repeat every nth day" />
          <SegmentedButtons
            value={f.values.repeatEveryNth}
            onChange={(value) => f.setFieldValue("repeatEveryNth", value)}
            buttons={segmentedButtons}
          />
        </View>

        <Text style={styles.suggestion_text}>
          Leaving fields blank disables repeatition
        </Text>

        <Button style={{ marginTop: 20 }} size="xl" onPress={onClose}>
          Close
        </Button>
      </View>
    </Modal>
  );
}

export default memo(CreateRepeatableTimeline);
