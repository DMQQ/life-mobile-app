import DeleteGoalsGroupDialog from "@/components/ui/Dialog/Delete/DeleteGoalsDialog"
import AnimatedHeaderSearch from "@/components/ui/Header/AnimatedHeaderSearch"
import Header from "@/components/ui/Header/Header"
import Colors from "@/constants/Colors"
import { AntDesign } from "@expo/vector-icons"
import { FlashList } from "@shopify/flash-list"
import { useState } from "react"
import { RefreshControl, View } from "react-native"
import Feedback from "react-native-haptic-feedback"
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated"
import { GoalCategory } from "../components/GoalCategory"
import AnimatedLoader from "../components/GoalsLoader"
import { useGoal } from "../hooks/hooks"

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList)

export default function Goals({ navigation }: any) {
    const { goals, loading, refetchGoals } = useGoal()

    const scrollY = useSharedValue(0)

    const onAnimatedScrollHandler = useAnimatedScrollHandler(
        {
            onScroll(event) {
                scrollY.value = event.contentOffset.y
            },
        },
        [],
    )

    const [selectedGroupForDeletion, setSelectedGroupForDeletion] = useState<{ id: string; name: string } | null>(null)

    const [refreshing, setRefreshing] = useState(false)

    const onRefresh = async () => {
        setRefreshing(true)

        await refetchGoals()

        setRefreshing(false)
    }

    const [query, setQuery] = useState("")

    return (
        <View style={{ flex: 1 }}>
            {loading && <AnimatedLoader />}
            <Header
                scrollY={scrollY}
                animated={true}
                animatedTitle="Goals"
                animatedSubtitle="5 Active Goals"
                buttons={[
                    {
                        onPress: () => navigation.navigate("CreateGoal"),
                        icon: <AntDesign name="plus" size={20} color={Colors.foreground} />,
                    },
                ]}
                renderAnimatedItem={(props) => (
                    <AnimatedHeaderSearch buttonsCount={1} {...props} filterValue={query} setFilterValue={setQuery} />
                )}
            />
            <AnimatedFlashList
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                data={goals}
                estimatedItemSize={100}
                renderItem={({ item, index }: any) => (
                    <GoalCategory
                        index={index}
                        length={goals?.length}
                        onPress={() => {
                            navigation.navigate("Goal", { id: item.id })
                        }}
                        onLongPress={() => {
                            Feedback.trigger("impactMedium")
                            setSelectedGroupForDeletion(item)
                        }}
                        {...item}
                    />
                )}
                keyExtractor={(item: any) => item.id}
                onScroll={onAnimatedScrollHandler}
                contentContainerStyle={{
                    paddingHorizontal: 15,
                    paddingBottom: 100,
                    paddingTop: 300,
                }}
                scrollEventThrottle={16}
                removeClippedSubviews
            />
            <DeleteGoalsGroupDialog
                isVisible={!!selectedGroupForDeletion}
                item={selectedGroupForDeletion || undefined}
                onDismiss={() => setSelectedGroupForDeletion(null)}
            />
        </View>
    )
}
