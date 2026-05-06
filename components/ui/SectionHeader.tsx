import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import Text from "./Text/Text"
import Colors from "@/constants/Colors"

interface SectionHeaderProps {
    title: string
    action?: React.ReactNode
    showDivider?: boolean
    style?: StyleProp<ViewStyle>
}

export default function SectionHeader({ title, action, showDivider = false, style }: SectionHeaderProps) {
    return (
        <View style={[styles.container, style]}>
            <View style={styles.row}>
                <Text variant="caption" style={styles.title}>
                    {title.toUpperCase()}
                </Text>
                {action && <View>{action}</View>}
            </View>
            {showDivider && <View style={styles.divider} />}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 10,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    title: {
        color: Colors.text_dark,
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 0.8,
    },
    divider: {
        marginTop: 8,
        height: StyleSheet.hairlineWidth,
        backgroundColor: Colors.primary_lighter,
    },
})
