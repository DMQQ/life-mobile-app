import moment from "moment"
import { useMemo } from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import Colors from "@/constants/Colors"
import Text from "@/components/ui/Text/Text"
import Checkbox from "@/components/ui/Checkbox"
import { GetTimelineQuery } from "../hooks/query/useGetTimeLineQuery"
import timelineStyles from "./timeline.styles"
import TodosPreviewSection from "./TodosPreviewSection"
import { Feather } from "@expo/vector-icons"
import Color from "color"

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

    const statusLabel = timeline.isCompleted ? "Done" : isExpired ? "Late" : "To do"
    const statusColor = timeline.isCompleted ? "#34C759" : isExpired ? "#FF9500" : Colors.foreground_secondary
    const statusBg = timeline.isCompleted ? "#34C75918" : isExpired ? "#FF950018" : Colors.primary_lighter

    const ChipRow = (
        <View style={localStyles.chips}>
            {timeline.priority != null && (
                <View style={[localStyles.chip, { backgroundColor: priorityColor(timeline.priority) + "18" }]}>
                    <Text style={[localStyles.chipText, { color: priorityColor(timeline.priority) }]}>
                        {priorityLabel(timeline.priority)}
                    </Text>
                </View>
            )}
            <View style={[localStyles.chip, { backgroundColor: statusBg }]}>
                <Text style={[localStyles.chipText, { color: statusColor }]}>{statusLabel}</Text>
            </View>
        </View>
    )

    if (timeline.isSmall) {
        return (
            <View style={[timelineStyles.itemContainer, timeline.styles, localStyles.compactContainer]}>
                <View style={localStyles.compactRow}>
                    {timeline.isRepeat && <Feather name="repeat" size={14} color={Colors.secondary_light_1} />}
                    <Text
                        variant="subtitle"
                        numberOfLines={1}
                        style={[
                            timelineStyles.itemTitle,
                            { flex: 1, fontSize: 15 },
                            timeline.isCompleted && localStyles.completedTitle,
                            timeline.textColor && { color: timeline.textColor },
                        ]}
                    >
                        {timeline.title}
                    </Text>
                    <Text
                        variant="caption"
                        style={[
                            timelineStyles.itemTimeLeft,
                            { fontSize: 12 },
                            timeline.textColor && { color: timeline.textColor },
                        ]}
                    >
                        {start} - {end}
                    </Text>
                </View>
                <View style={localStyles.compactFooter}>
                    {todoStats ? (
                        <Text style={[localStyles.chipText, { color: Colors.foreground_secondary }]}>
                            {todoStats.done}/{todoStats.total}
                        </Text>
                    ) : (
                        <View />
                    )}
                    {ChipRow}
                </View>
            </View>
        )
    }

    return (
        <View style={[timelineStyles.itemContainer, timeline.styles, localStyles.container]}>
            <View style={localStyles.sidebar}>
                {timeline.onToggleComplete && (
                    <Checkbox checked={timeline.isCompleted} onPress={timeline.onToggleComplete} size={26} />
                )}
                {timeline.isRepeat && <Feather name="repeat" size={20} color={Colors.secondary_light_1} />}
            </View>
            <View style={{ flex: 1, height: "100%" }}>
                <View style={[timelineStyles.itemContainerTitleRow, localStyles.headerRow]}>
                    <Text
                        variant="subtitle"
                        numberOfLines={1}
                        style={[
                            timelineStyles.itemTitle,
                            { flex: 1 },
                            timeline.isCompleted && localStyles.completedTitle,
                            timeline.textColor && { color: timeline.textColor },
                        ]}
                    >
                        {timeline.title}
                    </Text>
                    <View style={localStyles.headerRight}>
                        <Text
                            variant="caption"
                            style={[timelineStyles.itemTimeLeft, timeline.textColor && { color: timeline.textColor }]}
                        >
                            {start} - {end}
                        </Text>
                    </View>
                </View>

                <View style={{ flex: 1 }}>
                    {!!timeline.description && (
                        <Text
                            variant="caption"
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
                        {ChipRow}
                    </View>
                </View>
            </View>
        </View>
    )
}

const localStyles = StyleSheet.create({
    container: {
        padding: 14,
        gap: 10,
        flexDirection: "row",
        alignItems: "flex-start",
        flex: 1,
    },
    compactContainer: {
        padding: 10,
        gap: 4,
        flex: 1,
    },
    compactRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    compactFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingLeft: 4,
    },
    sidebar: {
        alignItems: "center",
        gap: 6,
        paddingRight: 10,
        borderRightWidth: 1,
        borderRightColor: Color(Colors.primary_lighter).lighten(1.5).toString(),
        height: "100%",
    },
    headerRow: {
        marginBottom: 0,
    },
    headerRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    completedTitle: {
        textDecorationLine: "line-through",
        opacity: 0.6,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 2,
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
        fontWeight: "600",
    },
    metadataText: {
        color: Colors.foreground_secondary,
        fontSize: 13,
        marginTop: 2,
        opacity: 0.7,
    },
})
