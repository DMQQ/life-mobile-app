import Colors from "../../constants/Colors";
import Modal from "../ui/Modal";
import { View, Text } from "react-native";

export default function ErrorMessageModal(props: {
  isError: boolean;
  errorMessage: string;
  typeOfError: string;
  onDismiss: () => void;
}) {
  return (
    <Modal
      animationIn={"slideInUp"}
      animationOut={"slideOutDown"}
      useNativeDriver
      useNativeDriverForBackdrop
      isVisible={props.isError}
      onDismiss={props.onDismiss}
      onBackdropPress={props.onDismiss}
      onBackButtonPress={props.onDismiss}
    >
      <View
        style={{
          backgroundColor: Colors.primary,
          padding: 10,
          height: 150,
          borderRadius: 5,
          transform: [{ translateY: -100 }],
        }}
      >
        <Text
          style={{
            color: Colors.secondary,
            fontWeight: "bold",
            marginBottom: 10,
            fontSize: 25,
          }}
        >
          {props.typeOfError}
        </Text>
        <Text style={{ color: Colors.error, fontSize: 16 }}>
          {props.errorMessage}
        </Text>
      </View>
    </Modal>
  );
}
