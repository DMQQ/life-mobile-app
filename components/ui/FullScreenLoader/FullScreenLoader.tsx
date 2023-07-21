import Colors from "../../../constants/Colors";
import Modal from "../Modal";
import { ActivityIndicator } from "react-native";

export default function FullScreenLoader(props: { isVisible: boolean }) {
  return (
    <Modal isVisible={props.isVisible}>
      <ActivityIndicator size={"large"} color={Colors.secondary} />
    </Modal>
  );
}
