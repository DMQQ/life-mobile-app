import { Feather } from "@expo/vector-icons"
import { Formik, FormikProps } from "formik"
import { memo, useCallback, useMemo, useState } from "react"
import { ActionSheetIOS, ScrollView, StyleSheet, Switch, TextInput, TouchableOpacity, View } from "react-native"
import { DatePicker, Host } from "@expo/ui/swift-ui"
import * as yup from "yup"
import ValidatedInput from "@/components/ui/ValidatedInput"
import ModalHeader from "@/components/ui/ModalHeader"
import GroupSelector from "@/components/ui/GroupSelector"
import SectionCard from "@/components/ui/Section"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import Ripple from "react-native-material-ripple"
import { useGoal, useGetGoal } from "../hooks/hooks"

function timeStringToDate(t: string): Date {
    const [h, m] = t.split(":").map(Number)
    const d = new Date()
    d.setHours(h, m, 0, 0)
    return d
}

function dateToTimeString(d: Date): string {
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

interface NotificationSettings {
    frequency: "specific_times" | "interval"
    times: Date[]
    intervalHours: number
    daysOfWeek: number[]
    reminderMessage: string
    notifyOnCompletion: boolean
    notifyBeforeDeadline: boolean
}

interface FormValues {
    name: string
    icon: string
    goalType: "REACH" | "LIMIT"
    target: number
    unit: string
    color: string
    notification: boolean
    notificationSettings: NotificationSettings
}

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
    frequency: "specific_times",
    times: [timeStringToDate("08:00"), timeStringToDate("20:00")],
    intervalHours: 4,
    daysOfWeek: [1, 2, 3, 4, 5],
    reminderMessage: "",
    notifyOnCompletion: false,
    notifyBeforeDeadline: false,
}

const validationSchema = yup.object().shape({
    name: yup.string().required("Goal name is required"),
    icon: yup.string().required("Icon is required"),
    goalType: yup.string().oneOf(["REACH", "LIMIT"]).required(),
    target: yup.number().min(1, "Must be at least 1").required(),
    unit: yup.string().optional(),
    color: yup.string().optional(),
    notification: yup.boolean().optional(),
})

const UNIT_CONFIG: Record<string, { label: string; max: number; step: number }> = {
    min: { label: "minutes", max: 480, step: 5 },
    hours: { label: "hours", max: 24, step: 1 },
    km: { label: "kilometers", max: 42, step: 1 },
    miles: { label: "miles", max: 26, step: 1 },
    steps: { label: "steps", max: 50000, step: 500 },
    pages: { label: "pages", max: 500, step: 5 },
    reps: { label: "reps", max: 100, step: 1 },
    sets: { label: "sets", max: 20, step: 1 },
    cups: { label: "cups", max: 12, step: 1 },
    glasses: { label: "glasses", max: 12, step: 1 },
    liters: { label: "liters", max: 5, step: 1 },
    ml: { label: "milliliters", max: 3000, step: 50 },
    kg: { label: "kilograms", max: 200, step: 1 },
    lbs: { label: "pounds", max: 440, step: 5 },
    cal: { label: "calories", max: 5000, step: 50 },
    tasks: { label: "tasks", max: 50, step: 1 },
    sessions: { label: "sessions", max: 10, step: 1 },
    times: { label: "times", max: 50, step: 1 },
}

const PRESET_COLORS = [
    "#6366f1", "#8b5cf6", "#a855f7", "#ec4899",
    "#ef4444", "#f97316", "#eab308", "#22c55e",
    "#14b8a6", "#3b82f6", "#06b6d4", "#64748b",
]

const GOAL_TYPE_OPTIONS = [
    { label: "Reach Target", value: "REACH" as const },
    { label: "Stay Under Limit", value: "LIMIT" as const },
]

const FREQUENCY_OPTIONS = [
    { label: "Specific Times", value: "specific_times" as const },
    { label: "Interval", value: "interval" as const },
]

const DAYS = ["S", "M", "T", "W", "T", "F", "S"]

const GoalValuePicker = memo(function GoalValuePicker({
    unit,
    goalType,
    target,
    onChange,
}: {
    unit: string
    goalType: "REACH" | "LIMIT"
    target: number
    onChange: (v: number) => void
}) {
    const cfg = UNIT_CONFIG[unit]
    const max = cfg?.max ?? (goalType === "LIMIT" ? 24 : 100)
    const step = cfg?.step ?? 1
    const unitLabel = cfg?.label || unit

    const decrement = useCallback(() => onChange(Math.max(step, target - step)), [target, step, onChange])
    const increment = useCallback(() => onChange(Math.min(max, target + step)), [target, step, max, onChange])

    return (
        <View style={s.stepper}>
            <TouchableOpacity style={s.stepBtn} onPress={decrement} activeOpacity={0.7}>
                <Feather name="minus" size={22} color={Colors.foreground} />
            </TouchableOpacity>
            <View style={s.stepValue}>
                <Text variant="subheading" style={{ fontWeight: "700" }}>
                    {String(target)}
                </Text>
                {unitLabel ? (
                    <Text variant="caption" style={s.dimText}>
                        {unitLabel}
                    </Text>
                ) : null}
            </View>
            <TouchableOpacity style={s.stepBtn} onPress={increment} activeOpacity={0.7}>
                <Feather name="plus" size={22} color={Colors.foreground} />
            </TouchableOpacity>
        </View>
    )
})

function TimePicker({ value, onChange }: { value: Date; onChange: (d: Date) => void }) {
    const [time, setTime] = useState(value)
    return (
        <Host style={s.timePickerHost}>
            <DatePicker
                displayedComponents={["hourAndMinute"]}
                selection={time}
                onDateChange={(d) => {
                    setTime(d)
                    onChange(d)
                }}
            />
        </Host>
    )
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
    return (
        <View style={s.toggleRow}>
            <Text variant="caption" style={s.dimText}>
                {label}
            </Text>
            <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{ false: Colors.primary_lighter, true: Colors.secondary }}
                thumbColor={Colors.foreground}
            />
        </View>
    )
}

export default function CreateGoal({ route, navigation }: any) {
    const editId = route.params?.id as string | undefined
    const isEdit = !!editId

    const { createGoals, updateGoals } = useGoal()
    const { data: editData } = useGetGoal(editId || "")
    const goal = editData?.goal

    const initialValues = useMemo<FormValues>(() => {
        if (isEdit && goal) {
            return {
                name: goal.name || "",
                icon: goal.icon || "",
                goalType: goal.min === 1 ? "LIMIT" : "REACH",
                target: goal.target || 1,
                unit: goal.unit || "",
                color: goal.color || "#6366f1",
                notification: goal.notification ?? false,
                notificationSettings: {
                    frequency: (goal.notificationSettings?.frequency as any) || "specific_times",
                    times: ((goal.notificationSettings?.times?.filter(Boolean) ?? ["08:00", "20:00"]) as string[]).map(timeStringToDate),
                    intervalHours: goal.notificationSettings?.intervalHours || 4,
                    daysOfWeek: goal.notificationSettings?.daysOfWeek || [1, 2, 3, 4, 5],
                    reminderMessage: goal.notificationSettings?.reminderMessage || "",
                    notifyOnCompletion: goal.notificationSettings?.notifyOnCompletion ?? false,
                    notifyBeforeDeadline: goal.notificationSettings?.notifyBeforeDeadline ?? false,
                },
            }
        }
        return {
            name: "",
            icon: "",
            goalType: "REACH",
            target: 1,
            unit: "",
            color: "#6366f1",
            notification: false,
            notificationSettings: DEFAULT_NOTIFICATION_SETTINGS,
        }
    }, [isEdit, goal])

    const onSubmit = (values: FormValues) => {
        const notifSettings = values.notification
            ? {
                  frequency: values.notificationSettings.frequency,
                  times:
                      values.notificationSettings.frequency === "specific_times"
                          ? values.notificationSettings.times.map(dateToTimeString)
                          : undefined,
                  intervalHours:
                      values.notificationSettings.frequency === "interval"
                          ? values.notificationSettings.intervalHours
                          : undefined,
                  daysOfWeek: values.notificationSettings.daysOfWeek,
                  reminderMessage: values.notificationSettings.reminderMessage || undefined,
                  notifyOnCompletion: values.notificationSettings.notifyOnCompletion,
                  notifyBeforeDeadline: values.notificationSettings.notifyBeforeDeadline,
              }
            : undefined

        if (isEdit && editId) {
            updateGoals({
                variables: {
                    id: editId,
                    input: {
                        name: values.name,
                        icon: values.icon,
                        description: "",
                        min: values.goalType === "LIMIT" ? 1 : 0,
                        max: values.target * 2,
                        target: values.target,
                        color: values.color,
                        notification: values.notification,
                        notificationSettings: notifSettings,
                    },
                },
                onCompleted: () => navigation.goBack(),
            })
        } else {
            createGoals({
                variables: {
                    input: {
                        name: values.name,
                        icon: values.icon,
                        description: "",
                        min: values.goalType === "LIMIT" ? 1 : 0,
                        max: values.target * 2,
                        target: values.target,
                        unit: values.unit,
                        color: values.color,
                        notification: values.notification,
                        notificationSettings: notifSettings,
                    },
                },
                onCompleted: () => navigation.goBack(),
            })
        }
    }

    return (
        <Formik<FormValues>
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            initialValues={initialValues}
            enableReinitialize
        >
            {(f: FormikProps<FormValues>) => {
                const showUnitSheet = () => {
                    const keys = Object.keys(UNIT_CONFIG)
                    const labels = keys.map((k) => UNIT_CONFIG[k].label)
                    ActionSheetIOS.showActionSheetWithOptions(
                        { options: ["Cancel", ...labels], cancelButtonIndex: 0 },
                        (i) => {
                            if (i > 0) f.setFieldValue("unit", keys[i - 1])
                        },
                    )
                }

                return (
                    <View style={s.container}>
                        <ModalHeader
                            onClose={() => navigation.goBack()}
                            onSave={f.handleSubmit}
                            title={isEdit ? "Edit Goal" : "New Goal"}
                            saveLabel="Save"
                            dirty={f.dirty}
                        />

                        <ScrollView
                            style={s.scroll}
                            contentContainerStyle={s.scrollContent}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={s.iconRow}>
                                <Ripple
                                    style={[s.iconButton, { backgroundColor: f.values.color }]}
                                    onPress={() =>
                                        navigation.navigate("IconPicker", {
                                            onSelectIcon: (icon: string) => f.setFieldValue("icon", icon),
                                            selectedIcon: f.values.icon,
                                        })
                                    }
                                >
                                    <Feather name={(f.values.icon || "plus-circle") as any} size={36} color="#fff" />
                                </Ripple>
                                <Text variant="caption" style={s.dimText}>
                                    {f.values.icon ? "Tap to change icon" : "Tap to choose an icon"}
                                </Text>
                            </View>

                            <SectionCard title="Goal" noGap>
                                <ValidatedInput
                                    showLabel={false}
                                    label="Name"
                                    name="name"
                                    placeholder="What do you want to track?"
                                    formik={f}
                                />
                            </SectionCard>

                            <SectionCard title="Goal Type">
                                <View style={s.cardPad}>
                                    <GroupSelector
                                        options={GOAL_TYPE_OPTIONS}
                                        value={f.values.goalType}
                                        onChange={(v) => f.setFieldValue("goalType", v)}
                                    />
                                    <Text variant="caption" style={[s.dimText, { marginTop: 10 }]}>
                                        {f.values.goalType === "REACH"
                                            ? "Green when you meet or exceed your target."
                                            : "Green when you stay under your limit. Red if exceeded."}
                                    </Text>
                                </View>
                            </SectionCard>

                            <SectionCard title="Value">
                                <View style={[s.cardPad, s.unitRow]}>
                                    <Text variant="caption" style={s.rowLabel}>
                                        Unit
                                    </Text>
                                    {isEdit ? (
                                        <View style={s.unitReadonly}>
                                            <Text variant="caption" style={s.dimText}>
                                                {f.values.unit ? UNIT_CONFIG[f.values.unit]?.label || f.values.unit : "—"}
                                            </Text>
                                        </View>
                                    ) : (
                                        <TouchableOpacity style={s.unitBtn} onPress={showUnitSheet} activeOpacity={0.7}>
                                            <Text variant="caption" style={f.values.unit ? s.unitBtnText : s.dimText}>
                                                {f.values.unit
                                                    ? UNIT_CONFIG[f.values.unit]?.label || f.values.unit
                                                    : "Select unit"}
                                            </Text>
                                            <Feather name="chevron-down" size={14} color={Colors.foreground_secondary} />
                                        </TouchableOpacity>
                                    )}
                                </View>

                                <View style={s.divider} />

                                <View style={s.pickerWrap}>
                                    <GoalValuePicker
                                        unit={f.values.unit}
                                        goalType={f.values.goalType}
                                        target={f.values.target}
                                        onChange={(v) => f.setFieldValue("target", v)}
                                    />
                                </View>
                            </SectionCard>

                            <SectionCard title="Color">
                                <View style={s.colorGrid}>
                                    {PRESET_COLORS.map((c) => (
                                        <TouchableOpacity
                                            key={c}
                                            style={[
                                                s.colorSwatch,
                                                { backgroundColor: c },
                                                f.values.color === c && s.colorSwatchActive,
                                            ]}
                                            onPress={() => f.setFieldValue("color", c)}
                                            activeOpacity={0.8}
                                        >
                                            {f.values.color === c && (
                                                <Feather name="check" size={16} color="#fff" />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </SectionCard>

                            <SectionCard
                                title="Notifications"
                                headerRight={
                                    <Switch
                                        value={f.values.notification}
                                        onValueChange={(v) => { f.setFieldValue("notification", v) }}
                                        trackColor={{ false: Colors.primary_lighter, true: Colors.secondary }}
                                        thumbColor={Colors.foreground}
                                    />
                                }
                            >
                                {f.values.notification ? (
                                    <View>
                                        <View style={s.notifRow}>
                                            <Text variant="caption" style={s.rowLabel}>
                                                Frequency
                                            </Text>
                                            <GroupSelector
                                                options={FREQUENCY_OPTIONS}
                                                value={f.values.notificationSettings.frequency}
                                                onChange={(v) => f.setFieldValue("notificationSettings.frequency", v)}
                                            />
                                        </View>

                                        <View style={s.divider} />

                                        {f.values.notificationSettings.frequency === "specific_times" ? (
                                            <View style={s.notifRow}>
                                                <Text variant="caption" style={s.rowLabel}>
                                                    Times
                                                </Text>
                                                <View style={s.timesWrapper}>
                                                    {f.values.notificationSettings.times.map((t, i) => (
                                                        <View key={i} style={s.timeCard}>
                                                            <Text variant="caption" style={s.dimText}>
                                                                Time {i + 1}
                                                            </Text>
                                                            <View style={s.timeCardRight}>
                                                                <TimePicker
                                                                    value={t}
                                                                    onChange={(d) => {
                                                                        const next = [...f.values.notificationSettings.times]
                                                                        next[i] = d
                                                                        f.setFieldValue("notificationSettings.times", next)
                                                                    }}
                                                                />
                                                                <TouchableOpacity
                                                                    onPress={() => {
                                                                        const next = [...f.values.notificationSettings.times]
                                                                        next.splice(i, 1)
                                                                        f.setFieldValue("notificationSettings.times", next)
                                                                    }}
                                                                >
                                                                    <Feather name="x-circle" size={18} color={Colors.foreground_secondary} />
                                                                </TouchableOpacity>
                                                            </View>
                                                        </View>
                                                    ))}
                                                    <TouchableOpacity
                                                        style={s.addTimeRow}
                                                        onPress={() =>
                                                            f.setFieldValue("notificationSettings.times", [
                                                                ...f.values.notificationSettings.times,
                                                                timeStringToDate("08:00"),
                                                            ])
                                                        }
                                                    >
                                                        <Feather name="plus-circle" size={16} color={Colors.secondary} />
                                                        <Text variant="caption" style={{ color: Colors.secondary }}>
                                                            Add Time
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        ) : (
                                            <View style={s.notifRow}>
                                                <Text variant="caption" style={s.rowLabel}>
                                                    Every (hrs)
                                                </Text>
                                                <TextInput
                                                    style={s.intervalInput}
                                                    value={String(f.values.notificationSettings.intervalHours)}
                                                    onChangeText={(v) =>
                                                        f.setFieldValue(
                                                            "notificationSettings.intervalHours",
                                                            parseInt(v) || 1,
                                                        )
                                                    }
                                                    keyboardType="number-pad"
                                                    placeholderTextColor={Colors.text_dark}
                                                />
                                            </View>
                                        )}

                                        <View style={s.divider} />

                                        <View style={s.notifRow}>
                                            <Text variant="caption" style={s.rowLabel}>
                                                Days
                                            </Text>
                                            <View style={s.daysRow}>
                                                {DAYS.map((d, i) => {
                                                    const active = f.values.notificationSettings.daysOfWeek.includes(i)
                                                    return (
                                                        <TouchableOpacity
                                                            key={i}
                                                            style={[s.dayPill, active && s.dayPillOn]}
                                                            onPress={() => {
                                                                const cur = f.values.notificationSettings.daysOfWeek
                                                                const next = active
                                                                    ? cur.filter((x) => x !== i)
                                                                    : [...cur, i].sort()
                                                                f.setFieldValue("notificationSettings.daysOfWeek", next)
                                                            }}
                                                        >
                                                            <Text
                                                                variant="caption"
                                                                style={{
                                                                    color: active ? "#fff" : Colors.foreground_secondary,
                                                                    fontSize: 11,
                                                                }}
                                                            >
                                                                {d}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    )
                                                })}
                                            </View>
                                        </View>

                                        <View style={s.divider} />

                                        <View style={s.notifRow}>
                                            <Text variant="caption" style={s.rowLabel}>
                                                Message
                                            </Text>
                                            <TextInput
                                                style={s.messageInput}
                                                value={f.values.notificationSettings.reminderMessage}
                                                onChangeText={(v) =>
                                                    f.setFieldValue("notificationSettings.reminderMessage", v)
                                                }
                                                placeholder="e.g. {remaining} {unit} left!"
                                                placeholderTextColor={Colors.text_dark}
                                                multiline
                                            />
                                        </View>

                                        <View style={s.divider} />

                                        <View style={s.notifRow}>
                                            <ToggleRow
                                                label="On completion"
                                                value={f.values.notificationSettings.notifyOnCompletion}
                                                onChange={(v) =>
                                                    f.setFieldValue("notificationSettings.notifyOnCompletion", v)
                                                }
                                            />
                                        </View>

                                        {isEdit && (
                                            <>
                                                <View style={s.divider} />
                                                <View style={s.notifRow}>
                                                    <ToggleRow
                                                        label="Before deadline"
                                                        value={f.values.notificationSettings.notifyBeforeDeadline}
                                                        onChange={(v) =>
                                                            f.setFieldValue(
                                                                "notificationSettings.notifyBeforeDeadline",
                                                                v,
                                                            )
                                                        }
                                                    />
                                                </View>
                                            </>
                                        )}
                                    </View>
                                ) : (
                                    <View style={s.notifOff}>
                                        <Text variant="caption" style={s.dimText}>
                                            Enable to set a reminder schedule
                                        </Text>
                                    </View>
                                )}
                            </SectionCard>

                            <View style={s.bottomSpacer} />
                        </ScrollView>
                    </View>
                )
            }}
        </Formik>
    )
}

const s = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: 15,
        paddingTop: 55,
        paddingBottom: 40,
    },
    iconRow: {
        alignItems: "center",
        marginBottom: 24,
        marginTop: 10,
        gap: 10,
    },
    iconButton: {
        width: 76,
        height: 76,
        borderRadius: 38,
        justifyContent: "center",
        alignItems: "center",
    },
    dimText: {
        color: Colors.foreground_secondary,
    },
    cardPad: {
        padding: 15,
    },
    unitRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    unitBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 100,
        backgroundColor: Colors.primary_lighter,
        borderWidth: 1,
        borderColor: Colors.borderColor,
    },
    unitBtnText: {
        color: Colors.foreground,
    },
    pickerWrap: {
        paddingVertical: 8,
        alignItems: "center",
    },
    stepper: {
        flexDirection: "row",
        alignItems: "center",
        gap: 24,
        paddingVertical: 8,
    },
    stepBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.primary_lighter,
        borderWidth: 1,
        borderColor: Colors.borderColor,
        justifyContent: "center",
        alignItems: "center",
    },
    stepValue: {
        alignItems: "center",
        minWidth: 80,
        gap: 2,
    },
    unitReadonly: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 100,
        backgroundColor: Colors.primary_lighter,
    },
    colorGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        padding: 15,
    },
    colorSwatch: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    colorSwatchActive: {
        borderWidth: 3,
        borderColor: Colors.foreground,
    },
    notifRow: {
        paddingHorizontal: 15,
        paddingVertical: 12,
        gap: 10,
    },
    notifOff: {
        padding: 15,
    },
    rowLabel: {
        color: Colors.foreground_secondary,
        marginBottom: 2,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.borderColor,
        marginHorizontal: 15,
    },
    toggleRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    timesWrapper: {
        gap: 6,
    },
    timeCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: Colors.primary_lighter,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: Colors.borderColor,
    },
    timeCardRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    addTimeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingTop: 4,
    },
    timePickerHost: {
        width: 110,
        height: 44,
    },
    intervalInput: {
        padding: 10,
        borderRadius: 12,
        backgroundColor: Colors.primary_lighter,
        color: Colors.foreground,
        borderWidth: 1,
        borderColor: Colors.borderColor,
        width: 70,
    },
    daysRow: {
        flexDirection: "row",
        gap: 6,
    },
    dayPill: {
        width: 32,
        height: 32,
        borderRadius: 100,
        backgroundColor: Colors.primary_lighter,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: Colors.borderColor,
    },
    dayPillOn: {
        backgroundColor: Colors.secondary,
        borderColor: Colors.secondary,
    },
    messageInput: {
        padding: 10,
        borderRadius: 12,
        backgroundColor: Colors.primary_lighter,
        color: Colors.foreground,
        borderWidth: 1,
        borderColor: Colors.borderColor,
        minHeight: 56,
        textAlignVertical: "top",
    },
    bottomSpacer: {
        height: 40,
    },
})
