import Colors from "@/constants/Colors";
import useUser from "@/utils/hooks/useUser";
import { MaterialIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import Ripple from "react-native-material-ripple";

export default function Header() {
  const { removeUser } = useUser();

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
        Hello Damian
      </Text>

      <Ripple>
        <MaterialIcons name="settings" color={"#fff"} size={24} />
      </Ripple>
    </View>
  );
}
