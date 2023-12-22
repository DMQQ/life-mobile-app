import { View } from "react-native";
import Colors, { Sizing } from "../../../../constants/Colors";
import { Text, Alert } from "react-native";
import Button from "../../../../components/ui/Button/Button";
import useUser from "../../../../utils/hooks/useUser";
import Ripple from "react-native-material-ripple";
import { Padding, Rounded } from "../../../../constants/Layout";

export default function AccountActions({ navigation }: any) {
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
        backgroundColor: "#1BA3B4",
        borderRadius: Rounded.xxl,
        padding: Padding.xxl,
        marginTop: 15,
        marginBottom: 15,
      }}
    >
      <Text
        style={{
          color: "#fff",
          fontSize: Sizing.heading,
          fontWeight: "bold",
          marginBottom: 10,
        }}
      >
        Settings
      </Text>

      <Ripple
        style={{ padding: 2.5, paddingHorizontal: 5, marginBottom: 10 }}
        onPress={() => navigation.navigate("Settings")}
      >
        <Text style={{ color: "#fff" }}>Settings</Text>
      </Ripple>

      <Button
        onPress={handleSignout}
        type="contained"
        size="xl"
        fontStyle={{
          color: Colors.primary,
        }}
        style={{
          backgroundColor: "#fff",
          marginTop: 10,
        }}
      >
        Sign out
      </Button>
    </View>
  );
}
