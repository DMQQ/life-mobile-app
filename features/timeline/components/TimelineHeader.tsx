import Colors from "@/constants/Colors";
import Layout from "@/constants/Layout";
import { AntDesign } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import Ripple from "react-native-material-ripple";
import Animated, {
  Layout as LayoutAnim,
  FadeIn,
  SharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
} from "react-native-reanimated";

const styles = StyleSheet.create({
  container: {
    width: Layout.screen.width,
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  title: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.secondary,
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 100,
  },
  buttonText: { fontSize: 16, fontWeight: "600", color: "#fff", marginLeft: 5 },
});

const AnimatedRipple = Animated.createAnimatedComponent(Ripple);

const Header = (props: {
  navigation: any;
  isCompleted: boolean;
  onTaskToggle: Function;
  scrollY: SharedValue<number>;
  title: string;
}) => {
  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: props.scrollY.value > 40 ? withTiming(1) : withTiming(0),
  }));

  const buttonTextHideStyle = useAnimatedStyle(() =>
    props.isCompleted
      ? {
          opacity:
            props.scrollY.value > 40
              ? withTiming(0, { duration: 100 })
              : withDelay(200, withTiming(1)),
          display: props.scrollY.value > 40 ? "none" : "flex",
        }
      : {}
  );

  const handleBack = () => {
    props.navigation.canGoBack() && props.navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Ripple onPress={handleBack} style={{ padding: 10 }}>
        <AntDesign name="arrowleft" size={20} color={"#fff"} />
      </Ripple>

      <Animated.Text style={[styles.title, titleAnimatedStyle]}>
        {props.title}
      </Animated.Text>

      <AnimatedRipple
        disabled={props.isCompleted}
        onPress={() => props.onTaskToggle()}
        style={styles.button}
      >
        {props.isCompleted && (
          <AntDesign name="checkcircle" size={18} color={"#fff"} />
        )}
        <Animated.Text
          entering={FadeIn.delay(100)}
          style={[styles.buttonText, buttonTextHideStyle]}
        >
          {props.isCompleted ? "Finished" : "Not Completed"}
        </Animated.Text>
      </AnimatedRipple>
    </View>
  );
};

export default Header;
