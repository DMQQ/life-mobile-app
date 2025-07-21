import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import { StackScreenProps } from "@/types"
import { AntDesign, Feather } from "@expo/vector-icons"
import BottomSheetType from "@gorhom/bottom-sheet"
import Color from "color"
import { useCallback, useMemo, useRef } from "react"
import { StyleSheet, Text, View } from "react-native"
import Ripple from "react-native-material-ripple"
import Animated, { Extrapolation, interpolate, SharedValue, useAnimatedStyle } from "react-native-reanimated"
import FileList from "../components/FileList"
import LoaderSkeleton from "../components/LoaderSkeleton"
import TimelineTodos from "../components/TimelineTodos"
import useCompleteTimeline from "../hooks/mutation/useCompleteTimeline"
import useGetTimelineById from "../hooks/query/useGetTimelineById"

import { Header } from "@/components"
import useTrackScroll from "@/utils/hooks/ui/useTrackScroll"
import CompletionBar from "../components/CompletionBar"
import CreateTaskSheet from "../components/CreateTaskSheet"

const AnimatedRipple = Animated.createAnimatedComponent(Ripple)

const styles = StyleSheet.create({
    title: {
        marginBottom: 10,
        fontSize: 32.5,
        fontWeight: "bold",
        color: Colors.secondary,
    },
    container: {
        paddingBottom: 20,
        minHeight: Layout.screen.height - 120,
    },
    contentText: {
        fontSize: 20,
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

    const buttons = useMemo(
        () => [
            {
                icon: <Feather name="trash" size={20} color={Colors.error} />,
                onPress: () => {},
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
        [data?.isCompleted],
    )

    const sortedTodos = useMemo(() => {
        if (!data?.todos) return []

        return [...(data?.todos || [])].sort((a, b) => {
            if (a.isCompleted && !b.isCompleted) return 1
            if (!a.isCompleted && b.isCompleted) return -1

            return a.id.localeCompare(b.id)
        })
    }, [data?.todos])

    const taskCompletionProgressBar = useMemo(() => {
        let count = 0

        if (sortedTodos === undefined || sortedTodos.length === 0) return 0

        for (let todo of sortedTodos || []) {
            if (todo.isCompleted) count += 1
        }

        return Math.trunc((count / sortedTodos?.length) * 100)
    }, [sortedTodos])

    const renderAnimatedItem = useCallback(
        ({ scrollY }: { scrollY: SharedValue<number> | undefined }) => (
            <AnimatedProgressBar percentage={taskCompletionProgressBar} scrollY={scrollY!} />
        ),
        [taskCompletionProgressBar, sortedTodos],
    )

    return (
        <View style={{ backgroundColor: Colors.primary }}>
            <Header
                scrollY={scrollY}
                animated={true}
                animatedTitle={capitalize(data?.title)}
                animatedSubtitle={capitalize(data?.description)}
                isScreenModal
                initialHeight={60}
                buttons={buttons}
                renderAnimatedItem={renderAnimatedItem}
            />
            <Animated.ScrollView
                keyboardDismissMode={"on-drag"}
                style={{ padding: 15 }}
                contentContainerStyle={{ paddingBottom: 50, paddingTop: 120 }}
                onScroll={onScroll}
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <LoaderSkeleton />
                ) : (
                    <View style={styles.container}>
                        <TimelineTodos
                            expandSheet={() => taskRef.current?.snapToIndex(0)}
                            timelineId={data?.id}
                            sortedTodos={sortedTodos}
                        />

                        <FileList timelineId={data?.id} />

                        <Text selectable style={styles.timelineIdText}>
                            Event unique id: {data?.id}
                        </Text>
                    </View>
                )}
            </Animated.ScrollView>

            <CreateTaskSheet ref={taskRef} timelineId={data?.id} />
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
            <Text style={{ fontSize: 10, color: "#fff", marginBottom: 2.5 }}>Task completion progress</Text>
            <CompletionBar percentage={percentage} />
        </Animated.View>
    )
}
