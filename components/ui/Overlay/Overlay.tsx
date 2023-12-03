import { Modal, Pressable, View } from "react-native";
import Layout from "../../../constants/Layout";
import { ReactNode } from "react";

export default function Overlay(props: {
  onClose: Function;
  isVisible: boolean;
  content?: ReactNode;
}) {
  return (
    <Modal visible={props.isVisible} transparent>
      <Pressable
        onPress={() => props.onClose()}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: Layout.screen.width,
          height: Layout.screen.height,

          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      />
      {props.content}
    </Modal>
  );
}
