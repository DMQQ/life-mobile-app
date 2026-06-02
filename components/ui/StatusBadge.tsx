import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { FONTS } from "@/constants/Fonts"
import Text from "./Text/Text"
import Colors from "@/constants/Colors"
import Color from "color"

type StatusBadgeVariant = "todo" | "done" | "late" | "high" | "med" | "low" | "custom"

interface StatusBadgeProps {
    variant: StatusBadgeVariant
    label?: string
    color?: string
    style?: StyleProp<ViewStyle>
}

const variantConfig: Record<StatusBadgeVariant, { color: string; label: string }> = {
    todo: { color: Colors.secondary, label: "To do" },
    done: { color: "#34C759", label: "Done" },
    late: { color: "#BA4343", label: "Late" },
    high: { color: "#FF3B30", label: "High" },
    med: { color: "#007AFF", label: "Med" },
    low: { color: "#34C759", label: "Low" },
    custom: { color: Colors.secondary, label: "" },
}

export default function StatusBadge({ variant, label, color, style }: StatusBadgeProps) {
    const config = variantConfig[variant]
    const resolvedColor = color ?? config.color
    const resolvedLabel = label ?? config.label

    return (
        <View
            style={[
                styles.badge,
                { backgroundColor: Color(resolvedColor).alpha(0.15).string() },
                style,
            ]}
        >
            <Text style={[styles.label, { color: resolvedColor }]}>{resolvedLabel}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    badge: {
        paddingVertical: 3,
        paddingHorizontal: 10,
        borderRadius: 100,
        alignSelf: "flex-end",
    },
    label: {
        fontSize: 12,
        fontFamily: FONTS.semibold,
    },
})
