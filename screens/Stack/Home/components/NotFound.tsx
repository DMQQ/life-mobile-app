import { StyleSheet, Text, View } from "react-native";
import SVGImage from "./SVGImage";
import Layout from "@/constants/Layout";
import Button from "@/components/ui/Button/Button";
import moment from "moment";
import Colors, { Sizing } from "@/constants/Colors";
import { useNavigation } from "@react-navigation/native";
import Animated, {
  FadeIn,
  SlideInUp,
  ZoomIn,
  ZoomInDown,
  ZoomInUp,
} from "react-native-reanimated";

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
        <Animated.View entering={FadeIn.delay(50)}>
          <SVGImage width={Layout.screen.width / 4} height={100} />
        </Animated.View>
        <View style={{ paddingHorizontal: 15 }}>
          <Animated.Text entering={FadeIn.delay(75)} style={styles.heading}>
            Your Calendar is Empty{" "}
          </Animated.Text>
          <Animated.Text
            entering={FadeIn.delay(100)}
            lineBreakMode="clip"
            textBreakStrategy="highQuality"
            style={styles.content}
          >
            No upcoming events in{"\n"}your calendar.{"\n"}
          </Animated.Text>
        </View>
      </View>

      <Animated.View entering={FadeIn.delay(150)}>
        <Button
          onPress={onPress}
          size="xl"
          style={{ backgroundColor: "#fff", borderRadius: 100 }}
          fontStyle={{ color: Colors.primary }}
        >
          Create event
        </Button>
      </Animated.View>
    </View>
  );
}
