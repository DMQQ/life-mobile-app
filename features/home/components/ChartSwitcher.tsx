import { useState } from "react"
import { StyleSheet, Text, View, Pressable } from "react-native"
import Colors from "@/constants/Colors"
import Color from "color"
import Animated, { FadeIn, FadeOut } from "react-native-reanimated"
import WeeklyComparisonChart from "./WalletChart"
import BalancePredictionChart from "./BalancePredictionChart"
import { MaterialCommunityIcons } from "@expo/vector-icons"

type ChartType = "weekly" | "prediction"

const ChartSwitcher = () => {
    const [activeChart, setActiveChart] = useState<ChartType>("weekly")

    return (
        <View style={styles.container}>
            <View style={styles.tabContainer}>
                <Pressable
                    style={[styles.tab, activeChart === "weekly" && styles.activeTab]}
                    onPress={() => setActiveChart("weekly")}
                >
                    <MaterialCommunityIcons
                        name="chart-bar"
                        size={16}
                        color={activeChart === "weekly" ? Colors.text_light : Color(Colors.text_light).alpha(0.5).string()}
                    />
                    <Text style={[styles.tabText, activeChart === "weekly" && styles.activeTabText]}>Weekly</Text>
                </Pressable>

                <Pressable
                    style={[styles.tab, activeChart === "prediction" && styles.activeTab]}
                    onPress={() => setActiveChart("prediction")}
                >
                    <MaterialCommunityIcons
                        name="chart-line"
                        size={16}
                        color={activeChart === "prediction" ? Colors.text_light : Color(Colors.text_light).alpha(0.5).string()}
                    />
                    <Text style={[styles.tabText, activeChart === "prediction" && styles.activeTabText]}>
                        Prediction
                    </Text>
                </Pressable>
            </View>

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
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        gap: 12,
    },
    tabContainer: {
        flexDirection: "row",
        backgroundColor: Color(Colors.primary_light).alpha(0.3).string(),
        borderRadius: 12,
        padding: 4,
        gap: 6,
    },
    tab: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        gap: 6,
    },
    activeTab: {
        backgroundColor: Color(Colors.secondary).alpha(0.2).string(),
    },
    tabText: {
        fontSize: 13,
        fontWeight: "600",
        color: Color(Colors.text_light).alpha(0.5).string(),
    },
    activeTabText: {
        color: Colors.text_light,
    },
    chartContent: {
        minHeight: 250,
    },
})

export default ChartSwitcher
