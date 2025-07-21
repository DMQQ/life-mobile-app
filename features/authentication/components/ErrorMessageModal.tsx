import Colors from "@/constants/Colors";
import { Modal } from "react-native";
import { Text } from "react-native";
import Layout from "@/constants/Layout";

import Overlay from "@/components/ui/Overlay/Overlay";
import Button from "@/components/ui/Button/Button";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";

export default function ErrorMessageModal(props: {
  isError: boolean;
  errorMessage: string;
  typeOfError: string;
  onDismiss: () => void;

  onRetry?: () => Promise<unknown>;
}) {
  return (
    <Modal transparent visible={props.isError} onDismiss={props.onDismiss}>
      <Overlay onClose={props.onDismiss} isVisible={props.isError}>
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
              marginBottom: 15,
            }}
          >
            Ops!
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
              color: Colors.foreground,
              fontSize: 19,
              paddingVertical: 15,
            }}
          >
            It seems there's an issue with your credentials. Please double-check your username and password and try again. Need help?{" "}
            <Text style={{ textDecorationLine: "underline" }}>Click 'Forgot Password'</Text>
          </Text>

          <Button style={{ marginTop: 15 }} size="xl" onPress={props.onRetry || props.onDismiss}>
            {props.onRetry ? "Retry" : "Dismiss"}
          </Button>
        </Animated.View>
      </Overlay>
    </Modal>
  );
}
