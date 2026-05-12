import Header from "@/components/ui/Header/Header"
import Text from "@/components/ui/Text/Text"
import Colors, { secondary_candidates } from "@/constants/Colors"
import { Feather } from "@expo/vector-icons"
import Color from "color"
import moment from "moment"
import { useCallback, useMemo, useState } from "react"
import type { GoalEntry as GoalEntryType } from "@/gql/graphql"
import { StyleSheet, View } from "react-native"
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated"
import { SafeAreaView } from "react-native-safe-area-context"
import DayEntry from "../components/GoalEntry"
import GitHubActivityGrid from "../components/StatGrid"
import { useGetGoal, useGoal, useDeleteGoalEntry } from "../hooks/hooks"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import { isLimitGoal } from "../hooks/hooks"

export default function Goal({ route, navigation }: any) {
    const { id } = route.params
    const { data: goalData } = useGetGoal(id)
    const { upsertStats } = useGoal()
    const deleteGoalEntry = useDeleteGoalEntry()

    const goal = goalData?.goal || {}
    const isLimit = isLimitGoal(goal.min)

    const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

    const data = useMemo(() => {
        const entries = goal?.entries || []
        const hasTodayEntry = entries.some((entry: GoalEntryType) => moment(entry.date).isSame(moment(), "day"))

        if (!hasTodayEntry) {
            return [
                {
                    id: "new",
                    date: moment().toISOString(),
                    value: 0,
                },
                ...entries,
            ]
        }

        return entries
    }, [goal.entries])

    const contributionData = useMemo(() => {
        return (goal?.entries || []).map((entry: GoalEntryType) => ({
            date: entry.date,
            count: entry.value,
        }))
    }, [goal.entries])

    const scrollY = useSharedValue(0)
    const onScroll = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y
        },
    })

    const handleEditEntry = (entry: any) => {
        navigation.navigate("UpdateGoalEntry", {
            id,
            entryId: entry.id !== "new" ? entry.id : undefined,
            entryValue: entry.value,
            entryDate: entry.date,
        })
    }

    const handleAddEntry = (entry: any) => {
        navigation.navigate("UpdateGoalEntry", {
            id,
            entryDate: entry.date,
        })
    }

    const handleDeleteEntry = async (entryId: string) => {
        try {
            await deleteGoalEntry({ variables: { id: entryId } })
        } catch {
            // Fallback: soft-delete via upsert with value 0
            const entry = goal?.entries?.find((e: any) => e.id === entryId)
            if (entry) {
                await upsertStats({
                    variables: {
                        input: {
                            goalsId: id,
                            value: 0,
                            date: moment(entry.date).format("YYYY-MM-DD"),
                        },
                    },
                })
            }
        }
        setDeleteTarget(null)
    }

    const primaryColor = secondary_candidates[0]

    const getItemLayout = useCallback((_: any, index: number) => ({ length: 80, offset: 80 * index, index }), [])

    const headerButtons = [
        {
            onPress: () => navigation.navigate("CreateGoal", { id }),
            icon: <Feather name="edit-2" size={20} color={Colors.foreground} />,
        },
        {
            onPress: () => navigation.navigate("UpdateGoalEntry", { id }),
            icon: <Feather name="plus" size={20} color={Colors.foreground} />,
        },
    ]

    return (
        <SafeAreaView style={{ flex: 1, padding: 15 }}>
            <ConfirmDialog
                isVisible={!!deleteTarget}
                onDismiss={() => {
                    setDeleteTarget(null)
                }}
                onConfirm={() => {
                    if (deleteTarget) handleDeleteEntry(deleteTarget)
                }}
                title="Delete Entry?"
                description="This entry will be removed permanently."
                destructive
            />
            <Header
                animatedTitle={goal?.name || "Goal"}
                animatedSubtitle={goal?.description || ""}
                scrollY={scrollY}
                goBack={false}
                initialHeight={60}
                animated
                buttons={headerButtons}
                initialTitleFontSize={40}
            />

            <Animated.FlatList
                onScroll={onScroll}
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
                    />
                )}
                ListHeaderComponent={
                    <View
                        style={{
                            padding: 10,
                            backgroundColor: Colors.primary_lighter,
                            borderRadius: 10,
                            marginBottom: 15,
                        }}
                    >
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
                ListFooterComponent={<View style={{ height: 80, width: "100%" }} />}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    list: {
        gap: 12,
        paddingTop: 200,
    },
    emptyText: {
        color: Colors.foreground_secondary,
        textAlign: "center",
        marginTop: 20,
    },
})
