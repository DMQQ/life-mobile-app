import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { Feather } from "@expo/vector-icons"
import Text from "./Text/Text"
import Colors from "@/constants/Colors"
import Color from "color"

type HintVariant = "info" | "warning" | "error" | "success"

interface HintProps {
    text: string
    variant?: HintVariant
    style?: StyleProp<ViewStyle>
}

const variantConfig: Record<HintVariant, { icon: React.ComponentProps<typeof Feather>["name"]; color: string }> = {
    info: { icon: "info", color: Colors.secondary },
    warning: { icon: "alert-triangle", color: Colors.warning },
    error: { icon: "alert-circle", color: Colors.danger },
    success: { icon: "check-circle", color: "#34C759" },
}

export default function Hint({ text, variant = "info", style }: HintProps) {
    const { icon, color } = variantConfig[variant]

    return (
        <View style={[styles.container, { backgroundColor: Color(color).alpha(0.1).string() }, style]}>
            <Feather name={icon} size={13} color={color} style={styles.icon} />
            <Text variant="caption" style={[styles.text, { color }]}>
                {text}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 7,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
    },
    icon: {
        marginTop: 1,
    },
    text: {
        flex: 1,
        lineHeight: 18,
    },
})
