import { Card, GlassIconButton } from "@/components"
import Text from "@/components/ui/Text/Text"
import Colors, { secondary_candidates } from "@/constants/Colors"
import { Group } from "@/features/flashcards/hooks"
import { useNavigation } from "expo-router"
import { useCallback, useMemo, useOptimistic, useState } from "react"
import { StyleSheet, View } from "react-native"
import { FadeIn } from "react-native-reanimated"
import GoalActivityGrid from "./StatGrid"
import useDeleteGoals from "../hooks/useDeleteGoals"
import ContextMenu from "react-native-context-menu-view"
import { Feather } from "@expo/vector-icons"
import GlassView from "@/components/ui/GlassView"
import dayjs from "dayjs"
import { useUpsertGoalEntry } from "../hooks/hooks"

interface GoalCategoryProps extends Group {
    icon: string
    onPress?: () => void
    entries?: {
        id: string
        value: number
        date: string
    }[]
    target: number
    min: number
    max: number
    index: number
    length?: number

    onLongPress?: () => void
}

export const GoalCategory = ({ name, icon, description, entries = [], onPress, ...rest }: GoalCategoryProps) => {
    const navigation = useNavigation<any>()

    const contributionData = useMemo(() => {
        return entries.map((entry) => ({
            date: entry.date,
            count: entry.value,
        }))
    }, [entries])

    const { removeGroup } = useDeleteGoals()

    return (
        <ContextMenu
            previewBackgroundColor={"transparent"}
            actions={[
                {
                    title: "Edit Goal",
                    systemIcon: "pencil",
                },
                {
                    title: "Delete Goal",
                    systemIcon: "trash",
                    destructive: true,
                },
            ]}
            onPress={(e) => {
                if (e.nativeEvent.name === "Edit Goal") {
                    navigation.navigate("create", { id: rest.id })
                }
                if (e.nativeEvent.name === "Delete Goal") {
                    removeGroup({ variables: { id: rest.id } })
                }
            }}
        >
            <Card
                animated
                ripple
                onLongPress={rest.onLongPress}
                onPress={() => {
                    navigation.navigate("[id]", { id: rest.id })
                }}
                style={styles.container}
                entering={FadeIn.delay((rest.index + 1) * 50)}
            >
                <View style={[styles.row, styles.header]}>
                    <View style={styles.row}>
                        <View style={styles.iconContainer}>
                            <Feather name={icon as any} size={14} color={Colors.foreground} />
                        </View>
                        <Text style={{ color: Colors.foreground, fontSize: 14, fontWeight: "bold" }}>{name}</Text>
                    </View>
                    <IncrementCategory id={rest.id} entries={entries} min={rest.min} target={rest.target} />
                </View>
                <View style={{ pointerEvents: "box-none" }}>
                    <GoalActivityGrid
                        contributionData={contributionData}
                        primaryColor={secondary_candidates[rest?.index % secondary_candidates.length]}
                        goalThreshold={rest.target}
                        isLimit={rest.min === 1}
                        size={10}
                    />
                </View>
            </Card>
        </ContextMenu>
    )
}

const IncrementCategory = ({
    entries = [],
    min,
    target,
    id,
}: Pick<GoalCategoryProps, "entries" | "min" | "target" | "id">) => {
    const todaysEntry = useMemo(() => {
        const today = dayjs()
        const todayEntry = entries.find((entry) => dayjs(entry.date).isSame(today, "day"))
        return todayEntry ? todayEntry.value : 0
    }, [entries])

    const [value, setValue] = useState(todaysEntry)

    const isTodayCompleted = min === 1 ? todaysEntry <= target : todaysEntry >= target

    const [update, state] = useUpsertGoalEntry()

    const handleUpsert = useCallback(async () => {
        try {
            setValue((prev) => prev + 1)
            const response = await update({
                variables: {
                    input: { value: 1, goalsId: id },
                },
            })

            setValue(response.data.upsertGoalStats?.value)
        } catch (error) {
            setValue((p) => p - 1)
            console.error("Failed to upsert goal entry:", error)
        }
    }, [update, id])

    return (
        <View style={styles.row}>
            <Text
                style={{
                    color: isTodayCompleted ? Colors.secondary : Colors.foreground,
                    fontSize: 10,
                    textTransform: "uppercase",
                }}
            >
                {value} / {target}
            </Text>
            <GlassIconButton
                onPress={handleUpsert}
                loading={state.loading}
                tintColor={isTodayCompleted ? Colors.secondary : Colors.primary_lighter}
                size={15}
                padding={10}
                icon={
                    <Text
                        style={{
                            color: Colors.foreground,
                            fontSize: 12,
                            fontWeight: "semibold",
                        }}
                    >
                        +1
                    </Text>
                }
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 7.5,
        gap: 15,
    },
    iconContainer: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: Colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    header: {
        justifyContent: "space-between",
    },
    row: { flexDirection: "row", alignItems: "center", gap: 10 },
})

export default GoalCategory
