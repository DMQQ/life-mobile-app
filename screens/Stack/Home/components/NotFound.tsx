import { StyleSheet, Text, View } from "react-native";
import SVGImage from "./SVGImage";
import Layout from "@/constants/Layout";
import Button from "@/components/ui/Button/Button";
import moment from "moment";
import Colors, { Sizing } from "@/constants/Colors";
import { useNavigation } from "@react-navigation/native";

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    marginBottom: 10,
    alignItems: "center",
    flexDirection: "row",
  },
  heading: {
    color: "#fff",
    fontSize: Sizing.subHead - 2,
    fontWeight: "bold",
  },
  content: {
    color: "#fff",
    fontSize: 18,
    flex: 1,
    flexWrap: "wrap",
    marginTop: 5,
  },
});

export default function NotFound() {
  const navigation = useNavigation<any>();

  const onPress = () => {
    navigation.navigate("TimelineScreens", {
      selectedDate: moment().format("YYYY-MM-DD"),
    });
  };

  return (
    <View style={{ flexDirection: "column" }}>
      <View style={styles.container}>
        <SVGImage width={Layout.screen.width / 4} height={100} />
        <View style={{ paddingHorizontal: 15 }}>
          <Text style={styles.heading}>Your Calendar is Empty </Text>
          <Text
            lineBreakMode="clip"
            textBreakStrategy="highQuality"
            style={styles.content}
          >
            No upcoming events in{"\n"}your calendar.{"\n"}
          </Text>
        </View>
      </View>

      <Button
        onPress={onPress}
        size="xl"
        style={{ backgroundColor: "#fff", borderRadius: 100 }}
        fontStyle={{ color: Colors.primary }}
      >
        Create event
      </Button>
    </View>
  );
}
