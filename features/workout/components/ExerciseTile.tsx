import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { Exercise } from "@/types";
import Color from "color";
import Colors from "@/constants/Colors";
import Ripple from "react-native-material-ripple";
import { AntDesign } from "@expo/vector-icons";

const styles = StyleSheet.create({
  image: {
    width: 100,
    height: 75,
    borderRadius: 10,
  },
  container: {
    width: "100%",
    padding: 10,
    marginBottom: 15,
    borderRadius: 10,
    flexDirection: "row",
    height: 95,
  },
  contentContainer: {
    flex: 1,
    height: "100%",
    paddingLeft: 10,
  },
});

const TESTING_IMAGE = "https://cdn.w600.comps.canstockphoto.com/men-training-on-the-bench-press-icon-vector-clip-art_csp45589515.jpg";

export default function ExerciseTile(props: Exercise & { onPress: (exerciseId: string) => any }) {
  return (
    <View style={styles.container}>
      <Image
        style={styles.image}
        source={{
          uri: TESTING_IMAGE,
          width: 100,
          height: 75,
        }}
      />
      <View style={styles.contentContainer}>
        <Text style={{ fontWeight: "bold", color: "#fff", fontSize: 20 }}>{props.title}</Text>
        <Text style={{ fontWeight: "500", color: "#ffffff8c" }} numberOfLines={3}>
          {props.description}
        </Text>
      </View>
      <View style={{ height: "100%", justifyContent: "center", marginLeft: 5 }}>
        <Ripple style={{ padding: 5 }} onPress={() => props.onPress(props.exerciseId)}>
          <AntDesign name="right" size={24} color={Colors.secondary} />
        </Ripple>
      </View>
    </View>
  );
}
