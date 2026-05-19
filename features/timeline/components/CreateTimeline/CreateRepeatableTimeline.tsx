import Section from "@/components/ui/Section"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import { Feather } from "@expo/vector-icons"
import dayjs from "dayjs"
import { useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"
import Ripple from "react-native-material-ripple"
import { Host, DatePicker as SwiftDatePicker, Menu, Button, Picker, Text as SwiftText } from "@expo/ui/swift-ui"
import { datePickerStyle, frame, pickerStyle, tag } from "@expo/ui/swift-ui/modifiers"

interface CreateRepeatableTimelineProps {
    formik: any
}

const REPEAT_TYPES = [
    { label: "Off", value: "" },
    { label: "Daily", value: "DAILY" },
    { label: "Weekly", value: "WEEKLY" },
    { label: "Monthly", value: "MONTHLY" },
]

const DAYS_OF_WEEK = [
    { label: "S", value: 0 },
    { label: "M", value: 1 },
    { label: "T", value: 2 },
    { label: "W", value: 3 },
    { label: "T", value: 4 },
    { label: "F", value: 5 },
    { label: "S", value: 6 },
]

const intervalLabel = (type: string) => {
    if (type === "MONTHLY") return "months"
    if (type === "WEEKLY") return "weeks"
    return "days"
}

const getIntervalOptions = (type: string) => {
    const max = type === "MONTHLY" ? 12 : type === "WEEKLY" ? 5 : 30
    return new Array(max).fill(0).map((_, i) => ({ label: `${i + 1}`, value: `${i + 1}` }))
}

export default function CreateRepeatableTimeline({ formik: f }: CreateRepeatableTimelineProps) {
    const [untilExpanded, setUntilExpanded] = useState(false)
    const [everyExpanded, setEveryExpanded] = useState(false)

    const toggleDayOfWeek = (day: number) => {
        const current: number[] = f.values.repeatDaysOfWeek || []
        f.setFieldValue(
            "repeatDaysOfWeek",
            current.includes(day) ? current.filter((d: number) => d !== day) : [...current, day],
        )
    }

    const repeatUntilDate = f.values.repeatUntil ? dayjs(f.values.repeatUntil).toDate() : new Date()

    return (
        <Section title="Repeat">
            <View style={styles.row}>
                <Text variant="subtitle">Type</Text>
                <Host style={{ height: 35 }}>
                    <Menu
                        label={
                            <View style={styles.menuPill}>
                                <Feather name="repeat" size={13} color={Colors.foreground_secondary} />
                                <Text variant="caption" style={styles.menuPillText}>
                                    {REPEAT_TYPES.find((t) => t.value === f.values.repeatType)?.label ?? "Off"}
                                </Text>
                            </View>
                        }
                    >
                        {REPEAT_TYPES.map((opt) => (
                            <Button
                                key={opt.value}
                                label={opt.label}
                                onPress={() => f.setFieldValue("repeatType", opt.value)}
                            />
                        ))}
                    </Menu>
                </Host>
            </View>

            {!!f.values.repeatType && (
                <>
                    {f.values.repeatType === "WEEKLY" && (
                        <>
                            <View style={styles.divider} />
                            <View style={[styles.row, { paddingVertical: 12 }]}>
                                <Text variant="subtitle">Days</Text>
                                <View style={styles.daysRow}>
                                    {DAYS_OF_WEEK.map((day) => {
                                        const isSelected = (f.values.repeatDaysOfWeek || []).includes(day.value)
                                        return (
                                            <Ripple
                                                key={day.value}
                                                onPress={() => toggleDayOfWeek(day.value)}
                                                style={[
                                                    styles.dayPill,
                                                    {
                                                        backgroundColor: isSelected ? Colors.secondary : Colors.primary,
                                                    },
                                                ]}
                                            >
                                                <Text
                                                    variant="caption"
                                                    style={{
                                                        color: isSelected ? "#fff" : Colors.foreground_secondary,
                                                        fontWeight: "600",
                                                    }}
                                                >
                                                    {day.label}
                                                </Text>
                                            </Ripple>
                                        )
                                    })}
                                </View>
                            </View>
                        </>
                    )}

                    <View style={styles.divider} />
                    <Pressable
                        onPress={() => setEveryExpanded((p) => !p)}
                        style={styles.row}
                    >
                        <Text variant="subtitle">Every ({intervalLabel(f.values.repeatType)})</Text>
                        <Text variant="body" style={{ color: Colors.foreground }}>
                            {f.values.repeatInterval || "1"}
                        </Text>
                    </Pressable>
                    {everyExpanded && (
                        <View style={{ alignItems: "center", paddingBottom: 12 }}>
                            <Host style={{ height: 180, width: 100 }}>
                                <Picker
                                    selection={f.values.repeatInterval || "1"}
                                    onSelectionChange={(value) => f.setFieldValue("repeatInterval", value)}
                                    modifiers={[pickerStyle("wheel")]}
                                >
                                    {getIntervalOptions(f.values.repeatType).map((opt) => (
                                        <SwiftText key={opt.value} modifiers={[tag(opt.value)]}>
                                            {opt.label}
                                        </SwiftText>
                                    ))}
                                </Picker>
                            </Host>
                        </View>
                    )}

                    <View style={styles.divider} />
                    <View style={styles.row}>
                        <Text variant="subtitle">Occurrences</Text>
                        <View style={styles.stepper}>
                            <Ripple
                                disabled={Number(f.values.repeatCount || 0) <= 0 || f.values.repeatCount === ""}
                                onPress={() =>
                                    f.setFieldValue(
                                        "repeatCount",
                                        String(Math.max(0, Number(f.values.repeatCount || 0) - 1)),
                                    )
                                }
                                style={[styles.stepperBtn, { opacity: Number(f.values.repeatCount || 0) <= 0 || f.values.repeatCount === "" ? 0.3 : 1 }]}
                            >
                                <Feather name="minus" size={16} color={Colors.foreground} />
                            </Ripple>
                            <Text variant="body" style={{ color: Colors.foreground, minWidth: 24, textAlign: "center", fontWeight: "600" }}>
                                {f.values.repeatCount || "0"}
                            </Text>
                            <Ripple
                                onPress={() =>
                                    f.setFieldValue("repeatCount", String(Number(f.values.repeatCount || 0) + 1))
                                }
                                style={styles.stepperBtn}
                            >
                                <Feather name="plus" size={16} color={Colors.foreground} />
                            </Ripple>
                        </View>
                    </View>

                    <View style={styles.divider} />
                    <Pressable onPress={() => setUntilExpanded((p) => !p)} style={styles.row}>
                        <Text variant="subtitle">Until</Text>
                        <Text variant="body" style={{ color: Colors.foreground }}>
                            {f.values.repeatUntil
                                ? dayjs(f.values.repeatUntil).format("DD MMMM YYYY")
                                : "Select end date"}
                        </Text>
                    </Pressable>
                    {untilExpanded && (
                        <View style={{ alignItems: "center", paddingHorizontal: 10, paddingBottom: 15 }}>
                            <Host matchContents>
                                <SwiftDatePicker
                                    selection={repeatUntilDate}
                                    onDateChange={(d) => {
                                        f.setFieldValue("repeatUntil", dayjs(d).format("YYYY-MM-DD"))
                                        setUntilExpanded(false)
                                    }}
                                    modifiers={[datePickerStyle("graphical"), frame({ width: 340 })]}
                                />
                            </Host>
                        </View>
                    )}
                </>
            )}
        </Section>
    )
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        width: "100%",
        paddingHorizontal: 15,
        paddingVertical: 10,
        alignItems: "center",
        justifyContent: "space-between",
    },
    divider: {
        borderWidth: 0.5,
        borderColor: Colors.borderColor,
    },
    daysRow: {
        flexDirection: "row",
        gap: 6,
    },
    dayPill: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: "center",
        justifyContent: "center",
    },
    stepper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.primary_light,
        borderRadius: 100,
        paddingHorizontal: 12,
        paddingVertical: 6,
        gap: 8,
    },
    stepperBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: Colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    menuPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: Colors.primary_light,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 100,
    },
    menuPillText: {
        color: Colors.foreground,
        fontWeight: "600",
    },
})
