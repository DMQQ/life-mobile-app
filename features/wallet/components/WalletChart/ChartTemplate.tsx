import { FONTS } from "@/constants/Fonts"
import GroupSelector from "@/components/ui/GroupSelector"
import Colors from "@/constants/Colors"
import { Padding } from "@/constants/Layout"
import { Caption, Title } from "@/components"
import React from "react"
import { StyleSheet, View } from "react-native"
import { useWalletContext } from "../WalletContext"

export type Types = "total" | "avg" | "median" | "count"

interface ChartTemplateProps {
    children: (dt: { dateRange: [string, string]; type: Types }) => React.ReactNode
    title: string
    description: string
    types: Types[]
    initialStartDate?: string
    initialEndDate?: string
}

export default function ChartTemplate({
    children,
    title,
    description,
    types,
    initialStartDate,
    initialEndDate,
}: ChartTemplateProps) {
    const [type, setType] = React.useState<Types>(types?.[0] ?? "total")
    const { filters } = useWalletContext()

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Title style={styles.title}>{title}</Title>
                <Caption style={styles.description}>{description}</Caption>
            </View>

            {types.length > 0 && (
                <View style={styles.selectorRow}>
                    <GroupSelector
                        options={types.map((t) => ({ label: t.toUpperCase(), value: t }))}
                        value={type}
                        onChange={setType}
                    />
                </View>
            )}

            <View>{children({ dateRange: [filters.date.from, filters.date.to], type })}</View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: Padding.xxl,
    },
    header: {
        flexDirection: "column",
        gap: 10,
        marginBottom: 15,
    },
    headerLeft: {
        flex: 1,
        gap: Padding.xxs,
    },
    title: {
        fontSize: 30,
        fontFamily: FONTS.bold,
        color: Colors.foreground,
    },
    description: {
        color: Colors.foreground_secondary,
    },
    selectorRow: {
        marginBottom: Padding.l,
    },
})
