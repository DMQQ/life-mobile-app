import { BottomSheetGorhom } from "@/components/ui/BottomSheet/BottomSheet"
import SegmentedButtons from "@/components/ui/SegmentedButtons"
import Input from "@/components/ui/TextInput/TextInput"
import DatePicker from "@/components/DatePicker"
import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import { AntDesign, MaterialIcons, Ionicons } from "@expo/vector-icons"
import BottomSheetType, { BottomSheetView, BottomSheetBackdrop } from "@gorhom/bottom-sheet"
import { forwardRef, memo, useCallback } from "react"
import { StyleSheet, View, useWindowDimensions } from "react-native"
import Ripple from "react-native-material-ripple"
import Text from "@/components/ui/Text/Text"
import dayjs from "dayjs"

const styles = StyleSheet.create({
    arrow_button: {
        backgroundColor: Colors.primary_lighter,
        justifyContent: "center",
        alignItems: "center",
        padding: 4,
        borderRadius: 4,
    },
    modal_container: {
        padding: 16,
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 18,
    },
    clear_button: {
        backgroundColor: Colors.primary_lighter,
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 6,
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    section: {
        marginBottom: 14,
    },
    sectionLabel: {
        marginBottom: 6,
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
})

interface CreateRepeatableTimelineProps {
    formik: any
}

const ArrowButton = (props: { onPress: () => void; arrow: "arrow-up" | "arrow-down"; disabled?: boolean }) => (
    <Ripple
        disabled={props.disabled || false}
        onPress={() => props.onPress()}
        style={[styles.arrow_button, { opacity: props.disabled ? 0.5 : 1 }]}
    >
        <AntDesign name={props.arrow} size={18} color={props.arrow === "arrow-up" ? Colors.secondary : Colors.error} />
    </Ripple>
)

const REPEAT_TYPES = [
    { text: "Daily", value: "DAILY" },
    { text: "Weekly", value: "WEEKLY" },
    { text: "Monthly", value: "MONTHLY" },
]

const DAYS_OF_WEEK = [
    { text: "S", value: 0 },
    { text: "M", value: 1 },
    { text: "T", value: 2 },
    { text: "W", value: 3 },
    { text: "T", value: 4 },
    { text: "F", value: 5 },
    { text: "S", value: 6 },
]

const REMINDER_PRESETS = [
    { text: "Off", value: "" },
    { text: "5m", value: "5" },
    { text: "15m", value: "15" },
    { text: "30m", value: "30" },
    { text: "1h", value: "60" },
]

const intervalLabel = (type: string) => {
    if (type === "MONTHLY") return "months"
    if (type === "WEEKLY") return "weeks"
    return "days"
}

const CreateRepeatableTimeline = forwardRef<BottomSheetType, CreateRepeatableTimelineProps>(({ formik: f }, ref) => {
    const { height } = useWindowDimensions()

    const snapPoints = [height * 0.55]

    const onClearFields = () => {
        f.setFieldValue("repeatType", "")
        f.setFieldValue("repeatDaysOfWeek", [])
        f.setFieldValue("repeatInterval", "1")
        f.setFieldValue("repeatCount", "")
        f.setFieldValue("repeatUntil", "")
        f.setFieldValue("reminderBeforeMinutes", "")
        f.setFieldValue("repeatOn", "")
        f.setFieldValue("repeatEveryNth", "")
    }

    const intervalButtons = new Array(7).fill(0).map((_, i) => ({
        text: `${i + 1}`,
        value: `${i + 1}`,
    }))

    const onArrowUpPress = () => {
        f.setFieldValue("repeatCount", String(Number(f.values.repeatCount || 0) + 1))
    }

    const onArrowDownPress = () => {
        if (Number(f.values.repeatCount || 0) - 1 < 0) return
        f.setFieldValue("repeatCount", String(Number(f.values.repeatCount || 0) - 1))
    }

    const toggleDayOfWeek = (day: number) => {
        const current: number[] = f.values.repeatDaysOfWeek || []
        if (current.includes(day)) {
            f.setFieldValue("repeatDaysOfWeek", current.filter((d) => d !== day))
        } else {
            f.setFieldValue("repeatDaysOfWeek", [...current, day])
        }
    }

    const repeatUntilDate = f.values.repeatUntil
        ? {
              start: dayjs(f.values.repeatUntil).toDate(),
              end: dayjs(f.values.repeatUntil).toDate(),
          }
        : {
              start: new Date(),
              end: new Date(),
          }

    const renderBackdrop = useCallback(
        (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
        [],
    )

    return (
        <BottomSheetGorhom
            ref={ref}
            index={-1}
            snapPoints={snapPoints}
            enablePanDownToClose={true}
            backdropComponent={renderBackdrop}
            handleIndicatorStyle={{ backgroundColor: Colors.foreground_secondary }}
            handleStyle={{ backgroundColor: Colors.primary }}
            style={{ backgroundColor: Colors.primary }}
            backgroundStyle={{ backgroundColor: Colors.primary }}
        >
            <BottomSheetView style={{ flex: 1, backgroundColor: Colors.primary }}>
                <View style={styles.modal_container}>
                    <View style={styles.header}>
                        <Text variant="subheading" style={{ fontWeight: "700" }}>
                            Repeat Options
                        </Text>
                        <Ripple onPress={onClearFields} style={styles.clear_button}>
                            <AntDesign name="close" size={14} color={Colors.secondary} />
                            <Text variant="caption" style={{ fontWeight: "700", color: Colors.secondary }}>
                                CLEAR
                            </Text>
                        </Ripple>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionLabel}>
                            <MaterialIcons name="repeat" size={16} color={Colors.secondary} />
                            <Text variant="body" color={Colors.secondary} style={{ fontWeight: "700" }}>
                                Repeat type
                            </Text>
                        </View>
                        <SegmentedButtons
                            value={f.values.repeatType}
                            onChange={(value) => f.setFieldValue("repeatType", value)}
                            buttons={REPEAT_TYPES}
                            buttonStyle={{ height: 36 }}
                            buttonTextStyle={{ fontSize: 13 }}
                            containerStyle={{ borderRadius: 8 }}
                        />
                    </View>

                    {f.values.repeatType === "WEEKLY" && (
                        <View style={styles.section}>
                            <View style={styles.sectionLabel}>
                                <Ionicons name="today-outline" size={16} color={Colors.secondary} />
                                <Text variant="body" color={Colors.secondary} style={{ fontWeight: "700" }}>
                                    Days of week
                                </Text>
                            </View>
                            <View style={{ flexDirection: "row", gap: 6 }}>
                                {DAYS_OF_WEEK.map((day) => {
                                    const isSelected = (f.values.repeatDaysOfWeek || []).includes(day.value)
                                    return (
                                        <Ripple
                                            key={day.value}
                                            onPress={() => toggleDayOfWeek(day.value)}
                                            style={{
                                                backgroundColor: isSelected ? Colors.secondary : Colors.primary_lighter,
                                                width: 36,
                                                height: 36,
                                                borderRadius: 18,
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Text
                                                variant="caption"
                                                style={{
                                                    color: isSelected ? "#fff" : Colors.foreground_secondary,
                                                    fontWeight: "600",
                                                }}
                                            >
                                                {day.text}
                                            </Text>
                                        </Ripple>
                                    )
                                })}
                            </View>
                        </View>
                    )}

                    <View style={styles.section}>
                        <View style={styles.sectionLabel}>
                            <MaterialIcons name="loop" size={16} color={Colors.secondary} />
                            <Text variant="body" color={Colors.secondary} style={{ fontWeight: "700" }}>
                                Every {intervalLabel(f.values.repeatType)}
                            </Text>
                        </View>
                        <SegmentedButtons
                            value={f.values.repeatInterval || "1"}
                            onChange={(value) => f.setFieldValue("repeatInterval", value)}
                            buttons={intervalButtons}
                            buttonStyle={{ height: 36 }}
                            buttonTextStyle={{ fontSize: 13 }}
                            containerStyle={{ borderRadius: 8 }}
                        />
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionLabel}>
                            <AntDesign name="bars" size={16} color={Colors.secondary} />
                            <Text variant="body" color={Colors.secondary} style={{ fontWeight: "700" }}>
                                Number of occurrences
                            </Text>
                        </View>
                        <Input
                            keyboardType="numeric"
                            style={{ flex: 1, width: Layout.screen.width - 32 }}
                            value={f.values.repeatCount}
                            onChangeText={(t) => f.setFieldValue("repeatCount", t)}
                            placeholder="e.g. 10"
                            placeholderTextColor={Colors.foreground_secondary}
                            left={
                                <ArrowButton
                                    disabled={Number(f.values.repeatCount || 0) <= 0 || f.values.repeatCount === ""}
                                    arrow="arrow-down"
                                    onPress={onArrowDownPress}
                                />
                            }
                            right={<ArrowButton arrow="arrow-up" onPress={onArrowUpPress} />}
                        />
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionLabel}>
                            <AntDesign name="calendar" size={16} color={Colors.secondary} />
                            <Text variant="body" color={Colors.secondary} style={{ fontWeight: "700" }}>
                                Repeat until
                            </Text>
                        </View>
                        <DatePicker
                            mode="single"
                            dates={repeatUntilDate}
                            setDates={({ start }) => f.setFieldValue("repeatUntil", dayjs(start).format("YYYY-MM-DD"))}
                            buttonComponent={({ start }) => (
                                <View
                                    style={{
                                        backgroundColor: Colors.primary_lighter,
                                        borderRadius: 8,
                                        paddingVertical: 10,
                                        paddingHorizontal: 14,
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 8,
                                    }}
                                >
                                    <AntDesign name="calendar" size={16} color={Colors.secondary} />
                                    <Text
                                        variant="body"
                                        color={f.values.repeatUntil ? Colors.foreground : Colors.foreground_secondary}
                                    >
                                        {f.values.repeatUntil
                                            ? dayjs(f.values.repeatUntil).format("MMM D, YYYY")
                                            : "Select end date"}
                                    </Text>
                                </View>
                            )}
                        />
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionLabel}>
                            <Ionicons name="notifications-outline" size={16} color={Colors.secondary} />
                            <Text variant="body" color={Colors.secondary} style={{ fontWeight: "700" }}>
                                Reminder
                            </Text>
                        </View>
                        <SegmentedButtons
                            value={String(f.values.reminderBeforeMinutes || "")}
                            onChange={(value) => f.setFieldValue("reminderBeforeMinutes", value)}
                            buttons={REMINDER_PRESETS}
                            buttonStyle={{ height: 36 }}
                            buttonTextStyle={{ fontSize: 13 }}
                            containerStyle={{ borderRadius: 8 }}
                        />
                    </View>
                </View>
            </BottomSheetView>
        </BottomSheetGorhom>
    )
})

export default memo(CreateRepeatableTimeline)
