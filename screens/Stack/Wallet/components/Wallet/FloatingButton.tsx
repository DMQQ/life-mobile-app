import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import Ripple from "react-native-material-ripple";
import Animated, {
  Extrapolate,
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";

const AnimatedRipple = Animated.createAnimatedComponent(Ripple);

export default function FloatingButton(props: {
  onPress: () => void;
  scrollY?: SharedValue<number>;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          props.scrollY?.value ?? 0,
          [0, 250],
          [0, 150],
          Extrapolate.CLAMP
        ),
      },
    ],
    zIndex: 100,
  }));

  return (
    <AnimatedRipple
      onPress={props.onPress}
      style={[
        {
          position: "absolute",
          right: 15,
          bottom: 20,
          padding: 12.5,
          borderRadius: 100,
          backgroundColor: Colors.secondary,

          zIndex: 250,

          shadowColor: "#000",

          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        },
        animatedStyle,
      ]}
    >
      <Ionicons color={"#fff"} size={30} name={"add"} />
    </AnimatedRipple>
  );
}
