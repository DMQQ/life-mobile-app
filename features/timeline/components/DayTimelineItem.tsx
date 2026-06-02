import { FONTS } from "@/constants/Fonts"
import moment from "moment"
import { useMemo } from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import Colors from "@/constants/Colors"
import Text from "@/components/ui/Text/Text"
import { GetTimelineQuery } from "../hooks/query/useGetTimeLineQuery"
import timelineStyles from "./timeline.styles"
import TodosPreviewSection from "./TodosPreviewSection"
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

export default function DayTimelineItem(
    timeline: GetTimelineQuery & {
        location: "timeline" | "root"
        textColor?: string
        styles?: StyleProp<ViewStyle>
        isSmall: boolean
        onLongPress?: () => void
        compactTodos?: boolean
        priority?: number | null
        onToggleComplete?: () => void
    },
) {
    const start = moment(timeline.beginTime, "HH:mm").format("HH:mm")
    const end = moment(timeline.endTime, "HH:mm").format("HH:mm")

    const isExpired = useMemo(() => {
        const now = moment()
        if (!timeline?.date) return false
        if (moment(timeline.date).isAfter(now)) return false
        if (timeline.isCompleted) return false
        const s = moment(timeline.beginTime, "HH:mm")
        const e = moment(timeline.endTime, "HH:mm")
        if (now.isAfter(e)) return true
        if (now.isAfter(s) && now.isBefore(e)) return false
    }, [timeline.date, timeline.beginTime, timeline.endTime, timeline.isCompleted])

    const todoStats = useMemo(() => {
        if (!timeline.todos?.length) return null
        const done = timeline.todos.filter((t) => t.isCompleted).length
        return { done, total: timeline.todos.length }
    }, [timeline.todos])

    const accentColor = timeline.isCompleted ? "#34C759" : isExpired ? "#FF9500" : Colors.secondary
    const statusLabel = timeline.isCompleted ? "Done" : isExpired ? "Late" : "To do"
    const statusBg = timeline.isCompleted ? "#34C75918" : isExpired ? "#FF950018" : Colors.primary_lighter

    const Chips = (
        <View style={localStyles.chips}>
            {timeline.priority != null && (
                <View style={[localStyles.chip, { backgroundColor: priorityColor(timeline.priority) + "18" }]}>
                    <Text style={[localStyles.chipText, { color: priorityColor(timeline.priority) }]}>
                        {priorityLabel(timeline.priority)}
                    </Text>
                </View>
            )}
            <View style={[localStyles.chip, { backgroundColor: statusBg }]}>
                <Text style={[localStyles.chipText, { color: accentColor }]}>{statusLabel}</Text>
            </View>
        </View>
    )

    if (timeline.isSmall) {
        return (
            <View style={[timelineStyles.itemContainer, timeline.styles, localStyles.compactContainer]}>
                <View style={[localStyles.accentBar, { backgroundColor: accentColor }]} />
                <View style={localStyles.compactContent}>
                    <View style={localStyles.row}>
                        {timeline.isRepeat && <Feather name="repeat" size={12} color={Colors.foreground_secondary} />}
                        <Text
                            variant="subtitle"
                            numberOfLines={1}
                            style={[
                                localStyles.title,
                                { fontSize: 14 },
                                timeline.textColor && { color: timeline.textColor },
                            ]}
                        >
                            {timeline.title}
                        </Text>
                    </View>
                    <Text
                        variant="caption"
                        style={[localStyles.timeText, timeline.textColor && { color: timeline.textColor }]}
                    >
                        {start} – {end}
                    </Text>
                    {todoStats && (
                        <Text style={[localStyles.chipText, { color: Colors.foreground_secondary, marginTop: 2 }]}>
                            {todoStats.done}/{todoStats.total} tasks
                        </Text>
                    )}
                </View>
            </View>
        )
    }

    return (
        <View style={[timelineStyles.itemContainer, timeline.styles, localStyles.container]}>
            <View style={[localStyles.accentBar, { backgroundColor: accentColor }]} />
            <View style={localStyles.content}>
                <View style={localStyles.row}>
                    {timeline.isRepeat && <Feather name="repeat" size={14} color={Colors.foreground_secondary} />}
                    <Text
                        variant="subtitle"
                        numberOfLines={1}
                        style={[localStyles.title, timeline.textColor && { color: timeline.textColor }]}
                    >
                        {timeline.title}
                    </Text>
                </View>

                <Text
                    variant="caption"
                    style={[localStyles.timeText, timeline.textColor && { color: timeline.textColor }]}
                >
                    {start} – {end}
                </Text>

                {!!timeline.description && (
                    <Text
                        variant="caption"
                        numberOfLines={2}
                        style={[timelineStyles.itemDescription, timeline.textColor && { color: timeline.textColor }]}
                    >
                        {timeline.description}
                    </Text>
                )}

                <TodosPreviewSection
                    todos={timeline.todos}
                    timelineId={timeline.id}
                    occurrenceDate={timeline.date}
                    textColor={timeline.textColor}
                    maxItems={timeline.compactTodos ? 1 : 3}
                />

                {timeline.images.length > 0 && (
                    <Text
                        variant="caption"
                        style={[localStyles.metadataText, timeline.textColor && { color: timeline.textColor }]}
                    >
                        {timeline.images.length} {timeline.images.length > 1 ? "images" : "image"}
                    </Text>
                )}

                <View style={localStyles.footer}>
                    {todoStats ? (
                        <View style={[localStyles.chip, { backgroundColor: Colors.primary_lighter }]}>
                            <Text style={[localStyles.chipText, { color: Colors.foreground_secondary }]}>
                                {todoStats.done}/{todoStats.total}
                            </Text>
                        </View>
                    ) : (
                        <View />
                    )}
                    {Chips}
                </View>
            </View>
        </View>
    )
}

const localStyles = StyleSheet.create({
    container: {
        padding: 12,
        flexDirection: "row",
        gap: 10,
    },
    compactContainer: {
        padding: 8,
        flexDirection: "row",
        gap: 8,
    },
    accentBar: {
        width: 3,
        borderRadius: 3,
        alignSelf: "stretch",
    },
    content: {
        flex: 1,
        gap: 5,
    },
    compactContent: {
        flex: 1,
        gap: 3,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    title: {
        color: Colors.secondary,
        fontFamily: FONTS.bold,
        fontSize: 18,
        flex: 1,
    },
    timeText: {
        color: Colors.foreground_secondary,
        fontSize: 13,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 4,
    },
    chips: {
        flexDirection: "row",
        gap: 6,
    },
    chip: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    chipText: {
        fontSize: 12,
        fontFamily: FONTS.semibold,
    },
    metadataText: {
        color: Colors.foreground_secondary,
        fontSize: 13,
        opacity: 0.7,
    },
})
