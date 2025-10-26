import Text from "@/components/ui/Text/Text"
import { useState, useMemo } from "react"
import { View, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert, TextInput } from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import useGetTimeLineQuery, { GetTimelineQuery } from "../hooks/query/useGetTimeLineQuery"
import useTransferTodos from "../hooks/mutation/useTransferTodos"
import Colors from "@/constants/Colors"
import { Ionicons } from "@expo/vector-icons"
import moment from "moment"
import DatePicker from "@/components/DatePicker"
import lowOpacity from "@/utils/functions/lowOpacity"
import { Button } from "@/components"

interface TodosTransferModalParams {
    todos: any[]
    timelineId: string
}

export default function TodosTransferModal({ route, navigation }: any) {
    const { timelineId: sourceTimelineId } = route.params as TodosTransferModalParams

    const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"))
    const { data, loading, error, setSelected } = useGetTimeLineQuery(selectedDate)

    const [transferring, setTransferring] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    const availableTimelines = useMemo(() => {
        const filtered = data?.timeline?.filter((t) => t.id !== sourceTimelineId) || []

        if (!searchQuery.trim()) {
            return filtered
        }

        return filtered.filter(
            (timeline) =>
                timeline.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                timeline.description?.toLowerCase().includes(searchQuery.toLowerCase()),
        )
    }, [data?.timeline, sourceTimelineId, searchQuery])

    const [targetTimelineId, setTargetTimelineId] = useState<string>("")
    const [transferTodos, transferState] = useTransferTodos(sourceTimelineId, targetTimelineId)

    console.log("Available Timelines:", JSON.stringify(transferState.error, null, 2))

    const handleTransfer = async () => {
        setTransferring(true)
        try {
            try {
                await transferTodos()
                await new Promise((resolve) => setTimeout(resolve, 500))
                navigation.navigate("TimelineDetails", { timelineId: targetTimelineId })
            } catch (error) {
                Alert.alert("Error", "Failed to transfer todos")
            } finally {
                setTransferring(false)
            }
        } catch (error) {
            Alert.alert("Error", "Failed to transfer todos")
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

    const renderTimelineItem = ({ item }: { item: GetTimelineQuery }) => (
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
            <Ionicons name="chevron-forward" size={20} color={Colors.text_dark} />
        </TouchableOpacity>
    )

    return (
        <View style={styles.container}>
            <View style={styles.dateNavigator}>
                <TouchableOpacity style={styles.dateButton} onPress={() => changeDate("prev")}>
                    <Ionicons name="chevron-back" size={24} color={Colors.secondary} />
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
                    <Ionicons name="chevron-forward" size={24} color={Colors.secondary} />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                    <Ionicons name="search" size={20} color={Colors.text_dark} style={styles.searchIcon} />
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
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.secondary} />
                    <Text variant="body" color={Colors.foreground_secondary} style={{ marginTop: 10 }}>
                        Loading timelines...
                    </Text>
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Text variant="body" color={Colors.error}>
                        Error loading timelines
                    </Text>
                </View>
            ) : availableTimelines?.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons
                        name={searchQuery ? "search-outline" : "calendar-outline"}
                        size={48}
                        color={Colors.text_dark}
                    />
                    <Text variant="body" color={Colors.foreground_secondary} style={{ marginTop: 10 }}>
                        {searchQuery ? "No timelines match your search" : "No timelines available for this date"}
                    </Text>
                    <Text variant="caption" color={Colors.text_dark} style={{ marginTop: 5 }}>
                        {searchQuery ? "Try a different search term" : "Try selecting a different date"}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={availableTimelines}
                    renderItem={renderTimelineItem}
                    keyExtractor={(item) => item.id}
                    style={styles.timelineList}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {transferring && (
                <View style={styles.transferringOverlay}>
                    <ActivityIndicator size="large" color={Colors.secondary} />
                    <Text variant="body" color={Colors.foreground} style={{ marginTop: 10 }}>
                        Transferring todos...
                    </Text>
                </View>
            )}

            {targetTimelineId && (
                <View style={{ padding: 15, marginBottom: 15 }}>
                    <Button style={{ borderRadius: 100 }} onPress={handleTransfer}>
                        Transfer to Selected Timeline
                    </Button>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    header: {
        padding: 20,
        paddingBottom: 10,
        backgroundColor: Colors.primary_dark,
    },
    title: {
        marginBottom: 5,
        color: Colors.text_light,
    },
    subtitle: {
        marginBottom: 0,
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
    currentDate: {
        textAlign: "center",
        color: Colors.text_light,
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
    clearButton: {
        marginLeft: 10,
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
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.primary,
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.primary,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
        backgroundColor: Colors.primary,
    },
    transferringOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: Colors.primary + "CC", // 80% opacity
        justifyContent: "center",
        alignItems: "center",
    },
})
