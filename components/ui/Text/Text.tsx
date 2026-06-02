import Colors, { Sizing } from "@/constants/Colors"
import { Text as RNText, TextProps as RNTextProps, StyleProp, TextStyle } from "react-native"

export type TextVariant = "heading" | "subheading" | "body" | "caption" | "title" | "subtitle" | "label"

export interface TextProps extends Omit<RNTextProps, "style"> {
    variant?: TextVariant
    color?: string
    weight?: TextStyle["fontWeight"]
    align?: TextStyle["textAlign"]
    size?: number
    lineHeight?: number
    letterSpacing?: number
    opacity?: number
    flex?: number
    muted?: boolean
    dim?: boolean
    mono?: boolean
    italic?: boolean
    uppercase?: boolean
    underline?: boolean
    strikethrough?: boolean
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
        letterSpacing: 0.3,
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
    label: {
        fontSize: 11,
        fontWeight: "600",
        color: Colors.foreground_secondary,
        letterSpacing: 0.8,
        textTransform: "uppercase",
    },
}

function Text({
    variant = "body",
    color,
    weight,
    align,
    size,
    lineHeight,
    letterSpacing,
    opacity,
    flex,
    muted,
    dim,
    mono,
    italic,
    uppercase,
    underline,
    strikethrough,
    style,
    children,
    ...props
}: TextProps) {
    const overrides: TextStyle = {}

    if (color) overrides.color = color
    else if (muted) overrides.color = Colors.foreground_secondary
    else if (dim) overrides.color = Colors.foreground_disabled

    if (weight) overrides.fontWeight = weight
    if (align) overrides.textAlign = align
    if (size) overrides.fontSize = size
    if (lineHeight) overrides.lineHeight = lineHeight
    if (letterSpacing !== undefined) overrides.letterSpacing = letterSpacing
    if (opacity !== undefined) overrides.opacity = opacity
    if (flex !== undefined) overrides.flex = flex
    if (italic) overrides.fontStyle = "italic"
    if (uppercase) overrides.textTransform = "uppercase"
    if (underline) overrides.textDecorationLine = "underline"
    if (strikethrough) overrides.textDecorationLine = "line-through"
    if (mono) overrides.fontVariant = ["tabular-nums"]

    return (
        <RNText style={[variantStyles[variant], overrides, style]} {...props}>
            {children}
        </RNText>
    )
}

type VariantProps = Omit<TextProps, "variant">

function Heading({ style, ...props }: VariantProps) {
    return <Text variant="heading" style={style} {...props} />
}

function Title({ style, ...props }: VariantProps) {
    return <Text variant="title" style={style} {...props} />
}

function SubHeading({ style, ...props }: VariantProps) {
    return <Text variant="subheading" style={style} {...props} />
}

function Subtitle({ style, ...props }: VariantProps) {
    return <Text variant="subtitle" style={style} {...props} />
}

function Body({ style, ...props }: VariantProps) {
    return <Text variant="body" style={style} {...props} />
}

function Caption({ style, ...props }: VariantProps) {
    return <Text variant="caption" style={style} {...props} />
}

function Label({ style, ...props }: VariantProps) {
    return <Text variant="label" style={style} {...props} />
}

Text.Heading = Heading
Text.Title = Title
Text.SubHeading = SubHeading
Text.Subtitle = Subtitle
Text.Body = Body
Text.Caption = Caption
Text.Label = Label

export default Text

export { Heading, Title, SubHeading, Subtitle, Body, Caption, Label }
