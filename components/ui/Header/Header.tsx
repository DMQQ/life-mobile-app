import Animated, { AnimatedStyle } from "react-native-reanimated";
import IconButton from "../IconButton/IconButton";
import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { View } from "react-native";
import throttle from "@/utils/functions/throttle";

export default function Header(props: {
  buttons: {
    onPress: () => void;
    icon: JSX.Element | React.ReactNode;
  }[];
  title?: string;
  goBack?: boolean;
  titleAnimatedStyle?: AnimatedStyle;

  backIcon?: JSX.Element;
}) {
  const navigation = useNavigation();
  return (
    <View
      style={{
        flexDirection: "row",
        padding: 10,
        paddingHorizontal: 15,
        justifyContent: "space-between",
        alignItems: "center",
      }}
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

      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          flexDirection: "row",
          gap: 10,
        }}
      >
        {props.buttons.map((button, index) => (
          <IconButton key={index} onPress={throttle(button.onPress, 250)} icon={button.icon} />
        ))}
      </View>
    </View>
  );
}
