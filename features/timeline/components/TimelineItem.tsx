import Colors from "@/constants/Colors"
import { navigationRef } from "@/navigation"
import moment from "moment"
import { useCallback, useMemo } from "react"
import { StyleProp, StyleSheet, View, ViewStyle, Pressable } from "react-native"
import { OccurrenceItem } from "../hooks/query/useGetOccurrencesQuery"
import timelineStyles from "./timeline.styles"
import TodosPreviewSection from "./TodosPreviewSection"
import { Card, StatusBadge } from "@/components"
import Text from "@/components/ui/Text/Text"
import useRemoveTimelineMutation from "../hooks/mutation/useRemoveTimelineMutation"
import { useActivityUtils } from "@/utils/hooks/useActivityManager"
import useCompleteOccurrence from "../hooks/mutation/useCompleteOccurrence"
import ContextMenu, { ContextMenuAction } from "react-native-context-menu-view"
import { Feather } from "@expo/vector-icons"

function priorityColor(priority: number): string {
    if (priority >= 7) return "#FF3B30"
    if (priority >= 4) return "#007AFF"
    return "#34C759"
}

function priorityLabel(priority: number): string {
    if (priority >= 7) return "High"
    if (priority >= 4) return "Med"
    return "Low"
}

export default function TimelineItem(
    timeline: OccurrenceItem & {
        location: "timeline" | "root"
        textColor?: string
        styles?: StyleProp<ViewStyle>

        onLongPress?: () => void

        onPress?: () => void
    },
) {
    const onPress = () => {
        timeline.onPress?.()
        navigationRef.current?.navigate("TimelineScreens", {
            screen: timeline.location === "root" ? "TimelineScreens" : "TimelineDetails",
            params: { timelineId: timeline.id },
        } as any)
    }

    const handleCopyPress = () => {
        navigationRef.current?.navigate("TimelineScreens", {
            screen: "CopyTimelineModal",
            params: {
                timelineId: timeline.id,
                timelineTitle: timeline.title,
                originalDate: timeline.date,
            },
        } as any)
    }

    const start = moment(timeline.beginTime, "HH:mm").format("HH:mm")

    const end = moment(timeline.endTime, "HH:mm").format("HH:mm")

    const isExpired = useMemo(() => {
        const now = moment()

        if (!timeline?.date) return false

        if (moment(timeline?.date).isAfter(now)) return false

        if (timeline.isCompleted) return false

        const start = moment(timeline.beginTime, "HH:mm")
        const end = moment(timeline.endTime, "HH:mm")

        if (now.isAfter(end)) {
            return true
        }

        if (now.isAfter(start) && now.isBefore(end)) {
            return false
        }
    }, [timeline.date, timeline.beginTime, timeline.endTime, timeline.isCompleted])

    const { remove } = useRemoveTimelineMutation(timeline || { id: "", date: "", name: "" })

    const { isPending, startActivity } = useActivityUtils(timeline?.id)

    const [completeOccurrenceMutation] = useCompleteOccurrence(timeline.id)
    const completeTimeline = () =>
        completeOccurrenceMutation({ variables: { id: timeline.id, isCompleted: !timeline.isCompleted } })

    const startLiveActivityLocally = useCallback(() => {
        if (!timeline || isPending) return

        startActivity({
            description: timeline.description || "",
            title: timeline.title || "No Title",
            endTime: timeline.endTime as any,
            startTime: timeline.beginTime as any,
            eventId: timeline.id,
            deepLinkURL: `mylife://timeline/id/${timeline.id}`,
            todos: timeline.todos || [],
            isCompleted: timeline.isCompleted,
        })
    }, [isPending, timeline])

    const items = useMemo(
        () =>
            (
                [
                    {
                        systemIcon: "bell",
                        title: isPending ? "Activity pending" : "Start live activity",
                        onPress: startLiveActivityLocally,
                        disabled: isPending,
                    },
                    !timeline.isCompleted && {
                        systemIcon: "checkmark",
                        title: "Complete",
                        onPress: completeTimeline,
                    },
                    {
                        systemIcon: "clipboard",
                        title: "Copy",
                        onPress: handleCopyPress,
                    },

                    {
                        systemIcon: "pencil",
                        title: "Edit",
                        onPress: () => {
                            navigationRef.current?.navigate("TimelineScreens", {
                                screen: "TimelineCreate",
                                params: {
                                    mode: "edit",
                                    selectedDate: timeline?.date,
                                    timelineId: timeline?.id,
                                },
                            } as any)
                        },
                    },
                    {
                        systemIcon: "trash",
                        title: "Delete",
                        onPress: () => {
                            remove()
                        },
                        destructive: true,
                    },
                ] as (ContextMenuAction & { onPress?: () => void })[]
            ).filter(Boolean),
        [completeTimeline, handleCopyPress, remove, startLiveActivityLocally, timeline],
    )

    return (
        <ContextMenu
            actions={items as any}
            previewBackgroundColor={Colors.primary_lighter}
            onPress={(e) => {
                const action = items[e.nativeEvent.index] as (typeof items)[number]
                if (action && action.onPress) {
                    action.onPress()
                }
            }}
        >
            <Pressable onPress={onPress} style={{ flex: 1 }}>
                <Card style={[timelineStyles.itemContainer, timeline.styles, { overflow: "hidden" }]}>
                    <View style={[timelineStyles.itemContainerTitleRow]}>
                        <Text
                            numberOfLines={1}
                            style={[
                                timelineStyles.itemTitle,
                                { ...(timeline.textColor && { color: timeline.textColor }) },
                            ]}
                        >
                            {timeline.isRepeat && (
                                <View>
                                    <Feather
                                        style={{ marginRight: 5 }}
                                        name="repeat"
                                        size={15}
                                        color={Colors.secondary_light_1}
                                    />
                                </View>
                            )}
                            {timeline.title}
                        </Text>
                        <Text
                            style={[
                                timelineStyles.itemTimeLeft,
                                { ...(timeline.textColor && { color: timeline.textColor }) },
                            ]}
                        >
                            {start} - {end}
                        </Text>
                    </View>
                    <View style={styles.contentRow}>
                        <View style={styles.contentContainer}>
                            {!!timeline.description && (
                                <Text
                                    numberOfLines={2}
                                    style={[
                                        timelineStyles.itemDescription,
                                        timeline.textColor && { color: timeline.textColor },
                                    ]}
                                >
                                    {timeline.description}
                                </Text>
                            )}

                            <TodosPreviewSection
                                todos={timeline.todos}
                                timelineId={timeline.id}
                                occurrenceDate={timeline.date}
                                textColor={timeline.textColor}
                                maxItems={3}
                            />
                        </View>
                    </View>

                    <View style={styles.badges}>
                        {timeline.priority != null && (
                            <StatusBadge
                                variant={
                                    timeline.priority >= 7 ? "high" : timeline.priority >= 4 ? "med" : "low"
                                }
                            />
                        )}
                        <StatusBadge
                            variant={timeline.isCompleted ? "done" : isExpired ? "late" : "todo"}
                            label={timeline.isCompleted ? "Finished" : isExpired ? "Late" : "To do"}
                        />
                    </View>
                </Card>
            </Pressable>
        </ContextMenu>
    )
}

const styles = StyleSheet.create({
    priorityStrip: {
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        borderTopLeftRadius: 25,
        borderBottomLeftRadius: 25,
    },
    contentRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "flex-end",
        marginTop: 10,
        gap: 10,
    },
    contentContainer: {
        flex: 1,
    },
    badges: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: 5,
    },
})
