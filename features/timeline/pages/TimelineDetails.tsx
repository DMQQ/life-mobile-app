import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import { StackScreenProps } from "@/types"
import Color from "color"
import dayjs from "dayjs"
import { useCallback, useMemo } from "react"
import { StyleSheet, View } from "react-native"
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import FileList from "../components/FileList"
import LoaderSkeleton from "../components/LoaderSkeleton"
import Section from "@/components/ui/Section"
import ActionRow from "@/components/ui/ActionRow"
import TimelineTodos from "../components/TimelineTodos"
import useCompleteOccurrence from "../hooks/mutation/useCompleteOccurrence"
import useGetOccurrenceById from "../hooks/query/useGetOccurrenceById"
import { Header } from "@/components"
import useDeleteAllOccurrences from "../hooks/mutation/useDeleteAllOccurrences"
import useRemoveTimelineMutation from "../hooks/mutation/useRemoveTimelineMutation"
import { useActivityUtils } from "@/utils/hooks/useActivityManager"
import { Feather } from "@expo/vector-icons"
import { HeaderItem } from "@/components/ui/Header/Header"
import Background from "@/components/ui/Background"

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
    completedBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 10,
        marginBottom: 4,
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
    const { data, loading } = useGetOccurrenceById(route.params.timelineId)
    const [completeOccurrence] = useCompleteOccurrence(route.params.timelineId)

    const insets = useSafeAreaInsets()

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

    const { isPending, startActivity } = useActivityUtils(data?.id)

    const startLiveActivityLocally = useCallback(() => {
        if (!data || isPending) return

        startActivity({
            description: data.description || "",
            title: data.title || "No Title",
            endTime: data.endTime,
            startTime: data.beginTime,
            eventId: data.id,
            deepLinkURL: `mylife://timeline/id/${data.id}`,
            todos: data.todos || [],
            isCompleted: data.isCompleted,
        })
    }, [isPending, data])

    const contentPaddingTop = useMemo(() => {
        const title = data?.title ?? ""
        const fontSize = title.length > 25 ? 35 : 45
        const lineHeight = fontSize * 0.95
        const charsPerLine = Math.floor((Layout.screen.width - 30) / (fontSize * 0.5))
        const lines = title.length > 0 ? Math.ceil(title.length / charsPerLine) : 1
        const titleTop = insets.top * 3
        const breathingRoom = data?.description ? 30 : 15
        return titleTop + lines * lineHeight + breathingRoom
    }, [data?.title, data?.description, insets.top])

    const { remove: removeOne } = useRemoveTimelineMutation({ id: data?.id || "", date: data?.date || "" }, () =>
        (navigation as any).goBack(),
    )
    const { remove: removeAll } = useDeleteAllOccurrences({ id: data?.id || "", date: data?.date || "" }, () =>
        (navigation as any).goBack(),
    )

    const buttons = useMemo(
        () =>
            [
                {
                    onPress: () => {},
                    icon: "trash",
                    tintColor: Colors.danger,
                    contextMenu: {
                        items: [
                            {
                                title: "Delete this",
                                systemImage: "trash",
                                destructive: true,
                                onPress: () => removeOne(),
                            },
                            {
                                title: "Delete All",
                                systemImage: "trash" as any,
                                destructive: true,
                                onPress: () => removeAll(),
                            },
                        ],
                    },
                },
                {
                    icon: "pencil",
                    onPress: onFabPress,
                },
                {
                    icon: data?.isCompleted ? "checkmark.circle.fill" : "circle",
                    standalone: true,
                    position: "right",
                    onPress: () =>
                        completeOccurrence({ variables: { input: { id: data?.id, isCompleted: !data?.isCompleted } } }),
                    tintColor: !data?.isCompleted ? undefined : Colors.secondary,
                },
            ] as HeaderItem[],
        [data?.isCompleted, data, isPending],
    )

    const handleCreateTodo = useCallback(() => {
        ;(navigation as any).navigate("CreateTimelineTodos", {
            timelineId: data?.id,
        })
    }, [data?.id])

    return (
        <View style={{ backgroundColor: Colors.primary }}>
            <Background />

            <Header
                scrollY={scrollY}
                animated={true}
                animatedTitle={capitalize(data?.title)}
                buttons={buttons}
                initialTitleFontSize={data?.title?.length > 25 ? 35 : 45}
            />

            <Animated.ScrollView
                keyboardDismissMode={"on-drag"}
                style={{ padding: 15 }}
                contentContainerStyle={{ paddingBottom: 40, paddingTop: contentPaddingTop }}
                onScroll={onScroll}
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <LoaderSkeleton />
                ) : (
                    <View style={styles.container}>
                        {data?.description && <Text variant="body">{data?.description}</Text>}
                        {data?.isCompleted && data?.finishedAt && (
                            <View style={styles.completedBadge}>
                                <Feather name="check-circle" size={13} color={Colors.secondary} />
                                <Text variant="caption" color={Colors.secondary} style={{ fontSize: 12 }}>
                                    Completed {dayjs(data.finishedAt).format("HH:mm · DD MMM")}
                                </Text>
                            </View>
                        )}
                        <TimelineTodos timelineId={data?.id} sortedTodos={data?.todos || []} onAdd={handleCreateTodo} />

                        <FileList timelineId={data?.id} />

                        <Section title="Event">
                            <ActionRow
                                icon="activity"
                                label="Start Live Activity"
                                onPress={startLiveActivityLocally}
                                disabled={isPending}
                                last={data?.isCompleted}
                            />
                            {!data?.isCompleted && (
                                <ActionRow
                                    icon="zap"
                                    label="Work on it"
                                    onPress={() => (navigation as any).navigate("TimelineDo", { timelineId: data?.id })}
                                    last
                                />
                            )}
                        </Section>

                        <Text variant="caption" selectable style={styles.timelineIdText}>
                            Event unique id: {data?.id}
                        </Text>
                    </View>
                )}
            </Animated.ScrollView>
        </View>
    )
}
