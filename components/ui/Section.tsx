import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import React from "react"
import { StyleSheet, View } from "react-native"

const s = StyleSheet.create({
    sectionGap: { marginTop: 30 },
    sectionLabel: {
        color: Colors.text_dark,
        fontSize: 12,
        letterSpacing: 0.6,
        textTransform: "uppercase",
        marginLeft: 4,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 7,
        marginLeft: 10,
    },
    card: {
        backgroundColor: Colors.primary_lighter,
        borderRadius: 20,
        overflow: "hidden",
    },
})

interface SectionProps {
    title: string
    headerRight?: React.ReactNode
    children?: React.ReactNode
    noGap?: boolean

    cardStyle?: any
}

export default function Section({ title, headerRight, children, noGap, cardStyle }: SectionProps) {
    return (
        <View style={!noGap && s.sectionGap}>
            <View style={s.headerRow}>
                <Text style={s.sectionLabel}>{title}</Text>
                {headerRight}
            </View>

            <View style={[s.card, cardStyle]}>{children}</View>
        </View>
    )
}
