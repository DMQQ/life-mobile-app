import Colors from "@/constants/Colors"
import { useNavigation } from "@react-navigation/native"
import moment from "moment"
import { useCallback, useMemo, useState } from "react"
import { StyleProp, StyleSheet, Text, View, ViewStyle, TouchableOpacity, Pressable } from "react-native"
import { GetTimelineQuery } from "../hooks/query/useGetTimeLineQuery"
import timelineStyles from "./timeline.styles"
import TodosPreviewSection from "./TodosPreviewSection"
import { Card } from "@/components"
import ContextMenu from "@/components/ui/ContextMenu"
import useRemoveTimelineMutation from "../hooks/mutation/useRemoveTimelineMutation"
import { useActivityUtils } from "@/utils/hooks/useActivityManager"
import useCompleteTimeline from "../hooks/mutation/useCompleteTimeline"

export default function TimelineItem(
    timeline: GetTimelineQuery & {
        location: "timeline" | "root"
        textColor?: string
        styles?: StyleProp<ViewStyle>

        onLongPress?: () => void
    },
) {
    const navigation = useNavigation<any>()

    const onPress = () => {
        timeline.location === "root"
            ? navigation.navigate("TimelineScreens", {
                  timelineId: timeline.id,
              })
            : navigation.navigate("TimelineDetails", {
                  timelineId: timeline.id,
              })
    }

    const handleCopyPress = () => {
        navigation.navigate("CopyTimelineModal", {
            timelineId: timeline.id,
            timelineTitle: timeline.title,
            originalDate: timeline.date,
        })
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

    const [completeTimeline] = useCompleteTimeline(timeline.id)

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
            [
                {
                    leading: "bell",
                    text: isPending ? "Activity pending" : "Start live activity",
                    onPress: startLiveActivityLocally,
                    disabled: isPending,
                },
                !timeline.isCompleted && {
                    leading: "checkmark",
                    text: "Complete",
                    onPress: completeTimeline,
                },
                {
                    leading: "clipboard",
                    text: "Copy",
                    onPress: handleCopyPress,
                },

                {
                    leading: "pencil",
                    text: "Edit",
                    onPress: () => {
                        ;(navigation as any).navigate("TimelineCreate", {
                            mode: "edit",
                            selectedDate: timeline?.date,
                            timelineId: timeline?.id,
                        })
                    },
                },
                {
                    leading: "trash",
                    text: "Delete",
                    onPress: () => {
                        remove()
                    },
                    destructive: true,
                },
            ].filter(Boolean),
        [completeTimeline, handleCopyPress, navigation, remove, startLiveActivityLocally, timeline],
    )

    return (
        <ContextMenu anchor="right" items={items as any}>
            <Pressable onLongPress={timeline?.onLongPress} onPress={onPress} style={{ flex: 1 }}>
                <Card style={[timelineStyles.itemContainer, timeline.styles]}>
                    <View style={[timelineStyles.itemContainerTitleRow]}>
                        <Text
                            numberOfLines={1}
                            style={[
                                timelineStyles.itemTitle,
                                { ...(timeline.textColor && { color: timeline.textColor }) },
                            ]}
                        >
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
                                textColor={timeline.textColor}
                                maxItems={3}
                            />
                        </View>
                    </View>

                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "flex-end",
                            alignItems: "center",
                        }}
                    >
                        <View
                            style={[
                                styles.statusBadge,
                                timeline.isCompleted && styles.statusCompleted,
                                isExpired && styles.statusExpired,
                            ]}
                        >
                            <Text style={timelineStyles.status}>
                                {timeline.isCompleted ? "Finished" : isExpired ? "Late" : "To do"}
                            </Text>
                        </View>
                    </View>
                </Card>
            </Pressable>
        </ContextMenu>
    )
}

const styles = StyleSheet.create({
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
    statusBadge: {
        backgroundColor: Colors.secondary,
        padding: 2.5,
        paddingHorizontal: 10,
        borderRadius: 100,
        marginLeft: 2.5,
        alignSelf: "flex-end",
    },
    statusCompleted: {
        backgroundColor: "lightgreen",
    },
    statusExpired: {
        backgroundColor: "#BA4343",
    },
    copyButton: {
        borderRadius: 8,
        padding: 6,
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    copyButtonDisabled: {
        opacity: 0.6,
        elevation: 0,
        shadowOpacity: 0,
    },
    copyIcon: {
        fontSize: 12,
    },
    copyText: {
        fontSize: 12,
        fontWeight: "600",
    },
})
