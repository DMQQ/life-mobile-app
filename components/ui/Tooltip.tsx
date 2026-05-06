import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import Text from "./Text/Text"
import Colors from "@/constants/Colors"
import Color from "color"

type TooltipPosition = "top" | "bottom" | "left" | "right"

interface TooltipProps {
    label: string
    position?: TooltipPosition
    color?: string
    style?: StyleProp<ViewStyle>
    children: React.ReactNode
}

export default function Tooltip({ label, position = "top", color = Colors.primary_lighter, style, children }: TooltipProps) {
    const bubblePositionStyle = bubblePosition[position]
    const arrowStyle = arrowStyles[position]

    return (
        <View style={[styles.wrapper, style]}>
            {children}
            <View style={[styles.bubble, { backgroundColor: color }, bubblePositionStyle]}>
                <View style={[styles.arrow, arrowStyle, { borderTopColor: color }]} />
                <Text variant="caption" style={styles.label} numberOfLines={2}>
                    {label}
                </Text>
            </View>
        </View>
    )
}

const bubblePosition: Record<TooltipPosition, ViewStyle> = {
    top: { bottom: "100%", left: "50%", transform: [{ translateX: -50 }], marginBottom: 6 },
    bottom: { top: "100%", left: "50%", transform: [{ translateX: -50 }], marginTop: 6 },
    left: { right: "100%", top: "50%", transform: [{ translateY: -50 }], marginRight: 6 },
    right: { left: "100%", top: "50%", transform: [{ translateY: -50 }], marginLeft: 6 },
}

const arrowStyles: Record<TooltipPosition, ViewStyle> = {
    top: { bottom: -5, top: "auto", borderTopWidth: 5, borderBottomWidth: 0 },
    bottom: { top: -5, bottom: "auto", borderBottomWidth: 5, borderTopWidth: 0, borderTopColor: "transparent" },
    left: { right: -5, top: "50%", transform: [{ translateY: -5 }] },
    right: { left: -5, top: "50%", transform: [{ translateY: -5 }] },
}

const styles = StyleSheet.create({
    wrapper: {
        position: "relative",
    },
    bubble: {
        position: "absolute",
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 8,
        minWidth: 80,
        maxWidth: 200,
        zIndex: 999,
    },
    label: {
        color: Colors.foreground,
        fontSize: 12,
        textAlign: "center",
    },
    arrow: {
        position: "absolute",
        left: "50%",
        transform: [{ translateX: -5 }],
        width: 0,
        height: 0,
        borderLeftWidth: 5,
        borderRightWidth: 5,
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderTopWidth: 5,
        borderTopColor: Colors.primary_lighter,
    },
})
