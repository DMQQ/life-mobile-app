import Colors from "@/constants/Colors"
import { useNavigation, router } from "expo-router"
import { useCallback, useMemo } from "react"
import dayjs from "dayjs"
import { Pressable, StyleSheet, View } from "react-native"
import Color from "color"
import useRemoveTimelineMutation from "../hooks/mutation/useRemoveTimelineMutation"
import { useActivityUtils } from "@/utils/hooks/useActivityManager"
import useCompleteOccurrence from "../hooks/mutation/useCompleteOccurrence"
import DayTimelineItem from "./DayTimelineItem"
import ContextMenu, { ContextMenuAction } from "react-native-context-menu-view"
import Layout from "@/constants/Layout"

interface DayTimelineItemWrapperProps {
    item: any
    style: any
    onLongPress?: (timeline: any) => void
    onPress?: () => void
}

export default function DayTimelineItemWrapper({ item, style, onLongPress, onPress }: DayTimelineItemWrapperProps) {
    const textColor = Colors.foreground
    const timeline = item.timeline
    const navigation = useNavigation<any>()

    const { remove } = useRemoveTimelineMutation(timeline || { id: "", date: "", name: "" })
    const { isPending, startActivity } = useActivityUtils(timeline?.id)
    const [completeOccurrenceMutation] = useCompleteOccurrence(timeline.id)
    const completeTimeline = () =>
        completeOccurrenceMutation({ variables: { input: { id: timeline.id, isCompleted: !timeline.isCompleted } } })

    const handleCopyPress = useCallback(() => {
        navigation.navigate("copy-timeline", {
            timelineId: timeline.id,
            timelineTitle: timeline.title,
            originalDate: timeline.date,
        })
    }, [navigation, timeline.id, timeline.title, timeline.date])

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
    }, [isPending, timeline, startActivity])

    const isExpired = useMemo(() => {
        if (!timeline.date) return false
        const endRef = timeline.endTime
            ? dayjs(`${timeline.date} ${timeline.endTime}`, "YYYY-MM-DD HH:mm")
            : dayjs(timeline.date).endOf("day")
        return endRef.isBefore(dayjs())
    }, [timeline.date, timeline.endTime])

    const items = useMemo(
        () =>
            [
                !isExpired && {
                    systemIcon: "bell",
                    title: isPending ? "Activity pending" : "Start live activity",
                    onPress: startLiveActivityLocally,
                    disabled: isPending,
                },
                {
                    systemIcon: timeline.isCompleted ? "arrow.uturn.backward" : "checkmark",
                    title: timeline.isCompleted ? "Mark as incomplete" : "Complete",
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
                        navigation.navigate("create", {
                            mode: "edit",
                            selectedDate: timeline?.date,
                            timelineId: timeline?.id,
                        })
                    },
                },
                {
                    systemIcon: "trash",
                    title: "Delete",
                    onPress: remove,
                    destructive: true,
                },
            ].filter(Boolean),
        [
            completeTimeline,
            handleCopyPress,
            isExpired,
            isPending,
            navigation,
            remove,
            startLiveActivityLocally,
            timeline,
        ],
    )

    const handlePress = () => {
        onPress?.()
        timeline.location === "root"
            ? router.push({
                  pathname: "/(tabs)/timeline",
                  params: { timelineId: timeline.id },
              })
            : navigation.navigate("[id]", {
                  timelineId: timeline.id,
              })
    }

    return (
        <View style={[style]}>
            <ContextMenu
                actions={items as ContextMenuAction[]}
                onPress={(e) => {
                    const action = items[e.nativeEvent.index]
                    if (action && action.onPress) {
                        action.onPress()
                    }
                }}
                previewBackgroundColor={styles.wrapper.backgroundColor}
                style={{ flex: 1, borderRadius: styles.wrapper.borderRadius }}
            >
                <Pressable
                    style={[styles.wrapper, { flex: 1 }]}
                    onLongPress={() => onLongPress?.(timeline)}
                    onPress={handlePress}
                >
                    <DayTimelineItem
                        {...timeline}
                        location="timeline"
                        textColor={textColor}
                        styles={{
                            flex: 1,
                        }}
                        isSmall={style.height < 100 || style.width < Layout.screen.width / 2}
                        compactTodos={style.height < 80 || style.width < Layout.screen.width / 3}
                        onToggleComplete={completeTimeline}
                    />
                </Pressable>
            </ContextMenu>
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: Color(Colors.primary_lighter).lighten(0.25).toString(),
        borderRadius: 16,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: Color(Colors.primary).lighten(2).alpha(0.4).toString(),
    },
})
