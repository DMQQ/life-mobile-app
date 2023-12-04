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
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
    width: 50,
  },
  modal_container: {
    backgroundColor: Colors.primary,
    marginTop: 20,
    borderRadius: 30,
    padding: 15,
  },
  title_container: {
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    color: Colors.secondary,
    fontWeight: "bold",
    fontSize: 25,
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
}) => (
  <Ripple onPress={() => props.onPress()} style={styles.arrow_button}>
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
      animationIn={"slideInUp"}
      animationOut={"slideOutDown"}
      hideModalContentWhileAnimating
      isVisible={isVisible}
      onBackButtonPress={onClose}
      onBackdropPress={onClose}
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

          <View style={{ flexDirection: "row" }}>
            <ArrowButton arrow="arrowdown" onPress={onArrowDownPress} />
            <Input
              keyboardType="numeric"
              style={{ flex: 1, width: Layout.screen.width - 40 - 60 - 70 }}
              value={f.values.repeatCount}
              onChangeText={(t) => f.setFieldValue("repeatCount", t)}
              placeholder="Repeat count"
              placeholderTextColor={"gray"}
            />
            <ArrowButton arrow="arrowup" onPress={onArrowUpPress} />
          </View>
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
