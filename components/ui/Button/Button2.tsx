import React from "react"
import { StyleProp, TextStyle, View, ViewStyle } from "react-native"
import Ripple, { RippleProps } from "react-native-material-ripple"

import { BUTTON_BORDER_RADIUS, BUTTON_SIZE, BUTTON_TYPES, VARIANTS, styles } from "./assets"

import Colors from "@/constants/Colors"
import Text from "@/components/ui/Text/Text"
import lowOpacity from "@/utils/functions/lowOpacity"
import Color from "color"
import GlassView from "../GlassView"

export interface ButtonProps extends RippleProps {
    children?: React.ReactNode
    /** Function called on onPress event */
    callback?: () => void
    icon?: React.ReactNode
    style?: StyleProp<ViewStyle>
    /** Styles applied to button's text */
    fontStyle?: StyleProp<TextStyle>
    /** Styles applied to icon's container */
    iconStyle?: StyleProp<ViewStyle>
    /** DEPRECATED Style variants of button component */
    variant?: keyof typeof VARIANTS
    /** Floating element to display number */
    badge?: number
    size?: keyof typeof BUTTON_SIZE
    borderRadius?: keyof typeof BUTTON_BORDER_RADIUS
    disabled?: boolean
    /**  Style variants of button component */
    type?: keyof typeof BUTTON_TYPES
    /** Color variants of button */
    color?: keyof typeof VARIANTS
}

export default function Button({
    children,
    callback = () => {},
    icon,
    style,
    fontStyle,
    iconStyle,
    type = "contained",
    variant = "ternary",
    badge,
    size = "lg",
    disabled,
    borderRadius = "lg",
    color,
    ...rest
}: ButtonProps) {
    const mainColor = VARIANTS[color || variant]

    const disabledColor = Color(mainColor).alpha(0.15).string()

    const buttonStyle = {
        ...BUTTON_SIZE[size],
        ...BUTTON_TYPES[type](!disabled ? mainColor : disabledColor),
        borderRadius: BUTTON_BORDER_RADIUS[borderRadius],
    }

    const textStyle = {
        color: Color(type === "outlined" ? mainColor : Colors.foreground)
            .alpha(disabled ? 0.5 : 1)
            .string(),
    }

    const tintColor = disabled
        ? style?.backgroundColor
            ? lowOpacity(style?.backgroundColor, 0.1)
            : lowOpacity(mainColor, 0.5)
        : mainColor

    return (
        <GlassView
            key={tintColor}
            tintColor={tintColor}
            style={[
                styles.button,
                buttonStyle,
                style,
                {
                    backgroundColor: undefined,
                    borderRadius: 15,
                },
            ]}
        >
            <Ripple
                style={{ flexDirection: "row", gap: 10 }}
                testID={"Button"}
                rippleCentered
                onPress={callback}
                disabled={disabled}
                {...rest}
            >
                <View style={iconStyle}>{icon}</View>

                {typeof children !== "undefined" && (
                    <Text variant="body" style={[styles.text, textStyle, fontStyle]}>
                        {children}
                    </Text>
                )}
            </Ripple>
        </GlassView>
    )
}

export const ViewMoreButton = (props: { onPress: () => any; text: string; disabled?: boolean; bg?: string }) => (
    <Ripple
        onPress={props.onPress}
        disabled={props.disabled}
        style={{
            borderRadius: 100,
            padding: 5,
            paddingHorizontal: 10,
        }}
    >
        <Text
            variant="body"
            style={{
                color: Colors.foreground,
            }}
        >
            {props.text}
        </Text>
    </Ripple>
)
