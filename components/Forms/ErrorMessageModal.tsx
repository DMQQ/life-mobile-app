import Colors from "../../constants/Colors";
import { Modal } from "react-native";
import { View, Text } from "react-native";
import Layout from "../../constants/Layout";
import Color from "color";
import Overlay from "../ui/Overlay/Overlay";
import Button from "../ui/Button/Button";
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeOutUp,
} from "react-native-reanimated";

export default function ErrorMessageModal(props: {
  isError: boolean;
  errorMessage: string;
  typeOfError: string;
  onDismiss: () => void;
}) {
  return (
    <Modal transparent visible={props.isError} onDismiss={props.onDismiss}>
      <Overlay onClose={() => {}} isVisible={props.isError}>
        <Animated.View
          entering={FadeInDown}
          exiting={FadeOutUp}
          style={{
            position: "absolute",
            bottom: 0,
            width: Layout.screen.width,
            height: "auto",
            backgroundColor: Colors.primary,
            padding: 15,
          }}
        >
          <Text
            style={{
              color: Colors.secondary,
              fontSize: 40,
              fontWeight: "bold",
            }}
          >
            Oops!
          </Text>
          <Text
            style={{
              color: Colors.secondary,
              fontSize: 25,
              fontWeight: "bold",
            }}
          >
            {props.errorMessage}
          </Text>

          <Text
            style={{
              color: "#fff",
              fontSize: 19,
              paddingVertical: 15,
            }}
          >
            It seems there's an issue with your credentials. Please double-check
            your username and password and try again. Need help?{" "}
            <Text style={{ textDecorationLine: "underline" }}>
              Click 'Forgot Password'
            </Text>
          </Text>

          <Button style={{ marginTop: 15 }} size="xl" onPress={props.onDismiss}>
            Retry
          </Button>
        </Animated.View>
      </Overlay>
    </Modal>
  );
}
