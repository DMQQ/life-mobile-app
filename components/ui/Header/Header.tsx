import Animated, { AnimatedStyle } from "react-native-reanimated";
import IconButton from "../IconButton/IconButton";
import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { View, ViewStyle } from "react-native";
import throttle from "@/utils/functions/throttle";
import { StyleProp } from "react-native";

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
}) {
  const navigation = useNavigation();
  return (
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
        }}
      >
        {(props.buttons || []).map((button, index) => (
          <IconButton style={button.style} key={index} onPress={throttle(button.onPress, 250)} icon={button.icon} />
        ))}
      </View>
    </View>
  );
}
