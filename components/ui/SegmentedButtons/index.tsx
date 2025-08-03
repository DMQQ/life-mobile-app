import { View, StyleProp, TextStyle, ViewStyle } from "react-native";
import Text from "@/components/ui/Text/Text";
import Layout from "../../../constants/Layout";
import Colors from "../../../constants/Colors";
import Color from "color";
import Ripple, { RippleProps } from "react-native-material-ripple";
import { ReactNode } from "react";

interface SegmentProps {
  value: string;
  text: string;
  icon?: ReactNode;
}

interface SegmentedButtonsProps {
  buttons: SegmentProps[];
  value: string;
  onChange: (value: string) => void;
  isError?: boolean;
  errorMessage?: string;

  buttonStyle?: RippleProps["style"];
  buttonTextStyle?: StyleProp<TextStyle>;

  direction?: "row" | "column";

  containerStyle?: StyleProp<ViewStyle>;
}

export default function SegmentedButtons(props: SegmentedButtonsProps) {
  if (props.buttons === undefined || props.buttons.length === 0) return null;

  if (props.value === undefined)
    throw new Error("SegmentedButtons: value is undefined");

  return (
    <View
      style={[
        {
          flexDirection: props.direction || "row",
          // width: Layout.screen.width - 20,
          width: "100%",
          backgroundColor: Colors.primary_light,
          borderWidth: 2,
          borderColor: props.isError ? Colors.error : Colors.primary_light,
          borderRadius: 5,
          marginBottom: 10,
        },
        props.containerStyle,
      ]}
    >
      {props.buttons.map((value, index) => (
        <Ripple
          rippleColor={Colors.secondary}
          onPress={() => props.onChange(value.value)}
          key={value.value}
          style={[
            {
              height: 60,
              justifyContent: "center",
              flexDirection: "row",
              alignItems: "center",
              flex: 1,
              // borderRightWidth: index === props.buttons.length - 1 ? 0 : 2,
              // borderRightColor: Colors.primary_light,
              borderRadius: 10,
              backgroundColor:
                props.value === value.value
                  ? Colors.secondary
                  : Colors.primary_light,
            },
            props.buttonStyle,
          ]}
        >
          {value.icon}
          <Text
            variant="body"
            style={[
              {
                //  color: Colors.secondary,
                color: Colors.foreground,
                letterSpacing: 0.5,
                fontWeight: "bold",
              },
              props.buttonTextStyle,
            ]}
          >
            {value.text}
          </Text>
        </Ripple>
      ))}
    </View>
  );
}
