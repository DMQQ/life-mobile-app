import Colors from "@/constants/Colors";
import { ReactNode } from "react";
import { Text, View, Modal, Pressable } from "react-native";

interface SheetModalProps {
  title: string;
  visible: boolean;
  children: ReactNode;
  dismiss: () => void;
}

export default function SheetModal(props: SheetModalProps) {
  return (
    <Modal visible={props.visible} transparent>
      <Pressable
        onPress={props.dismiss}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.25)",
          justifyContent: "flex-end",
        }}
      >
        <Pressable
          onPress={(ev) => ev.stopPropagation()}
          style={{ padding: 15, backgroundColor: Colors.primary }}
        >
          <Text
            style={{
              color: Colors.foreground,
              fontSize: 30,
              fontWeight: "bold",
              padding: 10,
            }}
          >
            {props.title}
          </Text>

          {props.children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
