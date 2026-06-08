import { Feather } from "@expo/vector-icons"
import Colors from "@/constants/Colors"
import React from "react"
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native"
import Text from "@/components/ui/Text/Text"

interface ActionRowProps {
    icon: React.ComponentProps<typeof Feather>["name"]
    label: string
    onPress?: () => void
    last?: boolean
    disabled?: boolean
    loading?: boolean
}

export default function ActionRow({ icon, label, onPress, last, disabled, loading }: ActionRowProps) {
    const Container = onPress ? Pressable : View
    return (
        <Container
            onPress={onPress}
            disabled={disabled}
            style={[styles.row, last && styles.rowLast, disabled && styles.rowDisabled]}
        >
            <Feather name={icon} size={20} color={Colors.foreground_secondary} style={styles.icon} />
            <Text size={16} color={Colors.foreground_secondary} style={{ flex: 1 }}>
                {label}
            </Text>
            {loading ? (
                <ActivityIndicator size={16} color={Colors.foreground_secondary} />
            ) : (
                <Feather name="chevron-right" size={16} color={Colors.text_dark} />
            )}
        </Container>
    )
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        borderBottomWidth: 1,
        borderColor: Colors.borderColor,
    },
    rowLast: {
        borderBottomWidth: 0,
    },
    rowDisabled: {
        opacity: 0.35,
    },
    icon: {
        paddingHorizontal: 7.5,
        padding: 2.5,
    },
})
