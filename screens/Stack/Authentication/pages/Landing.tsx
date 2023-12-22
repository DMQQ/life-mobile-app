import { Image, View } from "react-native";
import ScreenContainer from "../../../../components/ui/ScreenContainer";
import Button from "../../../../components/ui/Button/Button";

import Layout from "../../../../constants/Layout";
import Color from "color";
import Colors from "@/constants/Colors";

export default function Landing({ navigation }: any) {
  return (
    <ScreenContainer>
      {[1, 2, 3].map((index) => (
        <Image
          key={index}
          source={{
            uri: "https://blog.tubikstudio.com/wp-content/uploads/2022/08/flower-store-app-design-tubik.jpg",
          }}
          style={{
            width: "100%",
            height: Layout.screen.height - 250,
            marginBottom: 15,
            borderRadius: 10,
          }}
        />
      ))}

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
          color="primary"
          onPress={() => navigation.navigate("Login")}
          style={{ borderRadius: 100 }}
        >
          login
        </Button>
        <Button
          size="xl"
          type="contained"
          color="ternary"
          style={{ marginTop: 10, borderRadius: 100 }}
          onPress={() => navigation.navigate("Register")}
        >
          register now
        </Button>
      </View>
    </ScreenContainer>
  );
}
