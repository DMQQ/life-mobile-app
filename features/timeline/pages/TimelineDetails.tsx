import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import { StackScreenProps } from "@/types"
import { AntDesign, Feather } from "@expo/vector-icons"
import BottomSheetType from "@gorhom/bottom-sheet"
import Color from "color"
import { useCallback, useMemo, useRef, useState } from "react"
import { StyleSheet, View } from "react-native"
import Ripple from "react-native-material-ripple"
import Animated, { Extrapolation, interpolate, SharedValue, useAnimatedStyle } from "react-native-reanimated"
import FileList from "../components/FileList"
import LoaderSkeleton from "../components/LoaderSkeleton"
import TimelineTodos from "../components/TimelineTodos"
import useCompleteTimeline from "../hooks/mutation/useCompleteTimeline"
import useGetTimelineById from "../hooks/query/useGetTimelineById"

import { Header } from "@/components"
import DeleteTimelineEvent from "@/components/ui/Dialog/Delete/DeleteTimelineEvent"
import useTrackScroll from "@/utils/hooks/ui/useTrackScroll"
import CompletionBar from "../components/CompletionBar"
import CreateTaskSheet from "../components/CreateTaskSheet"
import { GetTimelineQuery } from "../hooks/query/useGetTimeLineQuery"

const AnimatedRipple = Animated.createAnimatedComponent(Ripple)

const styles = StyleSheet.create({
    title: {
        marginBottom: 10,
        color: Colors.secondary,
    },
    container: {
        paddingBottom: 20,
        minHeight: Layout.screen.height - 120,
    },
    contentText: {
        color: "rgba(255,255,255,0.7)",
    },
    timelineIdText: {
        color: Color(Colors.primary).lighten(4).string(),
        marginTop: 25,
        position: "absolute",
        bottom: 0,
    },
    fab: {
        padding: 10,
        position: "absolute",
        right: 15,
        bottom: 25,
        backgroundColor: Colors.secondary,
        width: 60,
        height: 60,
        borderRadius: 100,
        justifyContent: "center",
        alignItems: "center",
    },
})

const capitalize = (text: string | undefined) => {
    if (!text) return ""
    return text.charAt(0).toUpperCase() + text.slice(1)
}

export default function TimelineDetails({
    route,
    navigation,
}: StackScreenProps<{ TimelineDetails: { timelineId: string } }, "TimelineDetails">) {
    const { data, loading } = useGetTimelineById(route.params.timelineId)
    const [completeTimeline] = useCompleteTimeline(route.params.timelineId)

    const [scrollY, onScroll] = useTrackScroll()

    const onFabPress = () => {
        ;(navigation as any).navigate("TimelineCreate", {
            mode: "edit",
            selectedDate: data?.date,
            timelineId: data?.id,
        })
    }

    const taskRef = useRef<BottomSheetType>(null)
    const [isSheetOpen, setIsSheetOpen] = useState(false)

    const buttons = useMemo(
        () => [
            {
                icon: <Feather name="trash" size={20} color={Colors.error} />,
                onPress: () => {
                    setSelectedEventForDeletion(data)
                },
            },
            {
                icon: <Feather name="edit-2" size={20} color={Colors.foreground} />,
                onPress: onFabPress,
            },
            {
                icon: (
                    <AntDesign
                        name={data?.isCompleted ? "check" : "loading1"}
                        color={data?.isCompleted ? Colors.secondary : Colors.foreground}
                        size={20}
                    />
                ),
                onPress: completeTimeline,
            },
        ],
        [data?.isCompleted, data],
    )

    const taskCompletionProgressBar = useMemo(() => {
        let count = 0

        if (data?.todos === undefined || data?.todos?.length === 0) return 0

        for (let todo of data?.todos || []) {
            if (todo.isCompleted) count += 1
        }

        return Math.trunc((count / data?.todos?.length) * 100)
    }, [data?.todos])

    const renderAnimatedItem = useCallback(
        ({ scrollY }: { scrollY: SharedValue<number> | undefined }) => (
            <AnimatedProgressBar percentage={taskCompletionProgressBar} scrollY={scrollY!} />
        ),
        [taskCompletionProgressBar, data?.todos],
    )

    const [selectedEventForDeletion, setSelectedEventForDeletion] = useState<GetTimelineQuery | null>(null)

    return (
        <View style={{ backgroundColor: Colors.primary }}>
            <Header
                scrollY={scrollY}
                animated={true}
                animatedTitle={capitalize(data?.title)}
                buttons={buttons}
                renderAnimatedItem={renderAnimatedItem}
                initialTitleFontSize={data?.title?.length > 25 ? 40 : 50}
            />
            <Animated.ScrollView
                keyboardDismissMode={"on-drag"}
                style={{ padding: 15 }}
                contentContainerStyle={{ paddingBottom: 50, paddingTop: 200 }}
                onScroll={onScroll}
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <LoaderSkeleton />
                ) : (
                    <View style={styles.container}>
                        <Text variant="body">{data?.description || "No description provided for this event."}</Text>
                        <TimelineTodos
                            expandSheet={() => {
                                taskRef.current?.snapToIndex(0)
                                setIsSheetOpen(true)
                            }}
                            timelineId={data?.id}
                            sortedTodos={data?.todos || []}
                        />

                        <FileList timelineId={data?.id} />

                        <Text variant="caption" selectable style={styles.timelineIdText}>
                            Event unique id: {data?.id}
                        </Text>
                    </View>
                )}
            </Animated.ScrollView>

            <DeleteTimelineEvent
                isVisible={!!selectedEventForDeletion}
                item={
                    selectedEventForDeletion
                        ? {
                              id: selectedEventForDeletion.id,
                              name: selectedEventForDeletion.title,
                              date: selectedEventForDeletion.date,
                          }
                        : undefined
                }
                onDismiss={() => setSelectedEventForDeletion(null)}
            />

            <CreateTaskSheet
                isSheetOpen={isSheetOpen}
                onCloseSheet={() => {
                    setIsSheetOpen(false)
                }}
                ref={taskRef}
                timelineId={data?.id}
            />
        </View>
    )
}

const AnimatedProgressBar = ({ percentage, scrollY }: { percentage: number; scrollY: SharedValue<number> }) => {
    return (
        <Animated.View
            style={[
                useAnimatedStyle(() => {
                    const scrollValue = scrollY?.value ?? 0

                    return {
                        opacity: interpolate(scrollValue, [0, 130, 150, 160], [0, 0, 0.75, 1], Extrapolation.CLAMP),
                        transform: [
                            {
                                translateY: interpolate(scrollValue, [0, 160], [-25, 0], Extrapolation.CLAMP),
                            },
                            { scale: interpolate(scrollValue, [0, 160], [0.5, 1], Extrapolation.CLAMP) },
                        ],
                    }
                }, [scrollY]),
                { paddingHorizontal: 15, paddingBottom: 15 },
            ]}
        >
            <CompletionBar percentage={percentage} />
        </Animated.View>
    )
}
