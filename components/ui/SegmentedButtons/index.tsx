import { View, Text, StyleProp, TextStyle } from "react-native";
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
}

export default function SegmentedButtons(props: SegmentedButtonsProps) {
  if (props.buttons === undefined || props.buttons.length === 0) return null;

  if (props.value === undefined)
    throw new Error("SegmentedButtons: value is undefined");

  return (
    <View
      style={{
        flexDirection: "row",
        // width: Layout.screen.width - 20,
        width: "100%",
        backgroundColor: Color(Colors.primary).lighten(0.5).toString(),
        borderWidth: 2,
        borderColor: props.isError ? Colors.error : Colors.primary_light,
        borderRadius: 5,
        marginBottom: 10,
      }}
    >
      {props.buttons.map((value, index) => (
        <Ripple
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
                  : Color(Colors.primary).lighten(0.5).toString(),
            },
            props.buttonStyle,
          ]}
        >
          {value.icon}
          <Text
            style={[
              {
                //  color: Colors.secondary,
                color: "#fff",
                fontSize: 16,
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
