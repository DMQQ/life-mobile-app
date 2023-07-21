import { Pressable, View } from "react-native";
import Layout from "../../../constants/Layout";

export default function Overlay(props: {
  onClose: Function;
  isVisible: boolean;
}) {
  return props.isVisible ? (
    <Pressable
      onPress={() => props.onClose()}
      style={{
        position: "absolute",
        width: Layout.screen.width,
        height: Layout.screen.height,
        zIndex: 101,
        backgroundColor: "rgba(0,0,0,0.8)",
      }}
    />
  ) : null;
}
