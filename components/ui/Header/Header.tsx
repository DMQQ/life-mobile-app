import Animated, { AnimatedStyle, useAnimatedStyle, interpolate, Extrapolation, SharedValue } from "react-native-reanimated";
import IconButton from "../IconButton/IconButton";
import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { View, ViewStyle, Text, TextStyle } from "react-native";
import throttle from "@/utils/functions/throttle";
import { StyleProp } from "react-native";
import Layout from "@/constants/Layout";
import { AnimatedNumber } from "@/components";
import Ripple from "react-native-material-ripple";

export default function Header(props: {
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
}) {
  const navigation = useNavigation();

  const animatedContainerStyle = useAnimatedStyle(() => {
    if (!props.scrollY || !props.animated) return {};

    return {
      height: interpolate(props.scrollY.value, [0, 200], [150, 0], Extrapolation.CLAMP),
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
      top: interpolate(props.scrollY.value, [0, 200], [25, -68], Extrapolation.CLAMP),
      left: interpolate(props.scrollY.value, [0, 200], [25, -120], Extrapolation.CLAMP),
      // width: interpolate(props.scrollY.value, [0, 200], [Layout.screen.width - 50, 100], Extrapolation.CLAMP),
    };
  }, [props.scrollY, props.animated]);

  const animatedLabelStyle = useAnimatedStyle(() => {
    if (!props.scrollY || !props.animated) return {};

    return {
      opacity: interpolate(props.scrollY.value, [0, 100], [1, 0], Extrapolation.CLAMP),
    };
  }, [props.scrollY, props.animated]);

  const displayValue = props.animatedValueLoading && props.animatedValue === undefined ? " ..." : (props.animatedValue || 0).toFixed(2);

  return (
    <>
      <View
        style={[
          {
            flexDirection: "row",
            padding: 10,
            paddingHorizontal: 15,
            justifyContent: "space-between",
            alignItems: "center",
          },
          props.containerStyle,
        ]}
      >
        {props.goBack && (
          <IconButton
            onPress={throttle(() => navigation.canGoBack() && navigation.goBack(), 250)}
            icon={props.backIcon || <AntDesign name="arrowleft" size={24} color="#fff" />}
          />
        )}

        {props.titleAnimatedStyle && props.title && (
          <Animated.Text
            style={[
              {
                color: "#fff",
                fontSize: 16,
                fontWeight: "600",
                letterSpacing: 0.5,
              },
              props.titleAnimatedStyle,
            ]}
          >
            {props.title}
          </Animated.Text>
        )}

        {props.children}

        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            flexDirection: "row",
            gap: 10,
            zIndex: 100,
          }}
        >
          {(props.buttons || []).map((button, index) => (
            <IconButton style={button.style} key={index} onPress={throttle(button.onPress, 250)} icon={button.icon} />
          ))}
        </View>
      </View>

      {(props.animatedTitle || props.animatedValue !== undefined) && (
        <Animated.View
          style={[
            {
              width: Layout.screen.width,
              height: 150,
              flexDirection: "row",
              paddingHorizontal: 20,
            },
            props.animated && animatedContainerStyle,
          ]}
        >
          <Animated.View style={[{ position: "absolute", left: 0 }, props.animated && animatedContentStyle]}>
            <Ripple onLongPress={props.onAnimatedTitleLongPress}>
              {props.animatedValue !== undefined ? (
                <AnimatedNumber
                  delay={250}
                  value={parseFloat(displayValue)}
                  style={[
                    {
                      fontSize: 60,
                      fontWeight: "bold",
                      textAlign: "center",
                      color: "#fff",
                      letterSpacing: 1,
                    },
                    props.animated && animatedContentStyle,
                  ]}
                  formatValue={props.animatedValueFormat || ((value) => `${value.toFixed(2)}`)}
                />
              ) : (
                <Text
                  style={[
                    {
                      fontSize: 60,
                      fontWeight: "bold",
                      color: "#fff",
                      letterSpacing: 1,
                      width: Layout.screen.width - 30,
                    },
                    props.animated && animatedContentStyle,
                  ]}
                >
                  {props.animatedTitle}
                </Text>
              )}

              {props.animatedSubtitle && (
                <Animated.Text
                  style={[
                    {
                      color: "rgba(255,255,255,0.6)",
                      fontSize: 16,
                      opacity: 0.8,
                      width: Layout.screen.width - 30,
                    },
                    props.animated && animatedLabelStyle,
                    props.subtitleStyles || {},
                  ]}
                >
                  {props.animatedSubtitle}
                </Animated.Text>
              )}
            </Ripple>
          </Animated.View>
        </Animated.View>
      )}
    </>
  );
}
