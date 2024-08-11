import { Padding, Rounded } from "@/constants/Layout";
import { Text, View } from "react-native";
import Colors from "@/constants/Colors";
import Button from "@/components/ui/Button/Button";
import { useNavigation } from "@react-navigation/native";
import moment from "moment";

export default function CreateShoppingList() {
  const navigation = useNavigation<any>();
  return (
    <View
      style={{
        padding: Padding.xxl,
        backgroundColor: Colors.primary_lighter,
        borderRadius: Rounded.xxl,
        marginTop: 15,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
        Shopping list
      </Text>

      <Button
        variant="text"
        fontStyle={{ fontSize: 16 }}
        style={{ paddingVertical: 2.5 }}
        onPress={() =>
          navigation.navigate("TimelineScreens", {
            selectedDate: moment().format("YYYY-MM-DD"),
            mode: "shopping-list",
          })
        }
      >
        Create
      </Button>
    </View>
  );
}
