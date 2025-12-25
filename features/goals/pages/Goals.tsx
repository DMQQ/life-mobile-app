import DeleteGoalsGroupDialog from "@/components/ui/Dialog/Delete/DeleteGoalsDialog"
import Header from "@/components/ui/Header/Header"
import { useScreenSearch } from "@/utils/hooks/useScreenSearch"
import Colors from "@/constants/Colors"
import { AntDesign } from "@expo/vector-icons"
import { FlashList } from "@shopify/flash-list"
import { useState } from "react"
import { RefreshControl, View } from "react-native"
import Feedback from "react-native-haptic-feedback"
import Animated from "react-native-reanimated"
import useTrackScroll from "@/utils/hooks/ui/useTrackScroll"
import { GoalCategory } from "../components/GoalCategory"
import AnimatedLoader from "../components/GoalsLoader"
import { useGoal } from "../hooks/hooks"

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList)

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
            />
            <AnimatedFlashList
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                data={goals}
                renderItem={({ item, index }: any) => (
                    <GoalCategory
                        index={index}
                        length={goals?.length}
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
                    paddingBottom: 100,
                    paddingTop: 300,
                }}
                removeClippedSubviews
            />
        </View>
    )
}
