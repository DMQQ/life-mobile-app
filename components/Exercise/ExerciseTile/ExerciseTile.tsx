import {
  Image,
  LayoutRectangle,
  Pressable,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { Exercise } from "../../../types";
import Colors from "../../../constants/Colors";
import Color from "color";
import Animated, { FadeIn, Layout } from "react-native-reanimated";
import Button from "../../ui/Button/Button";
import { useState } from "react";

//prettier-ignore
const images = {
  "Pull-ups": "https://cdn-icons-png.flaticon.com/512/7922/7922199.png",
  "Running": "https://cdn-icons-png.flaticon.com/512/384/384276.png",
  "Bench Press": "https://cdn-icons-png.flaticon.com/512/2548/2548437.png",
  "Push up": "https://cdn-icons-png.flaticon.com/512/2548/2548536.png",
  Squats: "https://cdn-icons-png.flaticon.com/512/3476/3476084.png",
  "Barbell Rows": "https://cdn-icons-png.flaticon.com/512/5147/5147078.png",
  Rowing: "https://cdn-icons-png.flaticon.com/512/5147/5147078.png",
  "Bicep Curls": "https://cdn-icons-png.flaticon.com/512/11437/11437950.png",
  Dips: "https://cdn-icons-png.flaticon.com/512/11437/11437950.png",
  "Dumbbell Press": "https://cdn-icons-png.flaticon.com/512/8843/8843250.png",
  'Calf Raises':'https://cdn-icons-png.flaticon.com/512/7922/7922227.png',
  'Leg Press':'https://cdn-icons-png.flaticon.com/512/7922/7922179.png',
  'Plank':'https://cdn-icons-png.flaticon.com/512/2647/2647643.png'
};

export const ExerciseIcon = (props: { name: keyof typeof images }) => (
  <Image
    style={{
      width: 40,
      height: 40,
      margin: GAPS,
    }}
    source={{
      uri: images[props.name] || defaultImageUri,
    }}
  />
);

const defaultImageUri =
  "https://cdn-icons-png.flaticon.com/512/1895/1895100.png";

const GAPS = 10;

export default function ExerciseTile({
  image = defaultImageUri,
  muscleGroup,
  title,
  exerciseId,
  difficulty,
  description,
  ...rest
}: Exercise & {
  onPress: Function;
  tileIndex: number;
  enableActionButtons?: boolean;
  styles?: StyleProp<ViewStyle>;
}) {
  const [isVisible, setIsVisible] = useState(false);

  const [layout, setLayout] = useState<LayoutRectangle | undefined>();

  return (
    <Animated.View
      onLayout={(ev) => setLayout(ev.nativeEvent.layout)}
      entering={FadeIn.delay(rest.tileIndex * 75)}
      style={[
        {
          backgroundColor: Color(Colors.primary).lighten(0.5).hex(),
          padding: GAPS,
          borderRadius: 10,
          marginBottom: 10,
        },
        rest.styles,
      ]}
    >
      <Pressable
        onLongPress={() => setIsVisible((p) => !p)}
        style={{ flexDirection: "row" }}
        onPress={() => {
          rest.onPress();
        }}
      >
        <ExerciseIcon name={title as keyof typeof images} />
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: Colors.secondary,
              fontSize: 18,
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
              marginTop: GAPS / 2,
            }}
          >
            <Text style={{ color: "#bababa" }} lineBreakMode="clip">
              {muscleGroup.slice(0, 25)}
            </Text>

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
      {isVisible && rest.enableActionButtons && (
        <View
          style={{
            width: layout?.width,
            height: layout?.height,
            position: "absolute",
            backgroundColor: "rgba(0,0,0,0.25)",
            padding: 15,
            borderRadius: 10,
            flexDirection: "row",
            flex: 1,
          }}
        >
          <Button
            onPress={() => {}}
            fontStyle={{ fontSize: 15 }}
            type="contained"
            style={{ backgroundColor: Colors.error, flex: 3, marginRight: 20 }}
          >
            Remove
          </Button>
          <Button
            onPress={() => setIsVisible(false)}
            fontStyle={{ fontSize: 15 }}
            type="contained"
            style={{ backgroundColor: Colors.ternary, flex: 1 }}
          >
            Cancel
          </Button>
        </View>
      )}
    </Animated.View>
  );
}
