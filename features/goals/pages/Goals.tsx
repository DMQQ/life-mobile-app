import { Skeleton } from "@/components"
import DeleteGoalsGroupDialog from "@/components/ui/Dialog/Delete/DeleteGoalsDialog"
import Header from "@/components/ui/Header/Header"
import Colors from "@/constants/Colors"
import { AntDesign } from "@expo/vector-icons"
import { FlashList } from "@shopify/flash-list"
import { useState } from "react"
import { StyleSheet, View } from "react-native"
import Animated, { FadeOut, useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated"
import { GoalCategory } from "../components/GoalCategory"
import { useGoal } from "../hooks/hooks"

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList)

const AnimatedLoader = () => {
    return (
        <Animated.View
            exiting={FadeOut.duration(250)}
            style={[
                StyleSheet.absoluteFillObject,
                {
                    backgroundColor: Colors.primary,
                    zIndex: 1000,
                    justifyContent: "center",
                    alignItems: "center",
                    paddingTop: 125,
                },
            ]}
        >
            <Skeleton>
                <View style={{ flex: 1, paddingHorizontal: 15 }}>
                    <View style={{ alignItems: "flex-end" }}>
                        <Skeleton.Item width={25} height={25} style={{ borderRadius: 10 }} />
                    </View>

                    <View style={{ paddingTop: 40, paddingBottom: 20 }}>
                        <Skeleton.Item width={(w) => w * 0.65} height={65} style={{ marginTop: 10 }} />
                        <Skeleton.Item width={(w) => w * 0.4} height={15} style={{ marginTop: 10 }} />
                    </View>

                    <View>
                        <Skeleton.Item width={(w) => w - 30} height={200} style={{ marginTop: 10 }} />
                        <Skeleton.Item width={(w) => w - 30} height={200} style={{ marginTop: 10 }} />
                        <Skeleton.Item width={(w) => w - 30} height={200} style={{ marginTop: 10 }} />
                    </View>
                </View>
            </Skeleton>
        </Animated.View>
    )
}

export default function Goals({ navigation }: any) {
    const { goals, loading } = useGoal()

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
                        icon: <AntDesign name="plus" size={20} color="#fff" />,
                    },
                ]}
            />
            <AnimatedFlashList
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
                            setSelectedGroupForDeletion(item)
                        }}
                        {...item}
                    />
                )}
                keyExtractor={(item: any) => item.id}
                onScroll={onAnimatedScrollHandler}
                contentContainerStyle={{
                    paddingHorizontal: 15,
                    paddingBottom: 60,
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
