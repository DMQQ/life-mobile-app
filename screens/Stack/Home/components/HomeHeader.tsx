import Colors from "@/constants/Colors";
import { AntDesign } from "@expo/vector-icons";
import { Text, View } from "react-native";
import Ripple from "react-native-material-ripple";

export default function Header() {
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

      <Ripple
        style={{
          backgroundColor: "#fff",
          borderRadius: 10,
          paddingHorizontal: 10,
          padding: 5,
          flexDirection: "row",
        }}
      >
        <Text style={{ color: Colors.primary, fontSize: 16, marginRight: 5 }}>
          Account
        </Text>
        <AntDesign name="user" color={Colors.primary} size={22} />
      </Ripple>
    </View>
  );
}
