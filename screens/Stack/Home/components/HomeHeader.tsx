import Colors from "@/constants/Colors";
import useUser from "@/utils/hooks/useUser";
import { AntDesign } from "@expo/vector-icons";
import { Alert, Text, View } from "react-native";
import Ripple from "react-native-material-ripple";

export default function Header() {
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
        paddingHorizontal: 20,
        padding: 15,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: Colors.primary,
      }}
    >
      <Text style={{ color: "#fff", fontSize: 20 }}>Hello Damian</Text>

      <Ripple onPress={handleSignout}>
        <Text style={{ color: Colors.error, fontSize: 16, marginRight: 5 }}>
          Signout
        </Text>
      </Ripple>
    </View>
  );
}
