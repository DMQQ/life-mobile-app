import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutRight,
} from "react-native-reanimated";
import Colors from "../../../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import Ripple from "react-native-material-ripple";
import Color from "color";
import L from "../../../../constants/Layout";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const styles = StyleSheet.create({
  iconContainer: {
    zIndex: 100,
    position: "absolute",
    right: 15,
    bottom: 120,
  },
  menu: {
    position: "absolute",
    width: L.screen.width,
    height: L.screen.height,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  iconButton: {
    padding: 15,
    borderRadius: 100,
    marginBottom: 15,
  },
});

const IconButton = (props: {
  color: string;
  onPress: Function;
  icon: string;
  delay?: number;
}) => (
  <Animated.View
    entering={SlideInRight.delay(props.delay || 0)}
    exiting={SlideOutRight.delay(props.delay || 0)}
  >
    <Ripple
      onPress={() => props.onPress()}
      style={[
        styles.iconButton,
        { backgroundColor: props.color || Colors.secondary },
      ]}
    >
      <Ionicons color={"#fff"} size={30} name={props.icon as any} />
    </Ripple>
  </Animated.View>
);

const Menu = ({
  isVisible,
  navigation,
  setIsVisible,
}: {
  isVisible: boolean;
  navigation: any;
  setIsVisible: any;
}) =>
  isVisible ? (
    <AnimatedPressable
      entering={FadeIn}
      exiting={FadeOut}
      onPress={() => setIsVisible(false)}
      style={styles.menu}
    >
      <View
        // layout={Layout}
        style={styles.iconContainer}
      >
        <IconButton
          icon="create"
          onPress={() => navigation.navigate("WorkoutCreate")}
          color={Colors.secondary}
          delay={isVisible ? 0 : 350}
        />
        <IconButton
          icon="search"
          onPress={() => {}}
          color={Color(Colors.secondary).darken(0.2).string()}
          delay={100}
        />
        <IconButton
          icon="options"
          onPress={() => {}}
          color={Color(Colors.secondary).darken(0.4).string()}
          delay={isVisible ? 150 : 50}
        />
        <IconButton
          icon="close"
          onPress={() => setIsVisible(false)}
          color={Color(Colors.secondary).darken(0.6).string()}
          delay={isVisible ? 200 : 0}
        />
      </View>
    </AnimatedPressable>
  ) : null;

export default Menu;
