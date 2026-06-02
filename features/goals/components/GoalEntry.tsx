import { FONTS } from "@/constants/Fonts"
import { Card, GlassIconButton } from "@/components"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import lowOpacity from "@/utils/functions/lowOpacity"
import Color from "color"
import { StyleSheet, View } from "react-native"
import ContextMenu from "react-native-context-menu-view"
import { isLimitGoal } from "../hooks/hooks"
import dayjs from "dayjs"

interface Entry {
    id: string
    value: number
    date: string
    unit?: string
    min?: number
    max?: number
    target?: number
}

interface DayEntryProps {
    entry: Entry
    index: number
    onEdit?: (entry: Entry) => void
    onDelete?: (entryId: string) => void
    onAdd?: (entry: Entry) => void
}

const DayEntry = ({ entry, index, onEdit, onDelete, onAdd }: DayEntryProps) => {
    const date = dayjs(entry.date)
    const isCurrentDay = date.isSame(dayjs(), "day")
    const isLimit = isLimitGoal(entry.min)
    const target = entry.target || 0

    const isGoalMet = isLimit ? entry.value > 0 && entry.value <= target : entry.value >= target
    const isOverLimit = isLimit && entry.value > target

    const statusColor = isOverLimit ? "#F44336" : isGoalMet ? "#4CAF50" : isCurrentDay ? "#FFC107" : "#F44336"

    const progress = target > 0 ? Math.min(entry.value / target, 1) : 0
    const progressWidth = `${Math.round(progress * 100)}%` as any

    const actions = []
    if (onEdit) {
        actions.push({ title: "Edit Entry", systemIcon: "pencil" as const })
    }
    if (onDelete && entry.id !== "new") {
        actions.push({ title: "Delete Entry", systemIcon: "trash" as const, destructive: true })
    }

    const content = (
        <Card
            style={[
                styles.dayContainer,
                index === 0 && {
                    borderWidth: 2,
                    borderColor: lowOpacity(Colors.secondary, 0.1),
                    backgroundColor: lowOpacity(Colors.secondary, 0.1),
                },
                index !== 0 &&
                    isGoalMet && {
                        borderWidth: 2,
                        borderColor: lowOpacity("#0ED725", 0.1),
                        backgroundColor: lowOpacity("#0ED725", 0.1),
                    },
                index !== 0 &&
                    !isGoalMet &&
                    !isCurrentDay && {
                        borderWidth: 2,
                        borderColor: lowOpacity("#FF0000", 0.1),
                        backgroundColor: lowOpacity("#FF0000", 0.1),
                    },
            ]}
        >
            <View style={styles.dateSection}>
                <Text variant="subheading" style={[styles.day, isCurrentDay && styles.currentDay]}>
                    {date.format("D")}
                </Text>
                <Text variant="caption" style={styles.month}>
                    {date.format("MMM")}
                </Text>
            </View>

            <View style={styles.progressSection}>
                <View style={styles.progressLabels}>
                    <Text variant="caption" style={[styles.progressValue, { color: statusColor }]}>
                        {entry.value}
                    </Text>
                    <Text variant="caption" style={styles.progressTarget}>
                        / {target} {entry.unit}
                    </Text>
                </View>
                <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: progressWidth, backgroundColor: statusColor }]} />
                </View>
            </View>

            <GlassIconButton name="plus" size={20} onPress={() => onAdd?.(entry)} />
        </Card>
    )

    if (actions.length > 0) {
        return (
            <ContextMenu
                actions={actions}
                onPress={(e) => {
                    if (e.nativeEvent.name === "Edit Entry") {
                        onEdit?.(entry)
                    }
                    if (e.nativeEvent.name === "Delete Entry") {
                        onDelete?.(entry.id)
                    }
                }}
                previewBackgroundColor="transparent"
            >
                {content}
            </ContextMenu>
        )
    }

    return content
}

const styles = StyleSheet.create({
    dayContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 2,
        borderColor: Color(Colors.primary_lighter).lighten(1).hex(),
        backgroundColor: Colors.primary_lighter,
        padding: 10,
        height: 80,
    },
    dateSection: {
        alignItems: "center",
        minWidth: 50,
    },
    day: {
        fontFamily: FONTS.semibold,
    },
    currentDay: {
        color: "#2196F3",
    },
    month: {
        color: "rgba(255,255,255,0.6)",
        marginTop: 2,
    },
    progressSection: {
        flex: 2,
        gap: 6,
        paddingHorizontal: 15,
        justifyContent: "center",
    },
    progressLabels: {
        flexDirection: "row",
        alignItems: "baseline",
        gap: 4,
    },
    progressValue: {
        fontFamily: FONTS.bold,
        fontSize: 15,
    },
    progressTarget: {
        color: "rgba(255,255,255,0.45)",
        fontSize: 12,
    },
    progressTrack: {
        height: 6,
        borderRadius: 100,
        backgroundColor: "rgba(255,255,255,0.1)",
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        borderRadius: 100,
    },
})

export default DayEntry
