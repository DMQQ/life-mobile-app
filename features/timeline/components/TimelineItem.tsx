import { FONTS } from "@/constants/Fonts"
import Colors from "@/constants/Colors"
import { navigationRef } from "@/navigation/ref"
import Color from "color"
import dayjs from "dayjs"
import { useCallback, useMemo } from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { OccurrenceItem } from "../hooks/query/useGetOccurrencesQuery"
import { Card } from "@/components"
import Text from "@/components/ui/Text/Text"
import useRemoveTimelineMutation from "../hooks/mutation/useRemoveTimelineMutation"
import { useActivityUtils } from "@/utils/hooks/useActivityManager"
import useCompleteOccurrence from "../hooks/mutation/useCompleteOccurrence"
import ContextMenu, { ContextMenuAction } from "react-native-context-menu-view"
import { Feather } from "@expo/vector-icons"

interface PriorityTheme {
    accent: string
    cardBg: string
}

function priorityTheme(priority: number | null | undefined): PriorityTheme {
    if (priority != null && priority >= 7) {
        return { accent: "#FF5F57", cardBg: Color("#FF5F57").alpha(0.09).string() }
    }
    if (priority != null && priority >= 4) {
        return { accent: "#5B9CF6", cardBg: Color("#5B9CF6").alpha(0.09).string() }
    }
    return {
        accent: Color(Colors.foreground_secondary).alpha(0.5).string(),
        cardBg: Colors.primary_lighter,
    }
}

function formatTime(time: string): string {
    return dayjs(`2000-01-01T${time}`).format("HH:mm")
}

function durationLabel(begin: string, end: string): string {
    const mins = dayjs(`2000-01-01T${end}`).diff(dayjs(`2000-01-01T${begin}`), "minute")
    if (mins <= 0) return ""
    if (mins >= 60) {
        const h = Math.floor(mins / 60)
        const m = mins % 60
        return m > 0 ? `${h}h ${m}m` : `${h}h`
    }
    return `${mins} min`
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
    const theme = useMemo(() => priorityTheme(timeline.priority), [timeline.priority])

    const isExpired = useMemo(() => {
        if (!timeline.date) return false
        const endRef = timeline.endTime
            ? dayjs(`${timeline.date} ${timeline.endTime}`, "YYYY-MM-DD HH:mm")
            : dayjs(timeline.date).endOf("day")
        return endRef.isBefore(dayjs()) && !timeline.isCompleted
    }, [timeline.date, timeline.endTime, timeline.isCompleted])

    const { remove } = useRemoveTimelineMutation(timeline || { id: "", date: "", name: "" })
    const { isPending, startActivity } = useActivityUtils(timeline?.id)
    const [completeOccurrenceMutation] = useCompleteOccurrence(timeline.id)

    const completeTimeline = useCallback(() => {
        completeOccurrenceMutation({ variables: { input: { id: timeline.id, isCompleted: !timeline.isCompleted } } })
    }, [completeOccurrenceMutation, timeline.id, timeline.isCompleted])

    const handleCopyPress = useCallback(() => {
        navigationRef.current?.navigate("TimelineScreens", {
            screen: "CopyTimelineModal",
            params: { timelineId: timeline.id, timelineTitle: timeline.title, originalDate: timeline.date },
        } as any)
    }, [timeline.id, timeline.title, timeline.date])

    const startLiveActivity = useCallback(() => {
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

    const contextActions = useMemo(
        () =>
            (
                [
                    {
                        systemIcon: "bell",
                        title: isPending ? "Activity pending" : "Start live activity",
                        onPress: startLiveActivity,
                        disabled: isPending,
                    },
                    {
                        systemIcon: timeline.isCompleted ? "arrow.uturn.backward" : "checkmark",
                        title: timeline.isCompleted ? "Mark as incomplete" : "Complete",
                        onPress: completeTimeline,
                    },
                    { systemIcon: "clipboard", title: "Copy", onPress: handleCopyPress },
                    {
                        systemIcon: "pencil",
                        title: "Edit",
                        onPress: () =>
                            navigationRef.current?.navigate("TimelineScreens", {
                                screen: "TimelineCreate",
                                params: { mode: "edit", selectedDate: timeline?.date, timelineId: timeline?.id },
                            } as any),
                    },
                    { systemIcon: "trash", title: "Delete", onPress: remove, destructive: true },
                ] as (ContextMenuAction & { onPress?: () => void })[]
            ).filter(Boolean),
        [completeTimeline, handleCopyPress, isPending, remove, startLiveActivity, timeline],
    )

    const handlePress = useCallback(() => {
        timeline.onPress?.()
        navigationRef.current?.navigate("TimelineScreens", {
            screen: timeline.location === "root" ? "TimelineScreens" : "TimelineDetails",
            params: { timelineId: timeline.id },
        } as any)
    }, [timeline])

    const duration = durationLabel(timeline.beginTime, timeline.endTime)
    const statusColor = timeline.isCompleted ? "#4CD87A" : isExpired ? "#FF9F0A" : theme.accent
    const statusLabel = timeline.isCompleted ? "Done" : isExpired ? "Late" : "To do"
    const totalTodos = timeline.todos?.length ?? 0
    const doneTodos = timeline.todos?.filter((t) => t.isCompleted).length ?? 0

    return (
        <ContextMenu
            actions={contextActions as any}
            previewBackgroundColor={theme.cardBg}
            onPress={(e) => {
                const action = contextActions[e.nativeEvent.index] as (typeof contextActions)[number]
                if (action && action.onPress) action.onPress()
            }}
            style={{ borderRadius: 20 }}
        >
            <Card onPress={handlePress} style={[styles.card, { backgroundColor: theme.cardBg }, timeline.styles]}>
                <View style={styles.cardHeader}>
                    <Text style={[styles.timeRange, { color: Color(theme.accent).alpha(0.6).string() }]}>
                        {formatTime(timeline.beginTime)}
                        {!!duration && ` · ${duration}`}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: Color(statusColor).alpha(0.14).string() }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
                    </View>
                </View>

                <Text
                    style={[
                        styles.title,
                        { color: timeline.isCompleted ? Colors.foreground_secondary : Colors.foreground },
                        timeline.isCompleted && styles.titleDone,
                    ]}
                    numberOfLines={2}
                >
                    {timeline.isRepeat && (
                        <Feather name="repeat" size={14} color={Color(theme.accent).alpha(0.6).string()} />
                    )}
                    {timeline.isRepeat ? " " : ""}
                    {timeline.title}
                </Text>

                {!!timeline.description && (
                    <Text style={styles.description} numberOfLines={2}>
                        {timeline.description}
                    </Text>
                )}

                {totalTodos > 0 && (
                    <View style={styles.todoSection}>
                        {timeline.todos.slice(0, 3).map((todo) => (
                            <View key={todo.id} style={styles.todoRow}>
                                <View
                                    style={[
                                        styles.checkbox,
                                        {
                                            backgroundColor: todo.isCompleted ? theme.accent : "transparent",
                                            borderColor: Color(theme.accent).alpha(0.4).string(),
                                        },
                                    ]}
                                >
                                    {todo.isCompleted && <Feather name="check" size={9} color={Colors.primary} />}
                                </View>
                                <Text
                                    style={[
                                        styles.todoText,
                                        {
                                            color: todo.isCompleted
                                                ? Color(theme.accent).alpha(0.4).string()
                                                : Colors.foreground_secondary,
                                            textDecorationLine: todo.isCompleted ? "line-through" : "none",
                                        },
                                    ]}
                                    numberOfLines={1}
                                >
                                    {todo.title}
                                </Text>
                            </View>
                        ))}
                        {totalTodos > 3 && (
                            <Text style={[styles.moreText, { color: Color(theme.accent).alpha(0.45).string() }]}>
                                +{totalTodos - 3} more · {doneTodos}/{totalTodos} done
                            </Text>
                        )}
                    </View>
                )}
            </Card>
        </ContextMenu>
    )
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        padding: 15,
        gap: 8,
        overflow: "hidden",
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    timeRange: {
        fontSize: 11,
        fontFamily: FONTS.medium,
        letterSpacing: 0.3,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 100,
    },
    statusText: {
        fontSize: 10,
        fontFamily: FONTS.bold,
        letterSpacing: 0.4,
    },
    title: {
        fontSize: 16,
        fontFamily: FONTS.semibold,
        lineHeight: 22,
    },
    titleDone: {
        textDecorationLine: "line-through",
    },
    description: {
        fontSize: 13,
        color: Colors.foreground_secondary,
        lineHeight: 18,
    },
    todoSection: {
        gap: 6,
        marginTop: 2,
    },
    todoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    checkbox: {
        width: 16,
        height: 16,
        borderRadius: 4,
        borderWidth: 1.5,
        alignItems: "center",
        justifyContent: "center",
    },
    todoText: {
        fontSize: 13,
        flex: 1,
    },
    moreText: {
        fontSize: 11,
        marginTop: 2,
    },
})
