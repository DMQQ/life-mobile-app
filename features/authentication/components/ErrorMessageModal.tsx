import Colors from "@/constants/Colors";
import { Modal } from "react-native";
import Text from "@/components/ui/Text/Text";
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
            variant="heading"
            style={{
              color: Colors.secondary,
              fontWeight: "bold",
              marginBottom: 15,
            }}
          >
            Ops!
          </Text>
          <Text
            variant="title"
            style={{
              color: Colors.secondary,
              fontWeight: "bold",
            }}
          >
            {props.errorMessage}
          </Text>

          <Text
            variant="body"
            style={{
              color: Colors.foreground,
              paddingVertical: 15,
            }}
          >
            It seems there's an issue with your credentials. Please double-check your username and password and try again. Need help?{" "}
            <Text variant="body" style={{ textDecorationLine: "underline" }}>Click 'Forgot Password'</Text>
          </Text>

          <Button style={{ marginTop: 15 }} size="xl" onPress={props.onRetry || props.onDismiss}>
            {props.onRetry ? "Retry" : "Dismiss"}
          </Button>
        </Animated.View>
      </Overlay>
    </Modal>
  );
}
