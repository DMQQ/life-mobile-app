import React from "react"
import { Pressable, PressableProps, StyleProp, TextStyle, View, ViewStyle } from "react-native"
import { BUTTON_BORDER_RADIUS, BUTTON_SIZE, BUTTON_TYPES, VARIANTS, styles } from "./assets"

import Colors from "@/constants/Colors"
import Text from "@/components/ui/Text/Text"
import lowOpacity from "@/utils/functions/lowOpacity"
import Color from "color"
import GlassView from "../GlassView"

export interface ButtonProps extends PressableProps {
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

    const resolvedBg = (style as any)?.backgroundColor as string | undefined
    const tintColor = disabled
        ? resolvedBg
            ? lowOpacity(resolvedBg, 0.1)
            : lowOpacity(mainColor, 0.5)
        : mainColor

    return (
        <Pressable style={{ flex: 1 }} onPress={callback} disabled={disabled} {...rest}>
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
                <View style={iconStyle}>{icon}</View>

                {typeof children !== "undefined" && (
                    <Text variant="body" style={[styles.text, textStyle, fontStyle]}>
                        {children}
                    </Text>
                )}
            </GlassView>
        </Pressable>
    )
}

export const ViewMoreButton = (props: { onPress: () => any; text: string; disabled?: boolean; bg?: string }) => (
    <Pressable
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
    </Pressable>
)
