import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import Color from "color"
import React from "react"
import { StyleSheet, View } from "react-native"
import Animated, { LinearTransition } from "react-native-reanimated"

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
        backgroundColor: Color(Colors.primary_lighter).alpha(0.75).hexa(),
        borderRadius: 20,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: Colors.borderColor,
    },
})

interface SectionProps {
    title: string
    headerRight?: React.ReactNode
    children?: React.ReactNode
    noGap?: boolean

    cardStyle?: any

    tint?: string
}

export default function Section({ title, headerRight, children, noGap, cardStyle, tint }: SectionProps) {
    return (
        <Animated.View style={!noGap && s.sectionGap} layout={LinearTransition}>
            <View style={s.headerRow}>
                <Text style={s.sectionLabel}>{title}</Text>
                {headerRight}
            </View>

            <View
                style={[
                    s.card,
                    cardStyle,
                    tint && {
                        backgroundColor: Color(tint).mix(Color(Colors.primary_lighter), 0.95).hex(),
                        borderColor: Color(tint).mix(Color(Colors.primary_lighter), 0.8).hex(),
                    },
                ]}
            >
                {children}
            </View>
        </Animated.View>
    )
}
