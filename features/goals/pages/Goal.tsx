import Header from "@/components/ui/Header/Header"
import Text from "@/components/ui/Text/Text"
import Colors, { secondary_candidates } from "@/constants/Colors"
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons"
import Color from "color"
import moment from "moment"
import { useMemo } from "react"
import { StyleSheet, View } from "react-native"
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated"
import { SafeAreaView } from "react-native-safe-area-context"
import DayEntry from "../components/GoalEntry"
import GitHubActivityGrid from "../components/StatGrid"
import { useGetGoal } from "../hooks/hooks"

// Updated Goal component
export default function Goal({ route, navigation }: any) {
    const { id } = route.params
    const { data: goalData } = useGetGoal(id)

    const goal = goalData?.goal || {}

    const data = useMemo(() => {
        const hasTodayEntry = goal?.entries?.some((entry) => moment(entry.date).isSame(moment(), "day"))

        if (!hasTodayEntry) {
            return [
                {
                    id: "new",
                    date: moment().toISOString(),
                    value: "0",
                },
                ...(goal?.entries || []),
            ]
        }

        return goal?.entries
    }, [goal])

    const contributionData = useMemo(() => {
        return goal?.entries?.map((entry) => ({
            date: entry.date,
            count: entry.value,
        }))
    }, [goal.entries])

    const scrollY = useSharedValue(0)
    const onScroll = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y
        },
    })

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Header
                scrollY={scrollY}
                goBack
                initialHeight={60}
                animated
                buttons={[
                    {
                        onPress: () => navigation.navigate("UpdateGoalEntry", { id }),
                        icon: <AntDesign name="plus" size={20} color={Colors.foreground} />,
                    },
                ]}
            />
            <View style={{ paddingHorizontal: 15, flex: 1 }}>
                <Animated.FlatList
                    style={{ paddingTop: 80 }}
                    onScroll={onScroll}
                    data={data}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => <DayEntry index={index} entry={{ ...item, ...goal }} />}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <View>
                            <View
                                style={{
                                    padding: 10,
                                    backgroundColor: Colors.primary_lighter,
                                    borderRadius: 10,
                                    marginBottom: 15,
                                }}
                            >
                                <GitHubActivityGrid
                                    contributionData={contributionData}
                                    primaryColor={secondary_candidates[0]}
                                    goalThreshold={goal.target}
                                />
                            </View>
                            <View style={{ flexDirection: "row", gap: 10, alignItems: "center", marginVertical: 15 }}>
                                <View style={{ padding: 10, borderRadius: 100, backgroundColor: Colors.secondary }}>
                                    <MaterialCommunityIcons
                                        name={goal?.icon}
                                        size={30}
                                        color={Colors.foreground}
                                        style={{ marginLeft: "auto" }}
                                    />
                                </View>
                                <View>
                                    <Text variant="subheading" style={{ fontWeight: "600", color: Colors.foreground }}>
                                        {goal?.name}
                                    </Text>
                                    <Text variant="body" style={{ color: "rgba(255,255,255,0.9)", marginTop: 5 }}>
                                        {goal?.description}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    }
                    ListEmptyComponent={
                        <Text variant="body" style={styles.emptyText}>
                            No entries yet
                        </Text>
                    }
                    ListFooterComponent={<View style={{ height: 80, width: "100%" }} />}
                />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: "row",
        gap: 5,
        marginBottom: 20,
    },
    list: {
        gap: 12,
    },
    dayContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Color(Colors.primary_lighter).lighten(1).hex(),
        backgroundColor: Colors.primary_lighter,
    },
    dateSection: {
        alignItems: "center",
        minWidth: 50,
    },
    day: {
        fontSize: 20,
        fontWeight: "600",
        color: Colors.foreground,
    },
    currentDay: {
        color: "#2196F3",
    },
    month: {
        fontSize: 14,
        color: "#666",
        marginTop: 2,
    },
    valueContainer: {
        flex: 1,
        alignItems: "flex-end",
    },
    value: {
        fontSize: 18,
        fontWeight: "500",
        color: Colors.foreground,
    },
    emptyText: {
        color: "#666",
        textAlign: "center",
        marginTop: 20,
    },

    iconContainer: {
        padding: 20,
        borderRadius: 100,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.primary_lighter,
        marginBottom: 20,
        width: 130,
        height: 130,
    },
})
