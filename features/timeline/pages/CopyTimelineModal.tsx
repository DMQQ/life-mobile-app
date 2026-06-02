import { FONTS } from "@/constants/Fonts"
import Text from "@/components/ui/Text/Text"
import { useState } from "react"
import { View, StyleSheet, TouchableOpacity } from "react-native"
import Colors from "@/constants/Colors"
import { Feather } from "@expo/vector-icons"
import moment from "moment"
import lowOpacity from "@/utils/functions/lowOpacity"
import { Button, ThemedCalendar, ModalHeader, LoadingOverlay } from "@/components"
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
            const response = await copyTimeline({
                timelineId,
                newDate: useOriginalDate ? undefined : selectedDate,
            })
            navigation.navigate("Timeline" as any, { timelineId: response.id })
        } catch {
        } finally {
            setCopying(false)
        }
    }

    return (
        <View style={styles.container}>
            <ModalHeader
                onClose={() => navigation.navigate("Timeline" as any)}
                title="Copy Timeline"
            />

            <View style={styles.optionsContainer}>
                <Text variant="subtitle" style={styles.sectionTitle}>
                    Choose date for{" "}
                    <Text variant="body" color={Colors.foreground_secondary}>
                        {timelineTitle}
                    </Text>
                </Text>

                <DateOption
                    icon="calendar"
                    title="Keep original date"
                    description={`${moment(originalDate).format("MMMM DD, YYYY")} • Same as original`}
                    selected={useOriginalDate}
                    onPress={() => setUseOriginalDate(true)}
                    disabled={copying}
                />

                <DateOption
                    icon="edit-3"
                    title="Choose new date"
                    description={`${moment(selectedDate).format("MMMM DD, YYYY")} • Custom date`}
                    selected={!useOriginalDate}
                    onPress={() => setUseOriginalDate(false)}
                    disabled={copying}
                />
            </View>

            {!useOriginalDate && (
                <View style={styles.calendarContainer}>
                    <ThemedCalendar
                        current={selectedDate}
                        markedDates={{
                            [selectedDate]: { selected: true, selectedColor: Colors.secondary },
                        }}
                        onDayPress={(day) => {
                            setSelectedDate(day.dateString)
                            setUseOriginalDate(false)
                        }}
                        style={{ width: Layout.screen.width - 30 }}
                    />
                </View>
            )}

            <View style={{ flex: 1 }} />

            <View style={styles.actionContainer}>
                <Button style={styles.copyButton} onPress={handleCopy} disabled={copying}>
                    {copying ? "Copying..." : "Copy Timeline"}
                </Button>
            </View>

            <LoadingOverlay visible={copying} label="Copying timeline..." />
        </View>
    )
}

interface DateOptionProps {
    icon: React.ComponentProps<typeof Feather>["name"]
    title: string
    description: string
    selected: boolean
    onPress: () => void
    disabled: boolean
}

function DateOption({ icon, title, description, selected, onPress, disabled }: DateOptionProps) {
    return (
        <TouchableOpacity
            style={[
                styles.option,
                {
                    borderColor: selected ? Colors.secondary : Colors.primary_light,
                    backgroundColor: selected ? lowOpacity(Colors.secondary, 0.1) : Colors.primary_dark,
                },
            ]}
            onPress={onPress}
            disabled={disabled}
        >
            <View style={styles.optionContent}>
                <View style={styles.optionHeader}>
                    <Feather name={icon} size={18} color={selected ? Colors.secondary : Colors.text_dark} />
                    <Text
                        variant="subtitle"
                        style={[styles.optionTitle, { color: selected ? Colors.secondary : Colors.text_light }]}
                    >
                        {title}
                    </Text>
                </View>
                <Text variant="caption" color={Colors.text_dark} style={styles.optionDescription}>
                    {description}
                </Text>
            </View>
            {selected && <Feather name="check-circle" size={22} color={Colors.secondary} />}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary,
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
        marginBottom: 12,
        borderRadius: 15,
        borderWidth: 1,
    },
    optionContent: {
        flex: 1,
    },
    optionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 5,
    },
    optionTitle: {
        fontFamily: FONTS.semibold,
    },
    optionDescription: {
        marginLeft: 28,
    },
    calendarContainer: {
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 15,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: Colors.primary_lighter,
    },
    actionContainer: {
        padding: 15,
        paddingBottom: 40,
    },
    copyButton: {
        borderRadius: 100,
    },
})
