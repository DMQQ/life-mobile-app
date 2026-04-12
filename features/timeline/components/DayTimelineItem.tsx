import { useNavigation } from "@react-navigation/native"
import moment from "moment"
import { useMemo } from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import Colors from "@/constants/Colors"
import Text from "@/components/ui/Text/Text"
import { GetTimelineQuery } from "../hooks/query/useGetTimeLineQuery"
import timelineStyles from "./timeline.styles"
import TodosPreviewSection from "./TodosPreviewSection"
import { AntDesign, Feather } from "@expo/vector-icons"

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
    },
) {
    const start = moment(timeline.beginTime, "HH:mm").format("HH:mm")

    const end = moment(timeline.endTime, "HH:mm").format("HH:mm")

    const isExpired = useMemo(() => {
        const now = moment()

        if (!timeline?.date) return false

        if (moment(timeline.date).isAfter(now)) return false

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

    return (
        <View style={[timelineStyles.itemContainer, timeline.styles, { padding: 10 }]}>
            <View style={[timelineStyles.itemContainerTitleRow]}>
                <Text
                    variant="subtitle"
                    numberOfLines={1}
                    style={[timelineStyles.itemTitle, { ...(timeline.textColor && { color: timeline.textColor }) }]}
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
                    variant="caption"
                    style={[timelineStyles.itemTimeLeft, { ...(timeline.textColor && { color: timeline.textColor }) }]}
                >
                    {start} - {end}
                </Text>
            </View>

            {!timeline.isSmall && (
                <View style={styles.contentRow}>
                    <View style={styles.contentContainer}>
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
                                style={[styles.metadataText, timeline.textColor && { color: timeline.textColor }]}
                            >
                                {timeline.images.length} {timeline.images.length > 1 ? "images" : "image"}
                            </Text>
                        )}
                    </View>
                </View>
            )}

            <View style={styles.statusContainer}>
                {timeline.priority != null && (
                    <View style={[styles.statusBadge, { backgroundColor: priorityColor(timeline.priority) }]}>
                        <Text style={timelineStyles.status}>{priorityLabel(timeline.priority)}</Text>
                    </View>
                )}
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
        </View>
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
    statusContainer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        marginTop: 8,
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
    metadataText: {
        color: Colors.foreground_secondary,
        fontSize: 13,
        marginTop: 6,
        opacity: 0.7,
    },
})
