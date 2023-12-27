import {
  View,
  TextInput,
  Text,
  StyleProp,
  ViewStyle,
  TextInputProps,
  TextStyle,
} from "react-native";
import styles from "./styles";
import React, { useState } from "react";
import Layout from "../../../constants/Layout";
import Colors from "../../../constants/Colors";
import { Theme, useTheme } from "../../../utils/context/ThemeContext";

import * as Icons from "@expo/vector-icons";
import Color from "color";
import Ripple from "react-native-material-ripple";

export interface RenderComponentProps {
  isError: boolean;
  theme: Theme;

  isFocused: boolean;
}

export interface InputProps extends TextInputProps {
  /**
   * Input label
   **/
  name?: string;
  /**
   * Input value
   **/
  value: string;
  /** 
     Input set text function
      **/
  setValue?: (text: string) => void;
  /**
   * input container style
   **/
  style?: StyleProp<ViewStyle & TextStyle>;
  /**
   * label style
   **/
  labelStyle?: StyleProp<TextStyle>;
  /**
   * placeholder color
   **/
  placeholderColor?: string;
  /**
   * ref
   **/
  inputRef?: any;
  /**
   * hint text
   **/
  helperText?: string;
  /**
   * hint text style
   **/
  helperStyle?: StyleProp<TextStyle>;
  /**
   * Is error state
   **/
  error?: boolean;

  /**
   * Icon to be displayed on the left side of the input
   **/

  left?: ((props: RenderComponentProps) => React.ReactNode) | React.ReactNode;

  /**
   * Icon to be displayed on the right side of the input
   **/

  right?: ((props: RenderComponentProps) => React.ReactNode) | React.ReactNode;

  /**
   * size of the input
   */
  size?: "small" | "medium" | "large";

  label?: string;
}

export default function Input({
  name,
  value = "",
  setValue,
  style,
  placeholderColor = "black",
  labelStyle = {},
  inputRef,
  helperText,
  helperStyle,
  error = false,
  left,
  right,
  onBlur,
  ...rest
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const { theme } = useTheme();

  const renderComponentProps = {
    isError: error,
    theme,

    isFocused,
  };

  return (
    <View style={styles.container}>
      {typeof name !== "undefined" && (
        <Text
          style={[
            styles.label,
            labelStyle,
            {
              color: error ? "#ff3030" : "#e0e0e0f1",
            },
          ]}
        >
          {rest?.label || name} {rest.label && helperText && `(${helperText})`}
        </Text>
      )}
      <View
        style={{
          backgroundColor: isFocused
            ? Colors.primary_lighter
            : Colors.primary_light,
          borderRadius: 7.5,
          flexDirection: "row",
          width: (style as any)?.width ?? Layout.screen.width * 0.95,
          borderWidth: 2,
          borderColor: error
            ? Colors.error
            : isFocused
            ? Colors.secondary
            : Colors.primary_light,
          alignItems: "center",
        }}
      >
        {!!left && (
          <View style={{ paddingHorizontal: 7.5 }}>
            {typeof left === "function" ? left(renderComponentProps) : left}
          </View>
        )}
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholderTextColor={error ? "#ff3030" : "white"}
          style={[
            styles.input,
            style,
            {
              borderWidth: 0,
              color: error
                ? "#ff3030"
                : isFocused
                ? theme.colors.secondary
                : "white",
            },
          ]}
          {...rest}
          ref={inputRef}
          onFocus={(event) => {
            setIsFocused(true);
            rest?.onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
        />
        {!!right && (
          <View style={{ paddingHorizontal: 7.5 }}>
            {typeof right === "function" ? right(renderComponentProps) : right}
          </View>
        )}
      </View>
      {typeof helperText !== "undefined" && !rest.label && (
        <Text
          style={[
            styles.label,
            {
              color: error ? "#ff3030" : "#e0e0e0",
              fontSize: 15,
              fontWeight: "400",
              marginLeft: 10,
            },
            helperStyle,
          ]}
        >
          {helperText}
        </Text>
      )}
    </View>
  );
}

Input.Icon = ({
  Icon = "AntDesign",
  ...props
}: {
  name: any;
  size?: number;
  isError: boolean;
  isFocused: boolean;
  Icon?: keyof typeof Icons;
  theme: Theme;
  onPress?: () => void;
}) => {
  const Component = Icons[Icon];

  return (
    <Ripple onPress={props.onPress}>
      <Component
        {...props}
        size={props.size || 25}
        color={
          props.isError
            ? Colors.error
            : props.isFocused
            ? props.theme.colors.secondary
            : "#fff"
        }
      />
    </Ripple>
  );
};
