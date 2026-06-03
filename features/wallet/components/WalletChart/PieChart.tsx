import { FONTS } from "@/constants/Fonts"
import { formatAmount } from "@/utils/functions/formatCurrency"
import { PieChart as GFTPieChart } from "react-native-gifted-charts"
import Colors, { secondary_candidates } from "@/constants/Colors"
import Layout from "@/constants/Layout"
import { View } from "react-native"
import Text from "@/components/ui/Text/Text"

interface PieChartProps {
    onPress: (dt: { label: string; value: number; color: string }) => void
    data: { label: string; value: number; color: string }[]
    totalSum: number
    focusedIndex?: number | null
    centerLabel?: { title: string; subtitle: string; color?: string }
}

const blueText = Colors.foreground_secondary

export default function PieChart(props: PieChartProps) {
    const mappedData =
        props.data.length !== 0
            ? props.data.map((v, i) => ({
                  ...v,
                  value: +v.value.toFixed(2),
                  focused: props.focusedIndex != null ? i === props.focusedIndex : false,
              }))
            : [{ label: "No data", value: 1, color: secondary_candidates[0], focused: false }]

    const center = props.centerLabel

    return (
        <GFTPieChart
            onPress={props.onPress}
            innerCircleColor={Colors.primary}
            showGradient
            donut
            focusOnPress
            radius={(Layout.screen.width - 30) / 2.6}
            data={mappedData}
            textSize={15}
            showValuesAsLabels
            showValuesAsTooltipText
            showTooltip
            strokeWidth={2}
            strokeColor={Colors.primary}
            textColor={Colors.foreground}
            innerRadius={90}
            centerLabelComponent={() => (
                <View style={{ alignItems: "center" }}>
                    <Text
                        variant="subheading"
                        style={{ color: center?.color ?? Colors.foreground, textAlign: "center" }}
                    >
                        {center?.title ?? formatAmount(props.totalSum) + "zł"}
                    </Text>
                    <Text
                        variant="caption"
                        style={{
                            color: center ? (center.color ?? blueText) : blueText,
                            fontFamily: FONTS.bold,
                            textAlign: "center",
                            marginTop: 5,
                            opacity: 0.7,
                        }}
                    >
                        {center?.subtitle ?? "Total"}
                    </Text>
                </View>
            )}
        />
    )
}
