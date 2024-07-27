import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import Ripple from "react-native-material-ripple";
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";

export default function FloatingButton(props: {
  onPress: () => void;
  scrollY?: SharedValue<number>;
  position?: number;
  children?: React.ReactNode;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          props.scrollY?.value ?? 0,
          [0, 250],
          [0, 150],
          Extrapolation.CLAMP
        ),
      },
    ],
    zIndex: 100,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          right: 15 + (props.position || 0) * 6, // TypeError: Cannot assign to read-only property 'validated'
          bottom: (props?.position || 0) * 70 + 15, // TypeError: Cannot assign to read-only property 'validated'
        },
        animatedStyle,
      ]}
    >
      <Ripple
        rippleColor={"#fff"}
        rippleContainerBorderRadius={100}
        onPress={props.onPress}
        style={[
          {
            padding: 12.5,
            borderRadius: 100,
            backgroundColor: Colors.secondary,

            zIndex: 300,

            shadowColor: Colors.secondary,

            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,

            eklevation: 5,
          },
        ]}
      >
        <>{props.children}</>
      </Ripple>
    </Animated.View>
  );
}
