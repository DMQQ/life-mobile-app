import Colors, { Sizing } from "@/constants/Colors"
import { Text as RNText, TextProps as RNTextProps, StyleProp, TextStyle } from "react-native"

export type TextVariant = "heading" | "subheading" | "body" | "caption" | "title" | "subtitle"

export interface TextProps extends Omit<RNTextProps, "style"> {
    variant?: TextVariant
    color?: string
    style?: StyleProp<TextStyle>
}

const variantStyles: Record<TextVariant, TextStyle> = {
    heading: {
        fontSize: 60,
        fontWeight: "bold",
        color: Colors.foreground,
        letterSpacing: 1,
    },
    title: {
        fontSize: Sizing.heading,
        fontWeight: "600",
        color: Colors.foreground,
        letterSpacing: 0.5,
    },
    subheading: {
        fontSize: Sizing.subHead,
        fontWeight: "600",
        color: Colors.text_light,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: "500",
        color: Colors.foreground_secondary,
        opacity: 0.8,
    },
    body: {
        fontSize: Sizing.text,
        fontWeight: "400",
        color: Colors.foreground,
    },
    caption: {
        fontSize: Sizing.tooltip,
        fontWeight: "400",
        color: Colors.foreground_secondary,
    },
}

export default function Text({ variant = "body", color, style, children, ...props }: TextProps) {
    return (
        <RNText
            style={[variantStyles[variant], color ? { color } : undefined, style]}
            {...props}
        >
            {children}
        </RNText>
    )
}

export function Heading({ style, ...props }: Omit<TextProps, "variant">) {
    return <Text variant="heading" style={style} {...props} />
}

export function Title({ style, ...props }: Omit<TextProps, "variant">) {
    return <Text variant="title" style={style} {...props} />
}

export function SubHeading({ style, ...props }: Omit<TextProps, "variant">) {
    return <Text variant="subheading" style={style} {...props} />
}

export function Subtitle({ style, ...props }: Omit<TextProps, "variant">) {
    return <Text variant="subtitle" style={style} {...props} />
}

export function Body({ style, ...props }: Omit<TextProps, "variant">) {
    return <Text variant="body" style={style} {...props} />
}

export function Caption({ style, ...props }: Omit<TextProps, "variant">) {
    return <Text variant="caption" style={style} {...props} />
}
