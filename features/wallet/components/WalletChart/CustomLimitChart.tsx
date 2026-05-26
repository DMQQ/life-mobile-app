import Layout from "@/constants/Layout"
import React from "react"
import { StyleSheet, Text, View, ScrollView } from "react-native"
import Colors from "@/constants/Colors"
import Color from "color"
import AnimatedBar from "@/components/ui/Charts/AnimatedBar"
import moment from "moment"

export interface LimitBarItem {
    type: "bar"
    category: string
    month: string
    spent: number
    limit: number
    exceeded: boolean
    isLastInCategory: boolean
    isFirstInCategory?: boolean
    isMiddleInCategory?: boolean
}

interface CustomLimitChartProps {
    data: LimitBarItem[]
    maxValue: number
}

const BAR_WIDTH = 40
const BAR_SPACING = 8
export const CHART_HEIGHT = 180

const CustomLimitChart: React.FC<CustomLimitChartProps> = ({ data, maxValue }) => {
    return (
        <View style={styles.chartWrapper}>
            <View style={[styles.yAxisLabels, { height: CHART_HEIGHT }]}>
                {[4, 3, 2, 1, 0].map((i) => (
                    <Text key={i} style={styles.yAxisLabel}>
                        {Math.round((maxValue / 4) * i)}zł
                    </Text>
                ))}
            </View>

            <View style={styles.chartContent}>
                <View style={[styles.gridLines, { height: CHART_HEIGHT }]}>
                    {[0, 1, 2, 3, 4].map((i) => (
                        <View key={i} style={[styles.gridLine, { top: CHART_HEIGHT - (CHART_HEIGHT / 4) * i }]} />
                    ))}
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ height: CHART_HEIGHT + 40 }}
                >
                    <View
                        style={{ flexDirection: "row", paddingTop: 10, height: CHART_HEIGHT + 40, marginLeft: 15 }}
                    >
                        {data.map((item, index) => (
                            <AnimatedBar
                                key={`bar-${index}`}
                                value={item.spent}
                                prevValue={item.limit}
                                maxValue={maxValue}
                                chartHeight={CHART_HEIGHT}
                                label={moment(item.month).format("MMM")}
                                index={index}
                                barWidth={BAR_WIDTH}
                                marginRight={BAR_SPACING}
                                color={item.exceeded ? Colors.danger : undefined}
                                labelColor={item.exceeded ? Colors.danger : Colors.secondary}
                                valueLabel={item.spent > 0 ? item.spent.toFixed(0) : undefined}
                            />
                        ))}
                    </View>
                </ScrollView>
            </View>
        </View>
    )
}

export default CustomLimitChart

const styles = StyleSheet.create({
    chartWrapper: {
        flexDirection: "row",
        height: 230,
        marginTop: 10,
    },
    yAxisLabels: {
        width: 50,
        justifyContent: "space-between",
        alignItems: "flex-end",
        paddingRight: 5,
    },
    yAxisLabel: {
        color: Colors.foreground,
        fontSize: 10,
    },
    chartContent: {
        flex: 1,
        position: "relative",
    },
    gridLines: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
    },
    gridLine: {
        position: "absolute",
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: Color(Colors.primary).lighten(0.8).string(),
    },
})
