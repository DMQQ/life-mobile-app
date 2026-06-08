import Header from "@/components/ui/Header/Header"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import { Feather } from "@expo/vector-icons"
import dayjs from "dayjs"
import { useCallback, useMemo, useState } from "react"
import type { GoalEntry as GoalEntryType } from "@/gql/graphql"
import { FlatList, StyleSheet, View } from "react-native"
import DayEntry from "../components/GoalEntry"
import GitHubActivityGrid from "../components/StatGrid"
import { useGetGoal, useGoal, useDeleteGoalEntry, GET_GOAL } from "../hooks/hooks"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import { isLimitGoal } from "../hooks/hooks"
import Background from "@/components/ui/Background"

export default function Goal({ route, navigation }: any) {
    const { id } = route.params
    const { data: goalData } = useGetGoal(id)
    const { upsertStats } = useGoal()
    const deleteGoalEntry = useDeleteGoalEntry()

    const goal = goalData?.goal || {}
    const isLimit = isLimitGoal(goal.min)
    const primaryColor = goal.color || Colors.secondary

    const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

    const data = useMemo(() => {
        const entries = goal?.entries || []
        const hasTodayEntry = entries.some((entry: GoalEntryType) =>
            dayjs(entry.date).isSame(dayjs(), "day"),
        )
        if (!hasTodayEntry) {
            return [{ id: "new", date: dayjs().toISOString(), value: 0 }, ...entries]
        }
        return entries
    }, [goal.entries])

    const contributionData = useMemo(() => {
        return (goal?.entries || []).map((entry: GoalEntryType) => ({
            date: entry.date,
            count: entry.value,
        }))
    }, [goal.entries])

    const handleEditEntry = (entry: any) => {
        navigation.navigate("UpdateGoalEntry", {
            id,
            entryId: entry.id !== "new" ? entry.id : undefined,
            entryValue: entry.value,
            entryDate: entry.date,
        })
    }

    const handleAddEntry = (entry: any) => {
        navigation.navigate("UpdateGoalEntry", { id, entryDate: entry.date })
    }

    const handleQuickAdd = useCallback(
        async (entry: any) => {
            await upsertStats({
                variables: {
                    input: {
                        goalsId: id,
                        value: 1,
                        date: dayjs(entry.date).format("YYYY-MM-DD"),
                    },
                },
                refetchQueries: [{ query: GET_GOAL, variables: { id } }],
            })
        },
        [id, upsertStats],
    )

    const handleDeleteEntry = async (entryId: string) => {
        try {
            await deleteGoalEntry({ variables: { id: entryId } })
        } catch {
            const entry = goal?.entries?.find((e: any) => e.id === entryId)
            if (entry) {
                await upsertStats({
                    variables: {
                        input: {
                            goalsId: id,
                            value: 0,
                            date: dayjs(entry.date).format("YYYY-MM-DD"),
                        },
                    },
                })
            }
        }
        setDeleteTarget(null)
    }

    const getItemLayout = useCallback(
        (_: any, index: number) => ({ length: 64, offset: 64 * index, index }),
        [],
    )

    const headerButtons = [
        {
            onPress: () => navigation.navigate("CreateGoal", { id }),
            icon: <Feather name="edit-2" size={20} color={Colors.foreground} />,
        },
    ]

    return (
        <View style={{ flex: 1, padding: 15 }}>
            <ConfirmDialog
                isVisible={!!deleteTarget}
                onDismiss={() => setDeleteTarget(null)}
                onConfirm={() => { if (deleteTarget) handleDeleteEntry(deleteTarget) }}
                title="Delete Entry?"
                description="This entry will be removed permanently."
                destructive
            />
            <Background tintColor={primaryColor} />
            <Header title={goal?.name || "Goal"} goBack animated={false} buttons={headerButtons} />

            <FlatList
                data={data}
                keyExtractor={(item: any) => item.id}
                getItemLayout={getItemLayout}
                removeClippedSubviews
                renderItem={({ item, index }: any) => (
                    <DayEntry
                        index={index}
                        entry={{ ...item, ...goal }}
                        onEdit={handleEditEntry}
                        onDelete={(entryId) => setDeleteTarget(entryId)}
                        onAdd={handleAddEntry}
                        onQuickAdd={handleQuickAdd}
                    />
                )}
                ListHeaderComponent={
                    <View style={styles.gridCard}>
                        <GitHubActivityGrid
                            contributionData={contributionData}
                            primaryColor={primaryColor}
                            goalThreshold={goal.target}
                            isLimit={isLimit}
                            size={20}
                        />
                    </View>
                }
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <Text variant="body" style={styles.emptyText}>
                        No entries yet
                    </Text>
                }
                ListFooterComponent={<View style={{ height: 60, width: "100%" }} />}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    list: {
        gap: 8,
        paddingTop: 100,
    },
    gridCard: {
        padding: 10,
        backgroundColor: Colors.primary_lighter,
        borderRadius: 14,
        marginBottom: 16,
    },
    emptyText: {
        color: Colors.foreground_secondary,
        textAlign: "center",
        marginTop: 20,
    },
})
