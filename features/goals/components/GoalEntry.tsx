import { FONTS } from "@/constants/Fonts"
import { Card, GlassIconButton } from "@/components"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import ProgressBar from "@/components/ui/ProgressBar"
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
    color?: string
}

interface DayEntryProps {
    entry: Entry
    index: number
    onEdit?: (entry: Entry) => void
    onDelete?: (entryId: string) => void
    onAdd?: (entry: Entry) => void
    onQuickAdd?: (entry: Entry) => void
}

const DayEntry = ({ entry, index, onEdit, onDelete, onAdd, onQuickAdd }: DayEntryProps) => {
    const date = dayjs(entry.date)
    const isNew = entry.id === "new"
    const isToday = date.isSame(dayjs(), "day")
    const isLimit = isLimitGoal(entry.min)
    const target = entry.target || 0
    const progress = target > 0 ? Math.min(entry.value / target, 1) : 0

    const isGoalMet = isLimit ? entry.value > 0 && entry.value <= target : entry.value >= target
    const isOverLimit = isLimit && entry.value > target

    const statusColor = isOverLimit
        ? "#ef4444"
        : isGoalMet
          ? "#22c55e"
          : isToday
            ? "#f59e0b"
            : "#ef4444"

    const accentColor = entry.color || Colors.secondary

    const actions = []
    if (onEdit && !isNew) actions.push({ title: "Edit Entry", systemIcon: "pencil" as const })
    if (onDelete && !isNew) actions.push({ title: "Delete Entry", systemIcon: "trash" as const, destructive: true })

    const content = (
        <Card style={styles.card}>
            <View style={[styles.statusBar, { backgroundColor: statusColor }]} />

            <View style={styles.dateCol}>
                <Text style={[styles.dayNum, isToday && { color: accentColor }]}>
                    {date.format("D")}
                </Text>
                <Text style={styles.monthText}>{date.format("MMM").toUpperCase()}</Text>
            </View>

            <View style={styles.progressCol}>
                <View style={styles.valueRow}>
                    <Text style={[styles.valueText, { color: statusColor }]}>
                        {entry.value}
                    </Text>
                    <Text style={styles.targetText}>
                        / {target}
                        {entry.unit ? ` ${entry.unit}` : ""}
                    </Text>
                </View>
                <ProgressBar
                    progress={progress * 100}
                    color={isGoalMet ? accentColor : statusColor}
                    gradient={isGoalMet}
                    height={3}
                />
            </View>

            <View style={styles.actions}>
                <GlassIconButton
                    padding={7}
                    size={12}
                    onPress={() => onQuickAdd?.(entry)}
                    icon={
                        <Text style={styles.plusOneLabel}>+1</Text>
                    }
                />
                <GlassIconButton
                    name={isNew ? "plus" : "edit-2"}
                    padding={7}
                    size={13}
                    onPress={() => (isNew ? onAdd?.(entry) : onEdit?.(entry))}
                />
            </View>
        </Card>
    )

    if (actions.length > 0) {
        return (
            <ContextMenu
                actions={actions}
                onPress={(e) => {
                    if (e.nativeEvent.name === "Edit Entry") onEdit?.(entry)
                    if (e.nativeEvent.name === "Delete Entry") onDelete?.(entry.id)
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
    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.primary_lighter,
        borderRadius: 15,
        paddingVertical: 12,
        paddingRight: 10,
        gap: 12,
        overflow: "hidden",
    },
    statusBar: {
        width: 3,
        height: "60%",
        borderRadius: 100,
        marginLeft: 10,
    },
    dateCol: {
        alignItems: "center",
        minWidth: 36,
    },
    dayNum: {
        fontFamily: FONTS.bold,
        fontSize: 17,
        color: Colors.foreground,
        lineHeight: 20,
    },
    monthText: {
        fontSize: 9,
        fontFamily: FONTS.semibold,
        color: Colors.foreground_secondary,
        letterSpacing: 0.5,
        marginTop: 2,
    },
    progressCol: {
        flex: 1,
        gap: 6,
    },
    valueRow: {
        flexDirection: "row",
        alignItems: "baseline",
        gap: 4,
    },
    valueText: {
        fontFamily: FONTS.bold,
        fontSize: 14,
    },
    targetText: {
        color: Colors.foreground_secondary,
        fontSize: 12,
        fontFamily: FONTS.regular,
    },
    actions: {
        flexDirection: "row",
        gap: 6,
    },
    plusOneLabel: {
        color: Colors.foreground,
        fontSize: 11,
        fontFamily: FONTS.semibold,
    },
})

export default DayEntry
