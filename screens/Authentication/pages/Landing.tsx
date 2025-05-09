import { Image, Text, View } from "react-native";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Button from "@/components/ui/Button/Button";

import Layout from "@/constants/Layout";
import Color from "color";
import Colors, { secondary_candidates } from "@/constants/Colors";

export default function Landing({ navigation }: any) {
  return (
    <ScreenContainer>
      <Text
        style={{
          color: "#fff",
          fontSize: 24,
          fontWeight: "bold",
        }}
      >
        Hello there!
      </Text>

      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Image
          source={require("@/assets/images/adaptive-icon.png")}
          style={{
            width: Layout.screen.width / 2,
            height: undefined,
            resizeMode: "cover",
            aspectRatio: 1,
          }}
        />
      </View>

      <View
        style={{
          justifyContent: "center",
          gap: 15,
        }}
      >
        <Button type="text" fontStyle={{ fontSize: 16 }} onPress={() => navigation.navigate("Register")}>
          CREATE ACCOUNT
        </Button>

        <Button type="contained" onPress={() => navigation.navigate("Login")} fontStyle={{ fontSize: 16 }}>
          LOGIN
        </Button>
      </View>
    </ScreenContainer>
  );
}
