import BottomSheet from "@/components/ui/BottomSheet/BottomSheet";
import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/TextInput/TextInput";
import { Padding } from "@/constants/Layout";
import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Text, View } from "react-native";
import { useWalletContext } from "../WalletContext";
import useEditWallet from "../../hooks/useEditWallet";

export default function EditBalanceSheet() {
  const [value, setValue] = useState<string>("");

  const {
    refs: { editBalanceRef },
  } = useWalletContext();

  const { editBalance, loading } = useEditWallet(() => {
    editBalanceRef.current?.close();
  });

  const onPress = async () => {
    if (!value || !Number.isSafeInteger(Number(value))) return;

    await editBalance({
      variables: {
        balance: Number(value),
      },
    });
  };

  return (
    <BottomSheet snapPoints={["40%"]} ref={editBalanceRef}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="position">
        <View
          style={{
            flex: 1,
            paddingHorizontal: 15,
            marginTop: 10,
            minHeight: 170,
          }}
        >
          <Input value={value} onChangeText={setValue} keyboardAppearance="dark" keyboardType="number-pad" />
          <Text style={{ color: "gray" }}>
            This will set your balance to the value you enter. It will not affect your expenses or income.
          </Text>

          <Text style={{ color: "gray", marginTop: 10 }}>This action cannot be undone.</Text>

          <Text>Your current balance will be: {value}</Text>
        </View>
        <View style={{ padding: 15 }}>
          <Button
            icon={loading && <ActivityIndicator style={{ marginHorizontal: 10 }} size="small" color="white" />}
            fontStyle={{ fontSize: 16 }}
            style={{ flexDirection: "row-reverse" }}
            onPress={onPress}
          >
            Save balance
          </Button>
        </View>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
}
