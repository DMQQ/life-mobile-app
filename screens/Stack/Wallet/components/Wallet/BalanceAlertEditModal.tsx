import Modal from "@/components/ui/Modal";
import { Text, View, KeyboardAvoidingView } from "react-native";
import Colors from "@/constants/Colors";
import Input from "@/components/ui/TextInput/TextInput";
import Button from "@/components/ui/Button/Button";

import { useState } from "react";
import Animated from "react-native-reanimated";
import useEditWallet from "../../hooks/useEditWallet";

interface BalanceAlertEditModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function BalanceAlertEditModal({
  onClose,
  visible,
}: BalanceAlertEditModalProps) {
  const [balance, setBalance] = useState("");

  const { editBalance } = useEditWallet(onClose);

  async function onSubmit() {
    await editBalance({
      variables: {
        balance: Number(balance),
      },
    });
  }

  return (
    <Modal
      useNativeDriverForBackdrop
      useNativeDriver
      isVisible={visible}
      animationIn={"fadeIn"}
      animationOut={"fadeOut"}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
    >
      <KeyboardAvoidingView behavior="position">
        <Animated.View
          style={{
            backgroundColor: Colors.primary,
            padding: 25,
            borderRadius: 20,
          }}
        >
          <Text
            style={{
              fontWeight: "bold",
              color: Colors.secondary,
              fontSize: 35,
              marginBottom: 20,
            }}
          >
            Edit Balance
          </Text>

          <Input
            left={
              <Text
                style={{
                  color: Colors.secondary,
                  paddingHorizontal: 5,
                  fontSize: 18,
                }}
              >
                ZŁ
              </Text>
            }
            keyboardType="numeric"
            placeholder="Balance"
            style={{
              width: "100%",
            }}
            value={balance}
            setValue={setBalance}
          />

          <Text style={{ color: "gray" }}>Action cannot be undone</Text>

          <Button
            style={{ marginTop: 25 }}
            size="xl"
            onPress={onSubmit}
            disabled={
              balance.trim() === "" || Number.isNaN(Number(balance.trim()))
            }
            type="contained"
            color="ternary"
          >
            Save
          </Button>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
