import Header from "@/components/ui/Header/Header"
import Colors from "@/constants/Colors"
import { AntDesign } from "@expo/vector-icons"
import { StyleSheet, Text, View } from "react-native"
import Ripple from "react-native-material-ripple"
import Feedback from "react-native-haptic-feedback"

import { Skeleton } from "@/components"
import DeleteFlashCardGroupDialog from "@/components/ui/Dialog/Delete/DeleteGroupDialog"
import { ScreenProps } from "@/types"
import { useNavigation } from "@react-navigation/native"
import { FlashList } from "@shopify/flash-list"
import moment from "moment"
import { useMemo, useState } from "react"
import Animated, { FadeIn, FadeOut, useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated"
import { Group, useGroups, useGroupStats } from "../hooks"

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
                        <Skeleton.Item width={(w) => w - 30} height={120} style={{ marginTop: 10 }} />
                        <Skeleton.Item width={(w) => w - 30} height={120} style={{ marginTop: 10 }} />
                        <Skeleton.Item width={(w) => w - 30} height={120} style={{ marginTop: 10 }} />
                        <Skeleton.Item width={(w) => w - 30} height={120} style={{ marginTop: 10 }} />
                    </View>
                </View>
            </Skeleton>
        </Animated.View>
    )
}

export default function NotesScreen({ navigation }: ScreenProps<any>) {
    const { groups, loading } = useGroups()

    const scrollY = useSharedValue(0)

    const onAnimatedScrollHandler = useAnimatedScrollHandler(
        {
            onScroll(event) {
                scrollY.value = event.contentOffset.y
            },
        },
        [],
    )

    const groupsSorted = useMemo(() => {
        if (!groups || groups.length === 0) return []
        return [...groups]?.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) || []
    }, [groups])

    const [selectedGroupForDeletion, setSelectedGroupForDeletion] = useState<Group | null>(null)

    return (
        <>
            <View style={{ padding: 0, flex: 1 }}>
                {loading && <AnimatedLoader />}
                <Header
                    scrollY={scrollY}
                    animated={true}
                    buttons={[
                        {
                            icon: <AntDesign name="plus" size={20} color={"#fff"} />,
                            onPress: () => navigation.navigate("CreateFlashCardGroup"),
                        },
                    ]}
                    animatedTitle="FlashCards"
                    animatedSubtitle={`${groups?.length || 0} Groups`}
                />
                <AnimatedFlashList
                    data={groupsSorted}
                    estimatedItemSize={150}
                    renderItem={({ item: group, index }: any) => (
                        <FlashCardGroup
                            {...group}
                            index={index}
                            length={groups.length}
                            onLongPress={() => {
                                Feedback.trigger("impactMedium")
                                setSelectedGroupForDeletion(group)
                            }}
                        />
                    )}
                    keyExtractor={(key: any) => key.id.toString()}
                    onScroll={onAnimatedScrollHandler}
                    contentContainerStyle={{
                        paddingHorizontal: 15,
                        paddingBottom: 60,
                        paddingTop: 200,
                    }}
                    scrollEventThrottle={16}
                    removeClippedSubviews
                />
            </View>
            <DeleteFlashCardGroupDialog
                isVisible={!!selectedGroupForDeletion}
                item={selectedGroupForDeletion || undefined}
                onDismiss={() => setSelectedGroupForDeletion(null)}
            />
        </>
    )
}

const successRate = (num: number) => {
    if (num === 0) return "red"

    if (num < 50) return "orange"

    if (num < 70) return "yellow"

    if (num < 90) return "green"

    return Colors.secondary
}

const FlashCardGroup = (group: Group & { index: number; length: number; onLongPress?: () => void }) => {
    const navigation = useNavigation<any>()

    const { data } = useGroupStats(group.id)

    const groupStats = data?.groupStats

    return (
        <Ripple onPress={() => navigation.navigate("FlashCard", { groupId: group.id })} onLongPress={group.onLongPress}>
            <View
                style={{
                    backgroundColor: Colors.primary_lighter,
                    padding: 20,
                    borderRadius: 15,
                    marginVertical: 7.5,
                    gap: 10,
                    minHeight: 150,

                    ...(group.index === group.length - 1 && { marginBottom: 40 }),
                }}
            >
                <Text style={{ color: Colors.secondary, fontSize: 20, fontWeight: "bold" }}>{group.name}</Text>
                <Text style={{ color: "#fff", fontSize: 15 }}>{group.description}</Text>

                {groupStats && (
                    <Animated.View entering={FadeIn} style={{ gap: 15 }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>
                                {moment(group.createdAt).format("MMM Do YYYY")}
                            </Text>

                            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>
                                {groupStats?.masteredCards} Mastered
                            </Text>
                        </View>

                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>
                                {groupStats?.totalCards} Cards
                            </Text>
                            <Text style={{ color: successRate(groupStats?.averageSuccessRate || 0), fontSize: 12 }}>
                                {groupStats?.averageSuccessRate.toFixed(2)}% Success Rate
                            </Text>
                        </View>
                    </Animated.View>
                )}
            </View>
        </Ripple>
    )
}
