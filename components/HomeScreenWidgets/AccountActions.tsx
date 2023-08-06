import { View } from "react-native";
import Colors from "../../constants/Colors";
import Color from "color";
import { Text, Alert } from "react-native";
import Button from "../ui/Button/Button";
import useUser from "../../utils/hooks/useUser";
import Ripple from "react-native-material-ripple";
import { ScreenProps } from "../../types";

export default function AccountActions({ navigation }: ScreenProps<"Root">) {
  const { removeUser } = useUser();

  const handleSignout = () => {
    Alert.alert("Signout", "Are you sure you want to signout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Signout",
        onPress: () => removeUser(),
      },
    ]);
  };

  return (
    <View
      style={{
        backgroundColor: Color(Colors.primary).lighten(0.5).string(),
        borderRadius: 10,
        padding: 15,
        marginTop: 15,
      }}
    >
      <Text
        style={{
          color: Colors.secondary,
          fontSize: 25,
          fontWeight: "bold",
          marginBottom: 10,
        }}
      >
        Account Actions
      </Text>

      <Ripple
        style={{ padding: 10, paddingHorizontal: 15, marginBottom: 10 }}
        onPress={() => navigation.navigate("Settings")}
      >
        <Text style={{ color: "#fff" }}>Settings</Text>
      </Ripple>

      <Button
        onPress={handleSignout}
        type="contained"
        fontStyle={{
          color: Colors.secondary,
        }}
        style={{
          backgroundColor: Color(Colors.secondary).alpha(0.15).string(),
        }}
      >
        Signout
      </Button>
    </View>
  );
}
