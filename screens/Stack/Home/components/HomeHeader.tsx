import Colors from "@/constants/Colors";
import useUser from "@/utils/hooks/useUser";
import { Text, View } from "react-native";

export default function Header() {
  const { removeUser } = useUser();

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
    </View>
  );
}
