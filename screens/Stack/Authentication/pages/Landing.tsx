import { Image, Text, View } from "react-native";
import ScreenContainer from "../../../../components/ui/ScreenContainer";
import Button from "../../../../components/ui/Button/Button";

import Layout from "../../../../constants/Layout";
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
          flex: 1,
          position: "absolute",
          bottom: 0,
          width: Layout.screen.width,
          justifyContent: "center",
          padding: 15,
          gap: 15,
        }}
      >
        <Button
          size="xl"
          type="text"
          fontStyle={{ fontSize: 18 }}
          style={{ flex: 1 }}
          onPress={() => navigation.navigate("Register")}
        >
          CREATE ACCOUNT
        </Button>

        <Button
          size="xl"
          type="contained"
          onPress={() => navigation.navigate("Login")}
          style={{
            backgroundColor: Colors.secondary,
            flex: 1,
          }}
          fontStyle={{ fontSize: 18 }}
        >
          LOGIN
        </Button>
      </View>
    </ScreenContainer>
  );
}
