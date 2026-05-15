import Text from "@/components/ui/Text/Text"
import { useState, useMemo } from "react"
import { View, StyleSheet, TouchableOpacity, FlatList, TextInput } from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import useGetOccurrencesQuery, { OccurrenceItem } from "../hooks/query/useGetOccurrencesQuery"
import useTransferTodos from "../hooks/mutation/useTransferTodos"
import Colors from "@/constants/Colors"
import { Feather } from "@expo/vector-icons"
import moment from "moment"
import DatePicker from "@/components/DatePicker"
import lowOpacity from "@/utils/functions/lowOpacity"
import { Button, ModalHeader, LoadingOverlay, EmptyState } from "@/components"

export default function TodosTransferModal() {
    const { timelineId: sourceTimelineId } = useLocalSearchParams<{ todos: any[]; timelineId: string }>()

    const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"))
    const { data, loading, error, setSelected } = useGetOccurrencesQuery(selectedDate)

    const [transferring, setTransferring] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    const availableTimelines = useMemo(() => {
        const filtered = data?.occurrences?.filter((t) => t.id !== sourceTimelineId) || []

        if (!searchQuery.trim()) return filtered

        return filtered.filter(
            (timeline) =>
                timeline.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                timeline.description?.toLowerCase().includes(searchQuery.toLowerCase()),
        )
    }, [data?.occurrences, sourceTimelineId, searchQuery])

    const [targetTimelineId, setTargetTimelineId] = useState<string>("")
    const [transferTodos] = useTransferTodos(sourceTimelineId, targetTimelineId)

    const handleTransfer = async () => {
        setTransferring(true)
        try {
            await transferTodos()
            await new Promise((resolve) => setTimeout(resolve, 500))
            router.push({ pathname: "/(tabs)/timeline/[id]", params: { timelineId: targetTimelineId }})
        } catch {
        } finally {
            setTransferring(false)
        }
    }

    const changeDate = (direction: "prev" | "next") => {
        const newDate = moment(selectedDate)
            .add(direction === "next" ? 1 : -1, "day")
            .format("YYYY-MM-DD")
        setSelectedDate(newDate)
        setSelected(newDate)
    }

    const renderTimelineItem = ({ item }: { item: OccurrenceItem }) => (
        <TouchableOpacity
            style={[
                styles.timelineItem,
                {
                    borderColor: item.id === targetTimelineId ? Colors.secondary : Colors.primary_light,
                    backgroundColor:
                        item.id === targetTimelineId ? lowOpacity(Colors.secondary, 0.1) : Colors.primary_dark,
                },
            ]}
            onPress={() => setTargetTimelineId(item.id)}
            disabled={transferring}
        >
            <View style={styles.timelineContent}>
                <Text variant="subtitle" style={styles.timelineTitle}>
                    {item.title}
                </Text>
                <Text variant="caption" color={Colors.text_dark} style={styles.timelineTime}>
                    {item.beginTime} - {item.endTime}
                </Text>
                {item.description && (
                    <Text variant="caption" color={Colors.text_dark} numberOfLines={2}>
                        {item.description}
                    </Text>
                )}
                <View style={styles.timelineStats}>
                    <Text variant="caption" color={Colors.text_dark}>
                        {item.todos?.length} todos • {item.images?.length} images
                    </Text>
                </View>
            </View>
            <Feather name="chevron-right" size={20} color={Colors.text_dark} />
        </TouchableOpacity>
    )

    return (
        <View style={styles.container}>
            <ModalHeader title="Transfer Todos" onClose={() => router.back()} />

            <View style={styles.dateNavigator}>
                <TouchableOpacity style={styles.dateButton} onPress={() => changeDate("prev")}>
                    <Feather name="chevron-left" size={24} color={Colors.secondary} />
                </TouchableOpacity>

                <View style={styles.datePickerContainer}>
                    <DatePicker
                        mode="single"
                        dates={{
                            start: moment(selectedDate).toDate(),
                            end: moment(selectedDate).toDate(),
                        }}
                        setDates={({ start }) => {
                            const newDate = moment(start).format("YYYY-MM-DD")
                            setSelectedDate(newDate)
                            setSelected(newDate)
                        }}
                    />
                </View>

                <TouchableOpacity style={styles.dateButton} onPress={() => changeDate("next")}>
                    <Feather name="chevron-right" size={24} color={Colors.secondary} />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                    <Feather name="search" size={20} color={Colors.text_dark} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search timelines..."
                        placeholderTextColor={Colors.text_dark}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        clearButtonMode="while-editing"
                    />
                </View>
            </View>

            {loading ? (
                <EmptyState icon="loader" title="Loading timelines..." />
            ) : error ? (
                <EmptyState icon="alert-circle" title="Error loading timelines" description="Try a different date" />
            ) : availableTimelines?.length === 0 ? (
                <EmptyState
                    icon={searchQuery ? "search" : "calendar"}
                    title={searchQuery ? "No timelines match your search" : "No timelines available"}
                    description={searchQuery ? "Try a different search term" : "Try selecting a different date"}
                />
            ) : (
                <FlatList
                    data={availableTimelines}
                    renderItem={renderTimelineItem}
                    keyExtractor={(item) => item.id}
                    style={styles.timelineList}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {targetTimelineId && (
                <View style={styles.actionContainer}>
                    <Button style={styles.transferButton} onPress={handleTransfer}>
                        Transfer to Selected Timeline
                    </Button>
                </View>
            )}

            <LoadingOverlay visible={transferring} label="Transferring todos..." />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    dateNavigator: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.primary_light,
        backgroundColor: Colors.primary_dark,
    },
    dateButton: {
        padding: 10,
    },
    datePickerContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: Colors.primary_dark,
        borderBottomWidth: 1,
        borderBottomColor: Colors.primary_light,
    },
    searchInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.primary_light,
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: Colors.text_light,
        paddingVertical: 5,
    },
    timelineList: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: Colors.primary,
    },
    timelineItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        marginVertical: 5,
        backgroundColor: Colors.primary_dark,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.primary_light,
    },
    timelineContent: {
        flex: 1,
    },
    timelineTitle: {
        marginBottom: 5,
        color: Colors.text_light,
    },
    timelineTime: {
        marginBottom: 5,
    },
    timelineStats: {
        marginTop: 5,
    },
    actionContainer: {
        padding: 15,
        marginBottom: 15,
    },
    transferButton: {
        borderRadius: 100,
    },
})
