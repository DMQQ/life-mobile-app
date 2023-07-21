import { FlatList, Image, Text, View, ImageBackground } from "react-native";
import ScreenContainer from "../../components/ui/ScreenContainer";
import Button from "../../components/ui/Button/Button";
import { ScreenProps } from "../../types";
import Layout from "../../constants/Layout";
import { StatusBar } from "expo-status-bar";

export default function Landing({ navigation }: ScreenProps<"Landing">) {
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
          type="contained"
          color="primary"
          onPress={() => navigation.navigate("Login")}
        >
          login
        </Button>
        <Button
          type="contained"
          color="ternary"
          style={{ marginTop: 10 }}
          onPress={() => navigation.navigate("Register")}
        >
          register now
        </Button>
      </View>
    </ScreenContainer>
  );
}
