import { FONTS } from "@/constants/Fonts"
import Colors from "@/constants/Colors"
import Color from "color"
import dayjs from "dayjs"
import { memo, useCallback, useMemo } from "react"
import { Pressable, ScrollViewProps, StyleSheet, View } from "react-native"
import Animated from "react-native-reanimated"
import { Feather } from "@expo/vector-icons"
import Text from "@/components/ui/Text/Text"
import ContextMenu, { ContextMenuAction } from "react-native-context-menu-view"
import { useNavigation } from "@react-navigation/native"
import useRemoveTimelineMutation from "../hooks/mutation/useRemoveTimelineMutation"
import useCompleteOccurrence from "../hooks/mutation/useCompleteOccurrence"
import { useActivityUtils } from "@/utils/hooks/useActivityManager"
import { OccurrenceItem } from "../hooks/query/useGetOccurrencesQuery"
import { Card } from "@/components"
import Button from "@/components/ui/Button/Button2"
import { SymbolView } from "expo-symbols"

interface PriorityTheme {
    accent: string
    cardBg: string
    lineColor: string
}

function priorityTheme(priority: number | null | undefined): PriorityTheme {
    if (priority != null && priority >= 7) {
        return {
            accent: "#FF5F57",
            cardBg: Color("#FF5F57").alpha(0.09).string(),
            lineColor: Color("#FF5F57").alpha(0.25).string(),
        }
    }
    if (priority != null && priority >= 4) {
        return {
            accent: "#5B9CF6",
            cardBg: Color("#5B9CF6").alpha(0.09).string(),
            lineColor: Color("#5B9CF6").alpha(0.25).string(),
        }
    }
    return {
        accent: Color(Colors.foreground_secondary).alpha(0.5).string(),
        cardBg: Colors.primary_lighter,
        lineColor: Color(Colors.foreground_secondary).alpha(0.12).string(),
    }
}

function formatTime(time: string): string {
    return dayjs(`2000-01-01T${time}`).format("HH:MM")
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

const STRIP_WIDTH = 44

function GhostSlot({ time, barWidth, opacity }: { time: string; barWidth: string; opacity: number }) {
    return (
        <View style={[styles.ghostRow, { opacity }]}>
            <Text style={styles.ghostTime}>{time}</Text>
            <View style={styles.ghostDot} />
            <View style={[styles.ghostBar, { width: barWidth as any }]} />
        </View>
    )
}

function EmptyState({ date }: { date: string }) {
    const navigation = useNavigation<any>()

    return (
        <View style={styles.emptyState}>
            <Text style={[styles.heading, { paddingLeft: 0, paddingBottom: 5 }]}>Nothing planned</Text>
            <Text style={styles.emptySubtitle}>Your schedule is wide open</Text>

            <View style={styles.ghostSlots}>
                <GhostSlot time="07:00" barWidth="85%" opacity={0.7} />
                <GhostSlot time="09:00" barWidth="80%" opacity={0.6} />
                <GhostSlot time="13:30" barWidth="70%" opacity={0.5} />
                <GhostSlot time="15:00" barWidth="65%" opacity={0.4} />
                <GhostSlot time="16:00" barWidth="75%" opacity={0.3} />
                <GhostSlot time="21:00" barWidth="70%" opacity={0.2} />
            </View>

            <View style={{ width: "100%", alignItems: "center" }}>
                <Button
                    onPress={() => navigation.navigate("TimelineCreate", { mode: "create", selectedDate: date })}
                    color="text"
                    style={{
                        borderRadius: 100,
                        justifyContent: "center",
                        gap: 10,
                    }}
                    fontStyle={{ textTransform: "capitalize" }}
                    icon={<SymbolView name="plus" size={18} tintColor="#fff" />}
                >
                    Add event
                </Button>
            </View>
        </View>
    )
}

// ─── Add Item ─────────────────────────────────────────────────────────────────

function AddItem({ date }: { date: string }) {
    const navigation = useNavigation<any>()

    return (
        <View style={styles.itemRow}>
            <View style={styles.strip}>
                <View style={styles.lineCol}>
                    <View style={{ backgroundColor: Colors.primary, paddingVertical: 4 }}>
                        <View style={[styles.dot, { backgroundColor: Colors.secondary }]} />
                    </View>
                </View>
            </View>

            <View style={[styles.cardWrapper, { justifyContent: "center" }]}>
                <Pressable
                    onPress={() => navigation.navigate("TimelineCreate", { mode: "create", selectedDate: date })}
                    style={[{ backgroundColor: Colors.secondary, padding: 15, borderRadius: 100 }]}
                >
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 }}>
                        <Feather name="plus" size={14} color={Colors.text_light} />
                        <Text style={{ fontSize: 13, fontFamily: FONTS.bold, color: Colors.text_light }}>New event</Text>
                    </View>
                </Pressable>
            </View>
        </View>
    )
}

interface FeedItemProps {
    event: OccurrenceItem
}

function FeedItem({ event }: FeedItemProps) {
    const navigation = useNavigation<any>()
    const theme = useMemo(() => priorityTheme(event.priority), [event.priority])

    const { remove } = useRemoveTimelineMutation({ id: event.id, date: event.date })
    const { isPending, startActivity } = useActivityUtils(event.id)
    const [completeOccurrenceMutation] = useCompleteOccurrence(event.id)

    const completeTimeline = useCallback(() => {
        completeOccurrenceMutation({ variables: { input: { id: event.id, isCompleted: !event.isCompleted } } })
    }, [completeOccurrenceMutation, event.id, event.isCompleted])

    const handleCopyPress = useCallback(() => {
        navigation.navigate("CopyTimelineModal", {
            timelineId: event.id,
            timelineTitle: event.title,
            originalDate: event.date,
        })
    }, [navigation, event.id, event.title, event.date])

    const startLiveActivity = useCallback(() => {
        if (isPending) return
        startActivity({
            description: event.description || "",
            title: event.title || "No Title",
            endTime: event.endTime as any,
            startTime: event.beginTime as any,
            eventId: event.id,
            deepLinkURL: `mylife://timeline/id/${event.id}`,
            todos: event.todos || [],
            isCompleted: event.isCompleted,
        })
    }, [isPending, event, startActivity])

    const isExpired = useMemo(() => {
        if (!event.date) return false
        const endRef = event.endTime
            ? dayjs(`${event.date} ${event.endTime}`, "YYYY-MM-DD HH:mm")
            : dayjs(event.date).endOf("day")
        return endRef.isBefore(dayjs())
    }, [event.date, event.endTime])

    const contextActions = useMemo(
        () =>
            [
                !isExpired && {
                    systemIcon: "bell",
                    title: isPending ? "Activity pending" : "Start live activity",
                    onPress: startLiveActivity,
                    disabled: isPending,
                },
                {
                    systemIcon: event.isCompleted ? "arrow.uturn.backward" : "checkmark",
                    title: event.isCompleted ? "Mark as incomplete" : "Complete",
                    onPress: completeTimeline,
                },
                { systemIcon: "clipboard", title: "Copy", onPress: handleCopyPress },
                {
                    systemIcon: "pencil",
                    title: "Edit",
                    onPress: () =>
                        navigation.navigate("TimelineCreate", {
                            mode: "edit",
                            selectedDate: event.date,
                            timelineId: event.id,
                        }),
                },
                { systemIcon: "trash", title: "Delete", onPress: remove, destructive: true },
            ].filter(Boolean),
        [completeTimeline, handleCopyPress, isExpired, isPending, navigation, remove, startLiveActivity, event],
    )

    const handlePress = useCallback(() => {
        navigation.navigate("TimelineDetails", { timelineId: event.id })
    }, [navigation, event.id])

    const duration = durationLabel(event.beginTime, event.endTime)
    const statusColor = event.isCompleted ? "#4CD87A" : isExpired ? "#FF9F0A" : theme.accent
    const statusLabel = event.isCompleted ? "Done" : isExpired ? "Late" : "To do"
    const totalTodos = event.todos?.length ?? 0
    const doneTodos = event.todos?.filter((t) => t.isCompleted).length ?? 0

    return (
        <View style={styles.itemRow}>
            <View style={styles.strip}>
                <View style={styles.stripHeading}>
                    <Text style={styles.timeLabel} numberOfLines={1}>
                        {formatTime(event.beginTime)}
                    </Text>
                    <View style={[styles.dot, { backgroundColor: theme.accent }]} />
                </View>

                <View style={styles.lineCol}>
                    <View style={[styles.bottomLine, { backgroundColor: theme.lineColor }]} />
                </View>
            </View>

            <View style={styles.cardWrapper}>
                <ContextMenu
                    actions={contextActions as ContextMenuAction[]}
                    onPress={(e) => {
                        const action = contextActions[e.nativeEvent.index] as any
                        action?.onPress?.()
                    }}
                    previewBackgroundColor={theme.cardBg}
                    style={{ borderRadius: 20 }}
                >
                    <Card onPress={handlePress} style={[styles.card, { backgroundColor: theme.cardBg }]}>
                        <View style={styles.cardHeader}>
                            <Text style={[styles.timeRange, { color: Color(theme.accent).alpha(0.6).string() }]}>
                                {formatTime(event.beginTime)}
                                {!!duration && ` · ${duration}`}
                            </Text>
                            <View
                                style={[
                                    styles.statusBadge,
                                    { backgroundColor: Color(statusColor).alpha(0.14).string() },
                                ]}
                            >
                                <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
                            </View>
                        </View>

                        <Text
                            style={[
                                styles.title,
                                {
                                    color: event.isCompleted ? Colors.foreground_secondary : Colors.foreground,
                                },
                                event.isCompleted && styles.titleDone,
                            ]}
                            numberOfLines={2}
                        >
                            {event.title}
                        </Text>

                        {!!event.description && (
                            <Text style={styles.description} numberOfLines={2}>
                                {event.description}
                            </Text>
                        )}

                        {totalTodos > 0 && (
                            <View style={styles.todoSection}>
                                {event.todos.slice(0, 3).map((todo) => (
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
                                            {todo.isCompleted && (
                                                <Feather name="check" size={9} color={Colors.primary} />
                                            )}
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
                                    <Text
                                        style={[styles.moreText, { color: Color(theme.accent).alpha(0.45).string() }]}
                                    >
                                        +{totalTodos - 3} more · {doneTodos}/{totalTodos} done
                                    </Text>
                                )}
                            </View>
                        )}
                    </Card>
                </ContextMenu>
            </View>
        </View>
    )
}

interface FeedTimelineProps extends Partial<ScrollViewProps> {
    events: OccurrenceItem[]
    date: string
    children?: React.ReactNode
    onScroll?: (event: any) => void
}

function FeedTimeline({ events, date, children, onScroll, ...scrollProps }: FeedTimelineProps) {
    const sorted = useMemo(() => [...events].sort((a, b) => a.beginTime.localeCompare(b.beginTime)), [events])
    const heading = dayjs(date).isSame(dayjs(), "day") ? "Today" : dayjs(date).format("dddd")
    const isEmpty = sorted.length === 0

    return (
        <Animated.ScrollView
            keyboardDismissMode="on-drag"
            style={styles.scroll}
            onScroll={onScroll}
            showsVerticalScrollIndicator={false}
            overScrollMode="never"
            bounces={false}
            {...scrollProps}
        >
            {children}
            <View style={styles.feed}>
                {!isEmpty && <Text style={styles.heading}>{heading}</Text>}
                {isEmpty ? (
                    <EmptyState date={date} />
                ) : (
                    <>
                        {sorted.map((event) => (
                            <FeedItem key={event.id} event={event} />
                        ))}
                        <AddItem date={date} />
                    </>
                )}
            </View>
            <View style={{ height: 100 }} />
        </Animated.ScrollView>
    )
}

export default memo(FeedTimeline)

const styles = StyleSheet.create({
    scroll: {
        flex: 1,
    },
    feed: {
        paddingRight: 15,
    },
    heading: {
        fontSize: 26,
        fontFamily: FONTS.bold,
        color: Colors.foreground,
        paddingTop: 20,
        paddingBottom: 16,
        paddingLeft: 10,
    },

    itemRow: {
        flexDirection: "row",
    },
    strip: {
        width: STRIP_WIDTH,
        alignItems: "center",
        alignSelf: "stretch",
    },
    stripHeading: {
        backgroundColor: Colors.primary,
        paddingVertical: 5,
        alignItems: "center",
    },
    timeLabel: {
        fontSize: 10,
        color: Colors.foreground_secondary,
        textAlign: "center",
        marginBottom: 4,
    },
    lineCol: {
        width: 14,
        alignItems: "center",
        flex: 1,
    },
    topLine: {
        width: 2,
        height: 16,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    bottomLine: {
        width: 2,
        flex: 1,
        marginTop: 3,
        marginBottom: -16,
    },
    // Card
    cardWrapper: {
        flex: 1,
        marginLeft: 8,
        marginBottom: 16,
    },
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
    emptyState: {
        paddingBottom: 24,
        paddingLeft: 15,
    },
    emptyIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Color(Colors.secondary).alpha(0.11).string(),
        borderWidth: 1.5,
        borderColor: Color(Colors.secondary).alpha(0.2).string(),
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 35,
        fontFamily: FONTS.bold,
        color: Colors.foreground,
        marginBottom: 6,
    },
    emptySubtitle: {
        fontSize: 18,
        color: Colors.text_dark,
        marginBottom: 28,
    },
    ghostSlots: {
        width: "100%",
        gap: 10,
        marginBottom: 32,
    },
    ghostRow: {
        flexDirection: "row",
        gap: 10,
    },
    ghostTime: {
        paddingTop: 10,
        fontSize: 10,
        color: Colors.foreground_secondary,
        width: 36,
    },
    ghostDot: {
        marginTop: 12.5,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Color(Colors.foreground_secondary).alpha(0.3).string(),
    },
    ghostBar: {
        height: 50,
        borderRadius: 13,
        backgroundColor: Color(Colors.foreground_secondary).alpha(0.07).string(),
    },
    emptyAddBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: Colors.secondary,
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 100,
        width: "100%",
    },
    emptyAddBtnText: {
        fontSize: 15,
        fontFamily: FONTS.bold,
        color: Colors.foreground,
    },
})
