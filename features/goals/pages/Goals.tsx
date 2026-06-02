import Header from "@/components/ui/Header/Header"
import { useScreenSearch } from "@/utils/hooks/useScreenSearch"
import Colors from "@/constants/Colors"
import { Feather } from "@expo/vector-icons"
import { FlashList } from "@shopify/flash-list"
import { useState } from "react"
import { RefreshControl, View } from "react-native"
import Animated from "react-native-reanimated"
import useTrackScroll from "@/utils/hooks/ui/useTrackScroll"
import { GoalCategory } from "../components/GoalCategory"
import WeekGrid from "../components/WeekGrid"
import AnimatedLoader from "../components/GoalsLoader"
import { useGoal } from "../hooks/hooks"
import Background from "@/components/ui/Background"

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList)

type ViewMode = "list" | "week"

export default function Goals({ navigation }: any) {
    const { goals, loading, refetchGoals } = useGoal()

    const [scrollY, onAnimatedScrollHandler] = useTrackScroll({ screenName: "GoalsScreens" })

    const [refreshing, setRefreshing] = useState(false)

    const onRefresh = async () => {
        setRefreshing(true)
        await refetchGoals()
        setRefreshing(false)
    }

    const [query, setQuery] = useState("")

    useScreenSearch(setQuery)

    const [viewMode, setViewMode] = useState<ViewMode>("list")

    const filteredGoals = query ? goals?.filter((g: any) => g.name.toLowerCase().includes(query.toLowerCase())) : goals

    return (
        <View style={{ flex: 1 }}>
            {loading && <AnimatedLoader />}
            <Header
                scrollY={scrollY}
                animated={true}
                animatedTitle="Goals"
                animatedSubtitle={`${filteredGoals?.length || 0} Active Goals`}
                buttons={[
                    {
                        onPress: () => setViewMode((v) => (v === "list" ? "week" : "list")),
                        icon: (
                            <Feather name={viewMode === "list" ? "grid" : "list"} size={20} color={Colors.foreground} />
                        ),
                    },
                    {
                        standalone: true,
                        onPress: () => navigation.navigate("CreateGoal"),
                        icon: "plus",
                    },
                ]}
            />
            <Background />

            <View style={{ flex: 1 }}>
                {viewMode === "list" ? (
                    <AnimatedFlashList
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                        data={filteredGoals}
                        renderItem={({ item, index }: any) => (
                            <GoalCategory
                                index={index}
                                length={filteredGoals?.length}
                                onPress={() => {
                                    navigation.navigate("Goal", { id: item.id })
                                }}
                                {...item}
                            />
                        )}
                        keyExtractor={(item: any) => item.id}
                        onScroll={onAnimatedScrollHandler}
                        contentContainerStyle={{
                            paddingHorizontal: 15,
                            paddingTop: 300,
                        }}
                        style={{ flex: 1 }}
                        removeClippedSubviews
                    />
                ) : (
                    <Animated.ScrollView
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                        onScroll={onAnimatedScrollHandler}
                        scrollEventThrottle={16}
                        showsVerticalScrollIndicator={false}
                    >
                        <WeekGrid goals={filteredGoals} onGoalPress={(id) => navigation.navigate("Goal", { id })} />
                    </Animated.ScrollView>
                )}
            </View>
        </View>
    )
}
