import { useState } from "react"
import { StyleSheet, View } from "react-native"
import Colors from "@/constants/Colors"
import Color from "color"
import Animated, { FadeIn, FadeOut } from "react-native-reanimated"
import WeeklyComparisonChart from "./WalletChart"
import BalancePredictionChart from "./BalancePredictionChart"
import GroupSelector from "@/components/ui/GroupSelector"
import Section from "@/components/ui/Section"

type ChartType = "weekly" | "prediction"

const ChartSwitcher = () => {
    const [activeChart, setActiveChart] = useState<ChartType>("weekly")

    return (
        <Section title="Overview">
            <View style={styles.container}>
                <View style={styles.chartContent}>
                    {activeChart === "weekly" ? (
                        <Animated.View entering={FadeIn} exiting={FadeOut} key="weekly">
                            <WeeklyComparisonChart />
                        </Animated.View>
                    ) : (
                        <Animated.View entering={FadeIn} exiting={FadeOut} key="prediction">
                            <BalancePredictionChart />
                        </Animated.View>
                    )}
                </View>

                <GroupSelector
                    options={[
                        { label: "Weekly", value: "weekly" as ChartType },
                        { label: "Prediction", value: "prediction" as ChartType },
                    ]}
                    value={activeChart}
                    onChange={(value) => setActiveChart(value)}
                />
            </View>
        </Section>
    )
}

const styles = StyleSheet.create({
    container: {
        gap: 12,
        padding: 15,
    },
    tabContainer: {
        flexDirection: "row",
        backgroundColor: Colors.primary_lighter,
        borderRadius: 14,
        padding: 4,
        gap: 4,
    },
    tab: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 9,
        paddingHorizontal: 12,
        borderRadius: 10,
        gap: 6,
    },
    activeTab: {
        backgroundColor: Color(Colors.secondary).alpha(0.18).string(),
        borderWidth: 1,
        borderColor: Color(Colors.secondary).alpha(0.25).string(),
    },
    tabText: {
        fontSize: 12,
        fontWeight: "600",
        letterSpacing: 0.3,
        color: Color(Colors.text_light).alpha(0.4).string(),
    },
    activeTabText: {
        color: Colors.text_light,
    },
    chartContent: {
        overflow: "hidden",
        height: 230,
    },
})

export default ChartSwitcher
