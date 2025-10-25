import Text from "@/components/ui/Text/Text"
import { useState } from "react"
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native"
import Colors from "@/constants/Colors"
import { Ionicons } from "@expo/vector-icons"
import moment from "moment"
import lowOpacity from "@/utils/functions/lowOpacity"
import { Button, ThemedCalendar } from "@/components"
import useCopyTimeline from "../hooks/mutation/useCopyTimeline"
import Layout from "@/constants/Layout"

interface CopyTimelineModalProps {
    route: {
        params: {
            timelineId: string
            timelineTitle: string
            originalDate: string
        }
    }

    navigation: any
}

export default function CopyTimelineModal({ route, navigation }: CopyTimelineModalProps) {
    const { timelineId, timelineTitle, originalDate } = route.params

    const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"))
    const [useOriginalDate, setUseOriginalDate] = useState(true)
    const [copying, setCopying] = useState(false)

    const { copyTimeline } = useCopyTimeline()

    const handleCopy = async () => {
        setCopying(true)
        try {
            const newDate = useOriginalDate ? undefined : selectedDate
            const response = await copyTimeline({
                timelineId,
                newDate,
            })

            navigation.navigate("Timeline" as any, {
                timelineId: response.id,
            })
        } catch (error) {
            console.error("Failed to copy timeline:", error)
        } finally {
            setCopying(false)
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => navigation.navigate("Timeline" as any)}
                    disabled={copying}
                >
                    <Ionicons name="close" size={24} color={Colors.text_light} />
                </TouchableOpacity>

                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Copy Timeline</Text>
                </View>
            </View>

            {/* Date Options */}
            <View style={styles.optionsContainer}>
                <Text variant="subtitle" style={styles.sectionTitle}>
                    Choose date for copied timeline:{" "}
                    <Text variant="body" color={Colors.foreground_secondary} style={styles.subtitle}>
                        {timelineTitle}
                    </Text>
                </Text>

                {/* Keep Original Date Option */}
                <TouchableOpacity
                    style={[
                        styles.option,
                        {
                            borderColor: useOriginalDate ? Colors.secondary : Colors.primary_light,
                            backgroundColor: useOriginalDate ? lowOpacity(Colors.secondary, 0.1) : Colors.primary_dark,
                        },
                    ]}
                    onPress={() => setUseOriginalDate(true)}
                    disabled={copying}
                >
                    <View style={styles.optionContent}>
                        <View style={styles.optionHeader}>
                            <Ionicons
                                name="calendar"
                                size={20}
                                color={useOriginalDate ? Colors.secondary : Colors.text_dark}
                            />
                            <Text
                                variant="subtitle"
                                style={[
                                    styles.optionTitle,
                                    { color: useOriginalDate ? Colors.secondary : Colors.text_light },
                                ]}
                            >
                                Keep original date
                            </Text>
                        </View>
                        <Text variant="caption" color={Colors.text_dark} style={styles.optionDescription}>
                            {moment(originalDate).format("MMMM DD, YYYY")} • Same as original timeline
                        </Text>
                    </View>
                    {useOriginalDate && <Ionicons name="checkmark-circle" size={24} color={Colors.secondary} />}
                </TouchableOpacity>

                {/* Choose New Date Option */}
                <TouchableOpacity
                    style={[
                        styles.option,
                        {
                            borderColor: !useOriginalDate ? Colors.secondary : Colors.primary_light,
                            backgroundColor: !useOriginalDate ? lowOpacity(Colors.secondary, 0.1) : Colors.primary_dark,
                        },
                    ]}
                    onPress={() => setUseOriginalDate(false)}
                    disabled={copying}
                >
                    <View style={styles.optionContent}>
                        <View style={styles.optionHeader}>
                            <Ionicons
                                name="calendar-outline"
                                size={20}
                                color={!useOriginalDate ? Colors.secondary : Colors.text_dark}
                            />
                            <Text
                                variant="subtitle"
                                style={[
                                    styles.optionTitle,
                                    { color: !useOriginalDate ? Colors.secondary : Colors.text_light },
                                ]}
                            >
                                Choose new date
                            </Text>
                        </View>
                        <Text variant="caption" color={Colors.text_dark} style={styles.optionDescription}>
                            {moment(selectedDate).format("MMMM DD, YYYY")} • Custom date selection
                        </Text>
                    </View>
                    {!useOriginalDate && <Ionicons name="checkmark-circle" size={24} color={Colors.secondary} />}
                </TouchableOpacity>
            </View>

            {/* Date Navigator - Only show when "Choose new date" is selected */}
            {!useOriginalDate && (
                <View style={styles.dateNavigator}>
                    {/* <DatePicker
                            mode="single"
                            dates={{
                                start: moment(selectedDate).toDate(),
                                end: moment(selectedDate).toDate(),
                            }}
                            setDates={({ start }) => {
                                const newDate = moment(start).format("YYYY-MM-DD")
                                setSelectedDate(newDate)
                                setUseOriginalDate(false)
                            }}
                        /> */}

                    <ThemedCalendar
                        current={selectedDate}
                        markedDates={{
                            [selectedDate]: {
                                selected: true,
                                selectedColor: Colors.secondary,
                            },
                        }}
                        onDayPress={(day) => {
                            setSelectedDate(day.dateString)
                            setUseOriginalDate(false)
                        }}
                        style={{
                            width: Layout.screen.width - 30,
                        }}
                    />
                </View>
            )}

            {/* Spacer */}
            <View style={{ flex: 1 }} />

            {/* Copy Button */}
            <View style={styles.actionContainer}>
                <Button style={styles.copyButton} onPress={handleCopy} disabled={copying}>
                    {copying ? "Copying Timeline..." : "Copy Timeline"}
                </Button>
            </View>

            {/* Loading Overlay */}
            {copying && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={Colors.secondary} />
                    <Text variant="body" color={Colors.foreground} style={{ marginTop: 10 }}>
                        Copying timeline...
                    </Text>
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
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 20,
        backgroundColor: Colors.primary_dark,
        borderBottomWidth: 1,
        borderBottomColor: Colors.primary_light,
        justifyContent: "center",
    },
    closeButton: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 20,
        marginRight: 15,
        position: "absolute",
        left: 15,
        top: 15,
    },
    headerContent: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        color: Colors.text_light,
        marginBottom: 4,
        fontWeight: "bold",
    },
    subtitle: {
        marginTop: 0,
    },
    optionsContainer: {
        padding: 15,
    },
    sectionTitle: {
        color: Colors.text_light,
        marginBottom: 20,
    },
    option: {
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        marginBottom: 15,
        backgroundColor: Colors.primary_dark,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.primary_light,
    },
    optionContent: {
        flex: 1,
    },
    optionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 5,
    },
    optionTitle: {
        marginLeft: 12,
        color: Colors.text_light,
    },
    optionDescription: {
        marginLeft: 32,
    },
    dateNavigator: {
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: Colors.primary_light,
    },
    actionContainer: {
        padding: 15,
        paddingBottom: 40,
    },
    copyButton: {
        borderRadius: 100,
    },
    loadingOverlay: {
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
