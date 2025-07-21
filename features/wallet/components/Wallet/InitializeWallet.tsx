import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/TextInput/TextInput";
import Colors from "@/constants/Colors";
import Layout from "@/constants/Layout";
import { gql, useMutation } from "@apollo/client";
import { useState } from "react";
import { ActivityIndicator, Text } from "react-native";
import { GET_WALLET } from "../../hooks/useGetWallet";
import { GET_MAIN_SCREEN } from "@/utils/schemas/GET_MAIN_SCREEN";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

export default function InitializeWallet() {
  const [createWallet, { loading, error }] = useMutation(
    gql`
      mutation ($balance: Float!) {
        createWallet(balance: $balance)
      }
    `,
    {
      refetchQueries: [GET_WALLET, GET_MAIN_SCREEN],
    }
  );

  const [step, setStep] = useState(0);
  const [balance, setBalance] = useState("");

  const onPress = () => {
    setStep((p) => p + 1);

    if (Number.isNaN(+balance)) return;

    if (step > 0) {
      createWallet({ variables: { balance: +balance } });
    }
  };

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 15 }}>
      <Text style={{ fontSize: 30, color: Colors.foreground, fontWeight: "bold" }}>Welcome to wallet!</Text>
      {step > 0 && (
        <Input
          placeholder="Initial balance"
          autoFocus
          value={balance}
          setValue={setBalance}
          keyboardType="numeric"
          style={{ width: Layout.screen.width * 0.4, textAlign: "center" }}
        />
      )}
      <Button
        disabled={(step > 0 && balance.trim() === "") || Number.isNaN(+balance)}
        onPress={onPress}
        style={{ padding: 10, borderRadius: 100, paddingHorizontal: 15 }}
        fontStyle={{ fontSize: 14, textTransform: "none", textAlign: "center" }}
      >
        {loading ? <ActivityIndicator size={12} color={Colors.foreground} /> : "Start using wallet!"}
      </Button>
    </Animated.View>
  );
}
