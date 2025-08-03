import Header from "@/components/ui/Header/Header"
import Colors from "@/constants/Colors"
import { AntDesign } from "@expo/vector-icons"
import { RefreshControl, StyleSheet, View } from "react-native"

import { Skeleton } from "@/components"
import DeleteFlashCardGroupDialog from "@/components/ui/Dialog/Delete/DeleteGroupDialog"
import AnimatedHeaderSearch from "@/components/ui/Header/AnimatedHeaderSearch"
import { ScreenProps } from "@/types"
import { FlashList } from "@shopify/flash-list"
import { useMemo, useState } from "react"
import Animated, { FadeOut, useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated"
import FlashCardGroup from "../components/FlashCardGroup"
import { Group, useGroups } from "../hooks"

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

                    <View style={{ paddingTop: 65, paddingBottom: 20 }}>
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
    const { groups, loading, refetch } = useGroups()

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

    const [refreshing, setRefreshing] = useState(false)

    const onRefresh = async () => {
        setRefreshing(true)

        await refetch()

        setRefreshing(false)
    }

    const [query, setQuery] = useState("")

    return (
        <>
            <View style={{ padding: 0, flex: 1 }}>
                {loading && <AnimatedLoader />}
                <Header
                    scrollY={scrollY}
                    animated={true}
                    buttons={[
                        {
                            icon: <AntDesign name="plus" size={20} color={Colors.foreground} />,
                            onPress: () => navigation.navigate("CreateFlashCardGroup"),
                        },
                    ]}
                    animatedTitle="FlashCards"
                    animatedSubtitle={`${groups?.length || 0} Groups`}
                    renderAnimatedItem={(props) => (
                        <AnimatedHeaderSearch
                            buttonsCount={1}
                            {...props}
                            filterValue={query}
                            setFilterValue={setQuery}
                        />
                    )}
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
                                setSelectedGroupForDeletion(group)
                            }}
                        />
                    )}
                    keyExtractor={(key: any) => key.id.toString()}
                    onScroll={onAnimatedScrollHandler}
                    contentContainerStyle={{
                        paddingHorizontal: 15,
                        paddingBottom: 100,
                        paddingTop: 300,
                    }}
                    scrollEventThrottle={16}
                    removeClippedSubviews
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
