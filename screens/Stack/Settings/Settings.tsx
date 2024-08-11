import { Text, View } from "react-native";
import Button from "../../../components/ui/Button/Button";
import ScreenContainer from "../../../components/ui/ScreenContainer";

import useUser from "@/utils/hooks/useUser";
import Colors from "../../../constants/Colors";
import Header from "@/components/ui/Header/Header";

export default function Settings() {
  const { removeUser, user } = useUser();

  return (
    <ScreenContainer style={{ padding: 0 }}>
      <Header buttons={[]} title="Settings" titleAnimatedStyle={{}} goBack />
      <View style={{ flex: 1, padding: 15 }}>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: "#fff",
              fontSize: 25,
              fontWeight: "bold",
            }}
          >
            Signed as
          </Text>
          <Text
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: 20,
              fontWeight: "bold",
            }}
          >
            {user?.email}
          </Text>
        </View>

        <Button
          fontStyle={{ fontSize: 16 }}
          onPress={() => removeUser()}
          style={{ backgroundColor: Colors.error }}
        >
          Signout 👋
        </Button>
      </View>
    </ScreenContainer>
  );
}
