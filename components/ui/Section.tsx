import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import React from "react"
import { StyleSheet, View } from "react-native"

const s = StyleSheet.create({
    sectionGap: { marginTop: 30 },
    sectionLabel: {
        color: Colors.text_dark,
        fontSize: 11.5,
        letterSpacing: 0.6,
        textTransform: "uppercase",
        marginBottom: 7,
        marginLeft: 4,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 7,
        marginLeft: 4,
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
}

export default function Section({ title, headerRight, children, noGap }: SectionProps) {
    return (
        <View style={!noGap && s.sectionGap}>
            {headerRight ? (
                <View style={s.headerRow}>
                    <Text style={s.sectionLabel}>{title}</Text>
                    {headerRight}
                </View>
            ) : (
                <Text style={s.sectionLabel}>{title}</Text>
            )}
            <View style={s.card}>{children}</View>
        </View>
    )
}
