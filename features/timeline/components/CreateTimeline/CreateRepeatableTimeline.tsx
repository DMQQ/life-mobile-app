import { BottomSheetGorhom } from "@/components/ui/BottomSheet/BottomSheet"
import SegmentedButtons from "@/components/ui/SegmentedButtons"
import Input from "@/components/ui/TextInput/TextInput"
import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import { AntDesign, MaterialIcons } from "@expo/vector-icons"
import BottomSheetType, { BottomSheetView, BottomSheetBackdrop } from "@gorhom/bottom-sheet"
import { forwardRef, memo, useCallback, useImperativeHandle, useRef, useState } from "react"
import { StyleSheet, View, useWindowDimensions } from "react-native"
import Ripple from "react-native-material-ripple"
import DatePicker, { type DatePickerRef } from "@/components/DatePicker"
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
    action_button: {
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

const EMPTY_LOCAL = {
    repeatType: "",
    repeatDaysOfWeek: [] as number[],
    repeatInterval: "1",
    repeatCount: "",
    repeatUntil: "",
    repeatOn: "",
    repeatEveryNth: "",
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

const intervalLabel = (type: string) => {
    if (type === "MONTHLY") return "months"
    if (type === "WEEKLY") return "weeks"
    return "days"
}

const CreateRepeatableTimeline = forwardRef<BottomSheetType, CreateRepeatableTimelineProps>(({ formik: f }, ref) => {
    const { height } = useWindowDimensions()
    const snapPoints = [height * 0.55]
    const sheetRef = useRef<BottomSheetType>(null)

    useImperativeHandle(ref, () => sheetRef.current as BottomSheetType)

    const [local, setLocal] = useState({ ...EMPTY_LOCAL })
    const datePickerRef = useRef<DatePickerRef>(null)
    const appliedRef = useRef(false)

    const set = (key: keyof typeof EMPTY_LOCAL, value: any) => setLocal((prev) => ({ ...prev, [key]: value }))

    const onExpand = useCallback(() => {
        appliedRef.current = false
        setLocal({
            repeatType: f.values.repeatType || "",
            repeatDaysOfWeek: f.values.repeatDaysOfWeek || [],
            repeatInterval: f.values.repeatInterval || "1",
            repeatCount: f.values.repeatCount || "",
            repeatUntil: f.values.repeatUntil || "",
            repeatOn: f.values.repeatOn || "",
            repeatEveryNth: f.values.repeatEveryNth || "",
        })
    }, [f.values])

    const onDone = () => {
        appliedRef.current = true
        Object.entries(local).forEach(([key, value]) => f.setFieldValue(key, value))
        sheetRef.current?.close()
    }

    const onCancel = () => {
        appliedRef.current = true
        sheetRef.current?.close()
    }

    const onDismiss = useCallback(() => {
        if (!appliedRef.current) {
            Object.entries(EMPTY_LOCAL).forEach(([key, value]) => f.setFieldValue(key, value))
        }
        appliedRef.current = false
    }, [f])

    const toggleDayOfWeek = (day: number) => {
        const current: number[] = local.repeatDaysOfWeek || []
        set("repeatDaysOfWeek", current.includes(day) ? current.filter((d) => d !== day) : [...current, day])
    }

    const intervalButtons = new Array(7).fill(0).map((_, i) => ({ text: `${i + 1}`, value: `${i + 1}` }))

    const repeatUntilDate = local.repeatUntil ? dayjs(local.repeatUntil).toDate() : new Date()

    const renderBackdrop = useCallback(
        (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
        [],
    )

    return (
        <BottomSheetGorhom
            ref={sheetRef}
            index={-1}
            snapPoints={snapPoints}
            enablePanDownToClose={true}
            backdropComponent={renderBackdrop}
            handleIndicatorStyle={{ backgroundColor: Colors.foreground_secondary }}
            handleStyle={{ backgroundColor: Colors.primary }}
            style={{ backgroundColor: Colors.primary }}
            backgroundStyle={{ backgroundColor: Colors.primary }}
            onChange={(index) => {
                if (index === 0) onExpand()
            }}
            onDismiss={onDismiss}
        >
            <BottomSheetView style={{ flex: 1, backgroundColor: Colors.primary }}>
                <View style={styles.modal_container}>
                    <View style={styles.header}>
                        <Text variant="subheading" style={{ fontWeight: "700" }}>
                            Repeat Options
                        </Text>
                        <View style={{ flexDirection: "row", gap: 8 }}>
                            <Ripple
                                onPress={onCancel}
                                style={[styles.action_button, { backgroundColor: Colors.primary_lighter }]}
                            >
                                <AntDesign name="close" size={14} color={Colors.foreground_secondary} />
                                <Text
                                    variant="caption"
                                    style={{ fontWeight: "700", color: Colors.foreground_secondary }}
                                >
                                    CANCEL
                                </Text>
                            </Ripple>
                            <Ripple
                                onPress={onDone}
                                style={[styles.action_button, { backgroundColor: Colors.secondary + "33" }]}
                            >
                                <AntDesign name="check" size={14} color={Colors.secondary} />
                                <Text variant="caption" style={{ fontWeight: "700", color: Colors.secondary }}>
                                    DONE
                                </Text>
                            </Ripple>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionLabel}>
                            <MaterialIcons name="repeat" size={16} color={Colors.secondary} />
                            <Text variant="body" color={Colors.secondary} style={{ fontWeight: "700" }}>
                                Repeat type
                            </Text>
                        </View>
                        <SegmentedButtons
                            value={local.repeatType}
                            onChange={(value) => set("repeatType", value)}
                            buttons={REPEAT_TYPES}
                            buttonStyle={{ height: 36 }}
                            buttonTextStyle={{ fontSize: 13 }}
                            containerStyle={{ borderRadius: 8 }}
                        />
                    </View>

                    {local.repeatType === "WEEKLY" && (
                        <View style={styles.section}>
                            <View style={styles.sectionLabel}>
                                <Ionicons name="today-outline" size={16} color={Colors.secondary} />
                                <Text variant="body" color={Colors.secondary} style={{ fontWeight: "700" }}>
                                    Days of week
                                </Text>
                            </View>
                            <View style={{ flexDirection: "row", gap: 6 }}>
                                {DAYS_OF_WEEK.map((day) => {
                                    const isSelected = (local.repeatDaysOfWeek || []).includes(day.value)
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
                                Every {intervalLabel(local.repeatType)}
                            </Text>
                        </View>
                        <SegmentedButtons
                            value={local.repeatInterval || "1"}
                            onChange={(value) => set("repeatInterval", value)}
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
                            value={local.repeatCount}
                            onChangeText={(t) => set("repeatCount", t)}
                            placeholder="e.g. 10"
                            placeholderTextColor={Colors.foreground_secondary}
                            left={
                                <ArrowButton
                                    disabled={Number(local.repeatCount || 0) <= 0 || local.repeatCount === ""}
                                    arrow="arrow-down"
                                    onPress={() =>
                                        set("repeatCount", String(Math.max(0, Number(local.repeatCount || 0) - 1)))
                                    }
                                />
                            }
                            right={
                                <ArrowButton
                                    arrow="arrow-up"
                                    onPress={() => set("repeatCount", String(Number(local.repeatCount || 0) + 1))}
                                />
                            }
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
                            controlRef={datePickerRef}
                            mode="single"
                            placeholder={local.repeatUntil ? dayjs(local.repeatUntil).format("MMM D, YYYY") : "Select end date"}
                            dates={{ start: repeatUntilDate, end: repeatUntilDate }}
                            setDates={({ start }) => set("repeatUntil", dayjs(start).format("YYYY-MM-DD"))}
                        />
                    </View>
                </View>
            </BottomSheetView>
        </BottomSheetGorhom>
    )
})

export default memo(CreateRepeatableTimeline)
