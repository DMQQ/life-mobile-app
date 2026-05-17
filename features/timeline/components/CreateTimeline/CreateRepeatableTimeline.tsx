import DatePicker from "@/components/DatePicker"
import GroupSelector from "@/components/ui/GroupSelector"
import Section from "@/components/ui/Section"
import Input from "@/components/ui/TextInput/TextInput"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import { Feather } from "@expo/vector-icons"
import dayjs from "dayjs"
import { StyleSheet, View } from "react-native"
import Ripple from "react-native-material-ripple"

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

const intervalButtons = new Array(7).fill(0).map((_, i) => ({ label: `${i + 1}`, value: `${i + 1}` }))

const ArrowButton = ({
    onPress,
    direction,
    disabled,
}: {
    onPress: () => void
    direction: "up" | "down"
    disabled?: boolean
}) => (
    <Ripple
        disabled={disabled}
        onPress={onPress}
        style={[styles.arrowButton, { opacity: disabled ? 0.5 : 1 }]}
    >
        <Feather
            name={direction === "up" ? "chevron-up" : "chevron-down"}
            size={18}
            color={direction === "up" ? Colors.secondary : Colors.error}
        />
    </Ripple>
)

export default function CreateRepeatableTimeline({ formik: f }: CreateRepeatableTimelineProps) {
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
                <View style={styles.selectorWrap}>
                    <GroupSelector
                        value={f.values.repeatType || ""}
                        onChange={(value) => f.setFieldValue("repeatType", value)}
                        options={REPEAT_TYPES}
                    />
                </View>
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
                                                        backgroundColor: isSelected
                                                            ? Colors.secondary
                                                            : Colors.primary,
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
                    <View style={styles.row}>
                        <Text variant="subtitle">Every ({intervalLabel(f.values.repeatType)})</Text>
                        <View style={styles.selectorWrap}>
                            <GroupSelector
                                value={f.values.repeatInterval || "1"}
                                onChange={(value) => f.setFieldValue("repeatInterval", value)}
                                options={intervalButtons}
                            />
                        </View>
                    </View>

                    <View style={styles.divider} />
                    <Input
                        keyboardType="numeric"
                        style={{ flex: 1, width: Layout.screen.width - 32 }}
                        value={f.values.repeatCount}
                        onChangeText={(t: string) => f.setFieldValue("repeatCount", t)}
                        placeholder="Occurrences (e.g. 10)"
                        placeholderTextColor={Colors.foreground_secondary}
                        left={
                            <ArrowButton
                                disabled={Number(f.values.repeatCount || 0) <= 0 || f.values.repeatCount === ""}
                                direction="down"
                                onPress={() =>
                                    f.setFieldValue(
                                        "repeatCount",
                                        String(Math.max(0, Number(f.values.repeatCount || 0) - 1)),
                                    )
                                }
                            />
                        }
                        right={
                            <ArrowButton
                                direction="up"
                                onPress={() =>
                                    f.setFieldValue(
                                        "repeatCount",
                                        String(Number(f.values.repeatCount || 0) + 1),
                                    )
                                }
                            />
                        }
                    />

                    <View style={styles.divider} />
                    <View style={styles.row}>
                        <Text variant="subtitle">Until</Text>
                        <DatePicker
                            mode="single"
                            placeholder={
                                f.values.repeatUntil
                                    ? dayjs(f.values.repeatUntil).format("MMM D, YYYY")
                                    : "Select end date"
                            }
                            dates={{ start: repeatUntilDate, end: repeatUntilDate }}
                            setDates={({ start }) =>
                                f.setFieldValue("repeatUntil", dayjs(start).format("YYYY-MM-DD"))
                            }
                        />
                    </View>
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
    selectorWrap: {
        width: 210,
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
    arrowButton: {
        backgroundColor: Colors.primary,
        justifyContent: "center",
        alignItems: "center",
        padding: 4,
        borderRadius: 4,
    },
})
