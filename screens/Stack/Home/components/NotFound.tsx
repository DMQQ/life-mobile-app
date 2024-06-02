import { StyleSheet, Text, View } from "react-native";
import SVGImage from "./SVGImage";
import Layout from "@/constants/Layout";
import Button from "@/components/ui/Button/Button";
import moment from "moment";
import Colors, { Sizing } from "@/constants/Colors";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeIn } from "react-native-reanimated";
import Color from "color";

const styles = StyleSheet.create({
  container: {
    paddingVertical: 7.5,
    alignItems: "center",
    flexDirection: "row",
    flex: 1,
  },
  heading: {
    color: "#fff",
    fontSize: Sizing.subHead + 2,
    fontWeight: "bold",
  },
  content: {
    color: "#fff",
    fontSize: 17,
    flex: 1,
    flexWrap: "wrap",
    marginTop: 2.5,
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
    <View style={{ flexDirection: "column", flex: 1, width: "100%" }}>
      <View style={styles.container}>
        <Animated.View entering={FadeIn.delay(50)} style={{ marginRight: 10 }}>
          <SVGImage width={Layout.screen.width / 5} height={100} />
        </Animated.View>
        <View style={{ flex: 1 }}>
          <Animated.Text entering={FadeIn.delay(75)} style={styles.heading}>
            No events found
          </Animated.Text>
          <Animated.Text
            entering={FadeIn.delay(100)}
            lineBreakMode="clip"
            textBreakStrategy="highQuality"
            style={styles.content}
          >
            Create events to keep track of your daily activities
          </Animated.Text>
        </View>
      </View>

      <Animated.View entering={FadeIn.delay(150)}>
        <Button
          onPress={onPress}
          style={{
            backgroundColor: Colors.primary,
            borderRadius: 100,
          }}
          fontStyle={{ color: "#fff", fontSize: 16 }}
        >
          Create event
        </Button>
      </Animated.View>
    </View>
  );
}
