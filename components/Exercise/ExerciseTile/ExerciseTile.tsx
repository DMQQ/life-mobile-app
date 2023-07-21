import { Image, Pressable, Text, View } from "react-native";
import { Exercise } from "../../../types";
import Colors from "../../../constants/Colors";
import Color from "color";
import Animated, { FadeIn } from "react-native-reanimated";

const defaultImageUri =
  "https://cdn-icons-png.flaticon.com/512/2548/2548437.png";

export default function ExerciseTile({
  image = defaultImageUri,
  muscleGroup,
  title,
  exerciseId,
  difficulty,
  description,
  ...rest
}: Exercise & { onPress: Function; tileIndex: number }) {
  return (
    <Animated.View entering={FadeIn.delay(rest.tileIndex * 75)}>
      <Pressable
        onPress={() => rest.onPress()}
        style={{
          backgroundColor: Color(Colors.primary).lighten(0.5).hex(),
          padding: 13,
          borderRadius: 10,
          flexDirection: "row",
          marginBottom: 10,
        }}
      >
        <Image
          style={{
            width: 40,
            height: 40,
          }}
          source={{ uri: !!!image ? defaultImageUri : image }}
        />
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text
            style={{
              color: Colors.secondary,
              fontSize: 20,
              fontWeight: "bold",
              lineHeight: 25,
            }}
          >
            {title}
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#bababa" }}>{muscleGroup}</Text>

            <View style={{ flexDirection: "row" }}>
              <Text
                style={{
                  color: "#000",
                  fontSize: 13,
                  backgroundColor: Colors.secondary,
                  paddingHorizontal: 10,
                  padding: 2,
                  borderRadius: 10,
                  marginRight: 5,
                }}
              >
                {difficulty}
              </Text>

              <Text
                style={{
                  color: "#000",
                  fontSize: 13,
                  backgroundColor: Colors.secondary,
                  paddingHorizontal: 10,
                  padding: 2,
                  borderRadius: 10,
                }}
              >
                3x8
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
