import Colors, { Sizing } from "@/constants/Colors"
import { Text as RNText, TextProps as RNTextProps, StyleProp, TextStyle } from "react-native"

export type TextVariant = "heading" | "subheading" | "body" | "caption" | "title" | "subtitle"

export interface TextProps extends Omit<RNTextProps, "style"> {
    variant?: TextVariant
    color?: string
    style?: StyleProp<TextStyle>
}

const getVariantStyles = (variant: TextVariant): TextStyle => {
    switch (variant) {
        case "heading":
            return {
                fontSize: 60,
                fontWeight: "bold",
                color: Colors.foreground,
                letterSpacing: 1,
            }
        case "title":
            return {
                fontSize: Sizing.heading,
                fontWeight: "600",
                color: Colors.foreground,
                letterSpacing: 0.5,
            }
        case "subheading":
            return {
                fontSize: Sizing.subHead,
                fontWeight: "600",
                color: Colors.text_light,
            }
        case "subtitle":
            return {
                fontSize: 16,
                fontWeight: "500",
                color: Colors.foreground_secondary,
                opacity: 0.8,
            }
        case "body":
            return {
                fontSize: Sizing.text,
                fontWeight: "400",
                color: Colors.foreground,
            }
        case "caption":
            return {
                fontSize: Sizing.tooltip,
                fontWeight: "400",
                color: Colors.foreground_secondary,
            }
        default:
            return {
                fontSize: Sizing.text,
                fontWeight: "400",
                color: Colors.foreground,
            }
    }
}

export default function Text({ variant = "body", color, style, children, ...props }: TextProps) {
    const variantStyles = getVariantStyles(variant)
    const colorStyle = color ? { color } : {}

    return (
        <RNText style={[variantStyles, colorStyle, style]} {...props}>
            {children}
        </RNText>
    )
}