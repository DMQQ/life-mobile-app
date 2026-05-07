import { AnimatedSelector } from "@/components"
import DatePicker from "@/components/DatePicker"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import moment from "moment"
import React from "react"
import { StyleSheet, View } from "react-native"

export type Types = "total" | "avg" | "median" | "count"

interface ChartTemplatePropsWithTypes {
    children: (dt: { dateRange: [string, string]; type: Types }) => React.ReactNode
    title: string
    description: string
    types: Types[]
    initialStartDate?: string
    initialEndDate?: string
}

type ChartTemplateProps = ChartTemplatePropsWithTypes

export default function ChartTemplate({
    children,
    title,
    description,
    types,
    initialStartDate,
    initialEndDate,
}: ChartTemplateProps) {
    const [type, setType] = React.useState<Types>(types ? types[0] : "total")
    const [dateRange, setDateRange] = React.useState<[string, string]>([
        initialStartDate ?? moment().subtract(1, "months").format("YYYY-MM-DD"),
        initialEndDate ?? moment().format("YYYY-MM-DD"),
    ])

    return (
        <View style={styles.container}>
            <View style={{ marginBottom: 15 }}>
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginBottom: 15,
                        alignItems: "center",
                    }}
                >
                    <Text variant="body" style={{ color: Colors.foreground, fontWeight: "bold", fontSize: 18 }}>
                        {title}
                    </Text>

                    <DatePicker
                        mode="period"
                        dates={{
                            start: moment(dateRange[0]).toDate(),
                            end: moment(dateRange[1]).toDate(),
                        }}
                        setDates={({ start, end }) =>
                            setDateRange([moment(start).format("YYYY-MM-DD"), moment(end).format("YYYY-MM-DD")])
                        }
                    />
                </View>

                <Text variant="caption" style={{ color: "gray", marginBottom: 10 }}>
                    {description}
                </Text>
            </View>

            {types && types.length > 0 && (
                <View style={{ marginBottom: 15 }}>
                    <AnimatedSelector
                        items={types}
                        selectedItem={type}
                        onItemSelect={setType}
                        hapticFeedback
                        containerStyle={{
                            backgroundColor: Colors.primary,
                        }}
                        scale={1}
                    />
                </View>
            )}

            <View>{children?.({ dateRange, type: type })}</View>

        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, marginBottom: 50 },
    dateToggleButton: {
        backgroundColor: Colors.secondary,
        padding: 4,
        paddingHorizontal: 8,
        flexDirection: "row",
        borderRadius: 100,
        alignItems: "center",
        gap: 6,
    },
})
