import Animated, {
  AnimatedStyle,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  SharedValue,
  useAnimatedProps,
  interpolateColor,
} from "react-native-reanimated";
import IconButton from "../IconButton/IconButton";
import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ViewStyle, Text, TextStyle, StyleSheet } from "react-native";
import throttle from "@/utils/functions/throttle";
import { StyleProp } from "react-native";
import Layout from "@/constants/Layout";
import { AnimatedNumber } from "@/components";
import Ripple from "react-native-material-ripple";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AnimatedBlur = Animated.createAnimatedComponent(BlurView);

function Header(props: {
  buttons?: {
    onPress: () => void;
    icon: JSX.Element | React.ReactNode;
    style?: StyleProp<ViewStyle>;
  }[];
  title?: string;
  goBack?: boolean;
  titleAnimatedStyle?: AnimatedStyle;
  backIcon?: JSX.Element;
  children?: JSX.Element;
  containerStyle?: StyleProp<ViewStyle>;
  scrollY?: SharedValue<number>;
  animated?: boolean;
  animatedTitle?: string;
  animatedSubtitle?: string;
  animatedValue?: number;
  animatedValueLoading?: boolean;
  animatedValueFormat?: (value: number) => string;
  onAnimatedTitleLongPress?: () => void;
  subtitleStyles?: StyleProp<TextStyle>;
  initialHeight?: number;
}) {
  const navigation = useNavigation();

  const insets = useSafeAreaInsets();

  const animatedContainerStyle = useAnimatedStyle(() => {
    if (!props.scrollY || !props.animated) return {};

    return {
      marginTop: interpolate(props.scrollY.value, [0, 200], [15, 0], Extrapolation.CLAMP),
      height: 0,
    };
  }, [props.scrollY, props.animated]);

  const animatedContentStyle = useAnimatedStyle(() => {
    if (!props.scrollY || !props.animated) return {};

    return {
      transform: [
        {
          scale: interpolate(props.scrollY.value, [0, 200], [1, 0.35], Extrapolation.CLAMP),
        },
      ],
      top: interpolate(props.scrollY.value, [0, 200], [insets.top * 2, insets.top / 2 + 10], Extrapolation.CLAMP),
      left: interpolate(props.scrollY.value, [0, 200], [25, -120], Extrapolation.CLAMP),
    };
  }, [props.scrollY, props.animated]);

  const animatedLabelStyle = useAnimatedStyle(() => {
    if (!props.scrollY || !props.animated) return {};

    return {
      opacity: interpolate(props.scrollY.value, [0, 100], [1, 0], Extrapolation.CLAMP),
    };
  }, [props.scrollY, props.animated]);

  const displayValue = props.animatedValueLoading && props.animatedValue === undefined ? " ..." : (props.animatedValue || 0).toFixed(2);

  const animatedBlurProps = useAnimatedProps(() => ({
    intensity: interpolate(props.scrollY?.value || 0, [0, 200], [0, 80], Extrapolation.CLAMP),
  }));

  const animatedBlurStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(props.scrollY?.value || 0, [0, 200], ["rgba(0,0,0,0.0)", "rgba(0,0,0,0.3)"], "RGB"),
  }));

  const animatedHeight = useAnimatedStyle(
    () => ({
      height: props.animated ? interpolate(props.scrollY?.value || 0, [0, 200], [props.initialHeight || 200, 0], Extrapolation.CLAMP) : 40,
    }),
    []
  );

  return (
    <>
      <AnimatedBlur
        tint="dark"
        animatedProps={animatedBlurProps}
        style={[styles.blurContainer, { paddingTop: insets.top, height: insets.top + 50 }, animatedBlurStyle, props.containerStyle]}
      >
        {props.goBack && (
          <IconButton
            onPress={throttle(() => navigation.canGoBack() && navigation.goBack(), 250)}
            icon={props.backIcon || <AntDesign name="arrowleft" size={24} color="#fff" />}
          />
        )}

        {props.titleAnimatedStyle && props.title && (
          <Animated.Text style={[styles.animatedTitle, props.titleAnimatedStyle]}>{props.title}</Animated.Text>
        )}

        {props.children}

        <Animated.View style={styles.iconContainer}>
          {(props.buttons || []).map((button, index) => (
            <IconButton style={button.style} key={index} onPress={throttle(button.onPress, 250)} icon={button.icon} />
          ))}
        </Animated.View>
      </AnimatedBlur>

      {(props.animatedTitle || props.animatedValue !== undefined) && (
        <Animated.View style={[styles.container, props.animated && animatedContainerStyle]}>
          <Animated.View style={[styles.buttonContainer, props.animated && animatedContentStyle]}>
            <Ripple onLongPress={props.onAnimatedTitleLongPress}>
              {props.animatedValue !== undefined ? (
                <AnimatedNumber
                  delay={250}
                  value={parseFloat(displayValue)}
                  style={[styles.numericTitle, props.animated ? animatedContentStyle : {}]}
                  formatValue={props.animatedValueFormat || ((value) => `${value.toFixed(2)}`)}
                />
              ) : (
                <Text style={[styles.title, props.animated && animatedContentStyle]}>{props.animatedTitle}</Text>
              )}

              {props.animatedSubtitle && (
                <Animated.Text style={[styles.subTitle, props.animated && animatedLabelStyle, props.subtitleStyles || {}]}>
                  {props.animatedSubtitle}
                </Animated.Text>
              )}
            </Ripple>
          </Animated.View>
        </Animated.View>
      )}
      <Animated.View style={animatedHeight} />
    </>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    flex: 1,
    justifyContent: "flex-end",
    flexDirection: "row",
    gap: 10,
    zIndex: 250,
  },
  animatedTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
    zIndex: 210,
  },
  blurContainer: {
    flexDirection: "row",
    padding: 10,
    paddingHorizontal: 15,
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    top: 0,
    width: Layout.screen.width,
    zIndex: 100,
  },
  subTitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 16,
    opacity: 0.8,
    width: Layout.screen.width - 30,
  },
  title: {
    fontSize: 60,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 1,
    width: Layout.screen.width - 30,
  },
  numericTitle: {
    fontSize: 60,
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff",
    letterSpacing: 1,
  },
  container: {
    width: Layout.screen.width,
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 40,
    zIndex: 200,
    backgroundColor: "red",
  },
  buttonContainer: { position: "absolute", left: 0, zIndex: 200 },
});

export default Header;
