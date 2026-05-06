import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import Colors from "@/constants/Colors"

interface DividerProps {
    color?: string
    thickness?: number
    style?: StyleProp<ViewStyle>
    vertical?: boolean
}

export default function Divider({ color, thickness = StyleSheet.hairlineWidth, style, vertical = false }: DividerProps) {
    return (
        <View
            style={[
                vertical ? styles.vertical : styles.horizontal,
                {
                    backgroundColor: color ?? Colors.primary_lighter,
                    ...(vertical ? { width: thickness } : { height: thickness }),
                },
                style,
            ]}
        />
    )
}

const styles = StyleSheet.create({
    horizontal: {
        width: "100%",
    },
    vertical: {
        alignSelf: "stretch",
    },
})
