import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"

interface RowProps {
    children: React.ReactNode
    gap?: number
    justify?: "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly"
    align?: "flex-start" | "flex-end" | "center" | "stretch" | "baseline"
    wrap?: boolean
    style?: StyleProp<ViewStyle>
}

export default function Row({
    children,
    gap = 8,
    justify = "flex-start",
    align = "center",
    wrap = false,
    style,
}: RowProps) {
    return (
        <View
            style={[
                styles.row,
                { gap, justifyContent: justify, alignItems: align, flexWrap: wrap ? "wrap" : "nowrap" },
                style,
            ]}
        >
            {children}
        </View>
    )
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
    },
})
