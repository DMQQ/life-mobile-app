import Colors from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Text, View } from "react-native";
import Ripple from "react-native-material-ripple";

export default function Header() {
  const navigation = useNavigation<any>();

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: Colors.primary,
        marginBottom: 15,
      }}
    >
      <Text style={{ color: "#fff", fontSize: 24, fontWeight: "500" }}>
        Hello 🤟
      </Text>

      <Ripple onPress={() => navigation.navigate("Settings")}>
        <MaterialIcons name="settings" color={"#fff"} size={24} />
      </Ripple>
    </View>
  );
}
