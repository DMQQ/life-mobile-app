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
        Hi there!
      </Text>

      <View
        style={{
          flex: 1,
          position: "absolute",
          bottom: 0,
          width: Layout.screen.width,
          justifyContent: "center",
          padding: 15,
        }}
      >
        <Button
          size="xl"
          type="contained"
          onPress={() => navigation.navigate("Login")}
          style={{
            borderRadius: 100,
            backgroundColor: secondary_candidates[2],
          }}
          fontStyle={{ fontSize: 16 }}
        >
          login
        </Button>
        <Button
          size="xl"
          type="contained"
          fontStyle={{ fontSize: 16 }}
          style={{ marginTop: 10, borderRadius: 100 }}
          onPress={() => navigation.navigate("Register")}
        >
          register now
        </Button>
      </View>
    </ScreenContainer>
  );
}
