import React from "react"
import { Feather } from "@expo/vector-icons"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import Color from "color"

interface DetailRowProps {
    icon?: React.ComponentProps<typeof Feather>["name"]
    iconElement?: React.ReactNode
    children: React.ReactNode
    right?: React.ReactNode
    last?: boolean
    style?: StyleProp<ViewStyle>
    tint?: string
}

export default function DetailRow({ icon, iconElement, children, right, last, style, tint }: DetailRowProps) {
    const content = React.isValidElement(children) ? (
        children
    ) : (
        <Text variant="body" style={styles.text}>
            {children}
        </Text>
    )

    return (
        <View
            style={[
                styles.row,
                last && styles.lastRow,
                tint && { borderColor: Color(tint).mix(Color(Colors.primary_lighter), 0.85).hex() },
                style,
            ]}
        >
            {iconElement ??
                (icon ? (
                    <Feather name={icon} size={20} color={Colors.foreground_secondary} style={styles.icon} />
                ) : null)}
            {content}
            {right}
        </View>
    )
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 15,
        borderBottomWidth: 1,
        borderColor: Colors.borderColor,
    },
    lastRow: {
        borderBottomWidth: 0,
    },
    icon: {
        paddingHorizontal: 7.5,
        padding: 2.5,
    },
    text: {
        color: Colors.foreground_secondary,
        fontSize: 16,
        flex: 1,
        textAlign: "right",
    },
})
