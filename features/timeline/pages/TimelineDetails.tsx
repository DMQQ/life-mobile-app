import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import { StackScreenProps } from "@/types"
import { AntDesign, Feather } from "@expo/vector-icons"
import Color from "color"
import { useCallback, useMemo, useState } from "react"
import { StyleSheet, View } from "react-native"
import Animated, {
    Extrapolation,
    interpolate,
    SharedValue,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
} from "react-native-reanimated"
import FileList from "../components/FileList"
import LoaderSkeleton from "../components/LoaderSkeleton"
import TimelineTodos from "../components/TimelineTodos"
import useCompleteTimeline from "../hooks/mutation/useCompleteTimeline"
import useGetTimelineById from "../hooks/query/useGetTimelineById"

import { Header } from "@/components"
import DeleteTimelineEvent from "@/components/ui/Dialog/Delete/DeleteTimelineEvent"
import { GetTimelineQuery } from "../hooks/query/useGetTimeLineQuery"
import { HeaderItem } from "@/components/ui/Header/Header"

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

    const scrollY = useSharedValue(0)

    const onScroll = useAnimatedScrollHandler({
        onScroll: (ev) => {
            scrollY.value = ev.contentOffset.y
        },
    })

    const onFabPress = () => {
        ;(navigation as any).navigate("TimelineCreate", {
            mode: "edit",
            selectedDate: data?.date,
            timelineId: data?.id,
        })
    }

    const buttons = useMemo(
        () =>
            [
                {
                    icon: <Feather name="trash" size={20} color="#fff" />,
                    onPress: () => {
                        setSelectedEventForDeletion(data)
                    },
                },
                {
                    icon: <Feather name="edit-2" size={20} color={Colors.foreground} />,
                    onPress: onFabPress,
                },
                {
                    icon: <AntDesign name={data?.isCompleted ? "check" : "check"} color={"#fff"} size={20} />,
                    standalone: true,
                    position: "right",
                    onPress: completeTimeline,

                    tintColor: !data?.isCompleted ? Colors.secondary : "green",
                },
            ] as HeaderItem[],
        [data?.isCompleted, data],
    )

    const [selectedEventForDeletion, setSelectedEventForDeletion] = useState<GetTimelineQuery | null>(null)

    return (
        <View style={{ backgroundColor: Colors.primary }}>
            <Header
                scrollY={scrollY}
                animated={true}
                animatedTitle={capitalize(data?.title)}
                buttons={buttons}
                initialTitleFontSize={data?.title?.length > 25 ? 40 : 50}
            />
            <Animated.ScrollView
                keyboardDismissMode={"on-drag"}
                style={{ padding: 15 }}
                contentContainerStyle={{ paddingBottom: 50, paddingTop: 225 + data?.title?.length * 3 }}
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
                                ;(navigation as any).navigate("CreateTimelineTodos", {
                                    timelineId: data?.id,
                                })
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
        </View>
    )
}
