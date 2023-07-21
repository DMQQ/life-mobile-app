import { View, Text, StyleSheet } from "react-native";
import Modal from "../../../../components/ui/Modal";
import Input from "../../../../components/ui/TextInput/TextInput";
import Colors from "../../../../constants/Colors";
import Button from "../../../../components/ui/Button/Button";
import SegmentedButtons from "../../../../components/ui/SegmentedButtons";
import Ripple from "react-native-material-ripple";
import Color from "color";
import { AntDesign } from "@expo/vector-icons";
import Layout from "../../../../constants/Layout";

const styles = StyleSheet.create({
  arrow_button: {
    backgroundColor: Color(Colors.primary).lighten(0.5).hex(),
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.primary_light,
    justifyContent: "center",
    alignItems: "center",
    width: 50,
  },
  modal_container: {
    backgroundColor: Colors.primary,
    marginTop: 20,
    borderRadius: 5,
  },
  title_container: {
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    color: Colors.secondary,
    fontWeight: "bold",
    fontSize: 18,
  },

  clear_button: {
    backgroundColor: Color(Colors.primary).lighten(0.5).hex(),
    alignItems: "center",
    justifyContent: "center",
    padding: 2.5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },

  clear_button_text: {
    color: Colors.secondary,
    fontWeight: "bold",
    fontSize: 13,
  },
  suggestion_text: {
    color: Colors.secondary,
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

export default function CreateRepeatableTimeline({
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

  return isVisible ? (
    // <Modal
    //   isVisible={isVisible}
    //   animationIn="fadeInDown"
    //   animationOut="fadeOutUp"
    //   animationOutTiming={250}
    //   useNativeDriverForBackdrop
    //   backdropTransitionInTiming={200}
    //   backdropTransitionOutTiming={300}
    //   hideModalContentWhileAnimating
    //   onBackdropPress={onClose}
    //   onBackButtonPress={onClose}
    // >
    <View style={styles.modal_container}>
      <View style={styles.title_container}>
        <Text style={styles.title}>Repeatable event options</Text>

        <Ripple onPress={onClearFields} style={styles.clear_button}>
          <Text style={styles.clear_button_text}>CLEAR</Text>
        </Ripple>
      </View>

      <View style={{ flexDirection: "row" }}>
        <ArrowButton arrow="arrowdown" onPress={onArrowDownPress} />
        <Input
          keyboardType="numeric"
          style={{ width: Layout.screen.width - 20 - 50 * 2 }}
          value={f.values.repeatCount}
          onChangeText={(t) => f.setFieldValue("repeatCount", t)}
          placeholder="Repeat count"
          placeholderTextColor={"gray"}
        />
        <ArrowButton arrow="arrowup" onPress={onArrowUpPress} />
      </View>

      <SegmentedButtons
        value={f.values.repeatOn}
        onChange={(value) => f.setFieldValue("repeatOn", value)}
        buttons={REPEAT_VARIANTS}
      />

      <SegmentedButtons
        value={f.values.repeatEveryNth}
        onChange={(value) => f.setFieldValue("repeatEveryNth", value)}
        buttons={segmentedButtons}
      />

      <Text style={styles.suggestion_text}>
        Leaving fields blank disables repeatition
      </Text>

      {/* <Button
        callback={onClose}
        type="contained"
        color="primary"
        style={styles.save_button}
      >
        Save and close
      </Button> */}
    </View>
  ) : // </Modal>
  null;
}
