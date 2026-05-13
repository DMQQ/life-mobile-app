import DatePicker from "@/components/DatePicker"
import BottomSheet from "@/components/ui/BottomSheet/BottomSheet"
import GlassIconButton from "@/components/ui/GlassIconButton"
import Text from "@/components/ui/Text/Text"
import Input from "@/components/ui/TextInput/TextInput"
import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import { Subscription } from "@/types"
import { Feather } from "@expo/vector-icons"
import { BottomSheetScrollView, BottomSheetView } from "@gorhom/bottom-sheet"
import Color from "color"
import { useFormik } from "formik"
import moment from "moment"
import { useMemo, useRef } from "react"
import { Keyboard, ScrollView, StyleSheet, View } from "react-native"
import { Calendar } from "react-native-calendars"
import type { DateData, MarkedDates } from "react-native-calendars/src/types"
import Feedback from "react-native-haptic-feedback"
import Ripple from "react-native-material-ripple"
import Animated, { FadeIn, interpolate, useAnimatedStyle, useSharedValue } from "react-native-reanimated"
import NumberPad from "@/components/ui/NumberPad"
import useSubscription from "../hooks/useSubscription"
import { useSubAccounts } from "../hooks/useSubAccounts"

type BillingCycle = "daily" | "weekly" | "monthly" | "yearly" | "custom"

interface Props {
    route: { params: { subscription?: Subscription } }
    navigation: any
}

const BILLING_CYCLES: BillingCycle[] = ["daily", "weekly", "monthly", "yearly", "custom"]
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const REMINDER_PRESETS = [0, 1, 3, 7, 14, 30]

const CALENDAR_THEME = {
    backgroundColor: "transparent",
    calendarBackground: "transparent",
    dayTextColor: Colors.foreground,
    textDisabledColor: "rgba(255,255,255,0.2)",
    monthTextColor: Colors.secondary,
    textMonthFontSize: 17,
    textMonthFontWeight: "700" as const,
    selectedDayBackgroundColor: Colors.secondary,
    selectedDayTextColor: "#fff",
    arrowColor: Colors.secondary,
    todayTextColor: Colors.secondary,
    textDayFontSize: 15,
    textDayFontWeight: "500" as const,
    "stylesheet.calendar.header": {
        week: { marginTop: 4, flexDirection: "row", justifyContent: "space-around" },
        dayHeader: { fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: "600" as const },
    },
}

export default function EditSubscription({ route, navigation }: Props) {
    const subscription = route.params?.subscription
    const isEdit = !!subscription
    const {
        modifySubscription,
        modifySubscriptionState,
        createSubscriptionFromInput,
        createSubscriptionFromInputState,
    } = useSubscription()

    const { data: subAccountsData } = useSubAccounts()
    const subAccounts = subAccountsData?.wallet?.subAccounts ?? []

    const reminderSheetRef = useRef<any>(null)
    const customSheetRef = useRef<any>(null)
    const accountSheetRef = useRef<any>(null)
    const transformX = useSharedValue(0)

    const formik = useFormik({
        initialValues: {
            description: subscription?.description ?? "",
            amount: subscription?.amount?.toString() ?? "0",
            billingCycle: (subscription?.billingCycle ?? "monthly") as BillingCycle,
            billingDay: subscription?.billingDay?.toString() ?? "1",
            customBillingMonths: subscription?.customBillingMonths ?? ([] as number[]),
            reminderDaysBeforehand: subscription?.reminderDaysBeforehand ?? 3,
            dateStart: subscription?.dateStart ? new Date(+subscription.dateStart) : new Date(),
            dateEnd: subscription?.dateEnd ? new Date(+subscription.dateEnd) : (null as Date | null),
            nextBillingDate: subscription?.nextBillingDate ? new Date(+subscription.nextBillingDate) : new Date(),
            subAccountId: undefined as string | undefined,
        },
        onSubmit: async (values) => {
            Feedback.trigger("impactLight")
            const input: Record<string, unknown> = {
                description: values.description.trim() || undefined,
                amount: parseFloat(values.amount),
                billingCycle: values.billingCycle,
                dateStart: values.dateStart.toISOString(),
                dateEnd: values.dateEnd?.toISOString() ?? undefined,
                nextBillingDate: values.nextBillingDate.toISOString(),
                reminderDaysBeforehand: values.reminderDaysBeforehand,
                ...(values.billingCycle === "custom" && {
                    billingDay: parseInt(values.billingDay) || 1,
                    customBillingMonths: values.customBillingMonths,
                }),
                ...(!isEdit && values.subAccountId && { subAccountId: values.subAccountId }),
            }
            const result = await (async () => {
                if (isEdit) {
                    return await modifySubscription({ variables: { input: { id: subscription!.id, ...input } as any } })
                } else {
                    return await createSubscriptionFromInput({ variables: { input: input as any } })
                }
            })()

            console.log({ input, result })
            navigation.goBack()
        },
    })

    const loading = modifySubscriptionState.loading || createSubscriptionFromInputState.loading
    const isValid = parseFloat(formik.values.amount) > 0

    const animatedAmount = useAnimatedStyle(
        () => ({
            transform: [{ translateX: transformX.value }],
            fontSize: interpolate(formik.values.amount.length, [0, 10, 15], [90, 60, 35], "clamp"),
        }),
        [formik.values.amount],
    )

    const handleAmountChange = (value: string) => {
        const prev = formik.values.amount
        let next = prev
        if (value === "C") {
            const val = prev.slice(0, -1)
            next = val.length === 0 ? "0" : val
        } else if (prev.includes(".") && prev.split(".")[1].length === 2) {
            return
        } else if (prev.length === 1 && prev === "0" && value !== ".") {
            next = value
        } else if (prev.includes(".") && value === ".") {
            return
        } else if (prev.length === 0 && value === ".") {
            next = "0."
        } else {
            next = prev + value
        }
        formik.setFieldValue("amount", next)
    }

    const dayPickerMarkedDates = useMemo<MarkedDates>(() => {
        const day = Math.max(1, Math.min(31, parseInt(formik.values.billingDay) || 1))
        const marks: MarkedDates = {}
        const year = new Date().getFullYear()
        for (let m = 1; m <= 12; m++) {
            const daysInMonth = new Date(year, m, 0).getDate()
            if (day > daysInMonth) continue
            const key = `${year}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`
            marks[key] = { selected: true, selectedColor: Colors.secondary }
        }
        return marks
    }, [formik.values.billingDay])

    const handleDayPress = (day: DateData) => {
        Feedback.trigger("impactLight")
        formik.setFieldValue("billingDay", String(day.day))
    }

    const toggleMonth = (m: number) => {
        Feedback.trigger("impactLight")
        const prev = formik.values.customBillingMonths
        formik.setFieldValue(
            "customBillingMonths",
            prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m].sort((a, b) => a - b),
        )
    }

    const reminderLabel =
        formik.values.reminderDaysBeforehand === 0 ? "Same day" : `${formik.values.reminderDaysBeforehand}d before`

    const customLabel =
        formik.values.customBillingMonths.length > 0
            ? `Day ${formik.values.billingDay} · ${formik.values.customBillingMonths.map((m) => MONTH_NAMES[m - 1]).join(", ")}`
            : `Day ${formik.values.billingDay}`

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.container}>
                <GlassIconButton name="x" onPress={() => navigation.goBack()} positioned="top-left" />
                <GlassIconButton
                    name="check"
                    onPress={() => formik.handleSubmit()}
                    disabled={!isValid || loading}
                    loading={loading}
                    tintColor={Colors.secondary}
                    positioned="top-right"
                />

                <View style={styles.amountContainer}>
                    <Animated.Text style={[styles.amountText, animatedAmount]}>
                        {formik.values.amount}
                        <Text variant="body" style={{ fontSize: 20 }}>
                            zł
                        </Text>
                    </Animated.Text>
                </View>

                <View style={styles.contentContainer}>
                    <View style={{ borderRadius: 35, flex: 1 }}>
                        <Animated.View entering={FadeIn} style={{ gap: 5 }}>
                            <View
                                style={{
                                    flexDirection: "row",
                                    width: "100%",
                                    alignItems: "center",
                                    zIndex: 1000,
                                }}
                            >
                                <Input
                                    value={formik.values.description}
                                    onChangeText={(v) => formik.setFieldValue("description", v)}
                                    placeholder="Description"
                                    style={{ flex: 1, width: "100%" }}
                                    containerStyle={{ flex: 1, borderRadius: 20 }}
                                />
                            </View>

                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                keyboardDismissMode="on-drag"
                                contentContainerStyle={{ gap: 10 }}
                            >
                                <DatePicker
                                    mode="single"
                                    dates={{ start: formik.values.dateStart, end: formik.values.dateStart }}
                                    setDates={({ start }) => formik.setFieldValue("dateStart", start)}
                                    buttonComponent={({ start }) => (
                                        <Ripple style={styles.chip}>
                                            <Feather
                                                name="calendar"
                                                size={15}
                                                color="rgba(255,255,255,0.7)"
                                            />
                                            <Text style={styles.chipText}>
                                                Start {moment(start).format("DD.MM.YY")}
                                            </Text>
                                        </Ripple>
                                    )}
                                />

                                <DatePicker
                                    mode="single"
                                    dates={{
                                        start: formik.values.nextBillingDate,
                                        end: formik.values.nextBillingDate,
                                    }}
                                    setDates={({ start }) => formik.setFieldValue("nextBillingDate", start)}
                                    buttonComponent={({ start }) => (
                                        <Ripple style={styles.chip}>
                                            <Feather
                                                name="calendar"
                                                size={15}
                                                color="rgba(255,255,255,0.7)"
                                            />
                                            <Text style={styles.chipText}>
                                                Next {moment(start).format("DD.MM.YY")}
                                            </Text>
                                        </Ripple>
                                    )}
                                />

                                <DatePicker
                                    mode="single"
                                    dates={{
                                        start: formik.values.dateEnd ?? new Date(),
                                        end: formik.values.dateEnd ?? new Date(),
                                    }}
                                    setDates={({ start }) => formik.setFieldValue("dateEnd", start)}
                                    buttonComponent={({ start }) => (
                                        <Ripple
                                            style={[styles.chip, formik.values.dateEnd && styles.chipActive]}
                                            onLongPress={() => formik.setFieldValue("dateEnd", null)}
                                        >
                                            <Feather
                                                name="calendar"
                                                size={15}
                                                color={
                                                    formik.values.dateEnd
                                                        ? Colors.secondary
                                                        : "rgba(255,255,255,0.7)"
                                                }
                                            />
                                            <Text
                                                style={[
                                                    styles.chipText,
                                                    formik.values.dateEnd && styles.chipTextActive,
                                                ]}
                                            >
                                                {formik.values.dateEnd
                                                    ? `End ${moment(start).format("DD.MM.YY")}`
                                                    : "No end"}
                                            </Text>
                                        </Ripple>
                                    )}
                                />

                                {BILLING_CYCLES.map((cycle) => (
                                    <Ripple
                                        key={cycle}
                                        onPress={() => {
                                            Feedback.trigger("impactLight")
                                            formik.setFieldValue("billingCycle", cycle)
                                            if (cycle === "custom") {
                                                Keyboard.dismiss()
                                                customSheetRef.current?.expand()
                                            }
                                        }}
                                        style={[
                                            styles.chip,
                                            formik.values.billingCycle === cycle && styles.chipActive,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.chipText,
                                                formik.values.billingCycle === cycle && styles.chipTextActive,
                                            ]}
                                        >
                                            {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                                        </Text>
                                    </Ripple>
                                ))}

                                <Ripple
                                    style={[styles.chip, styles.chipActive]}
                                    onPress={() => {
                                        Keyboard.dismiss()
                                        reminderSheetRef.current?.expand()
                                    }}
                                >
                                    <Feather
                                        name="bell"
                                        size={15}
                                        color={Colors.secondary}
                                    />
                                    <Text style={[styles.chipText, styles.chipTextActive]}>
                                        {reminderLabel}
                                    </Text>
                                </Ripple>

                                {!isEdit && subAccounts.length > 0 && (
                                    <Ripple
                                        style={[styles.chip, formik.values.subAccountId && styles.chipActive]}
                                        onPress={() => {
                                            Keyboard.dismiss()
                                            accountSheetRef.current?.expand()
                                        }}
                                    >
                                        <Feather
                                            name="credit-card"
                                            size={15}
                                            color={
                                                formik.values.subAccountId
                                                    ? Colors.secondary
                                                    : "rgba(255,255,255,0.7)"
                                            }
                                        />
                                        <Text
                                            style={[
                                                styles.chipText,
                                                formik.values.subAccountId && styles.chipTextActive,
                                            ]}
                                        >
                                            {formik.values.subAccountId
                                                ? (subAccounts.find((a) => a.id === formik.values.subAccountId)
                                                      ?.name ?? "Account")
                                                : "Account"}
                                        </Text>
                                    </Ripple>
                                )}

                                {formik.values.billingCycle === "custom" && (
                                    <Ripple
                                        style={[styles.chip, styles.chipActive]}
                                        onPress={() => {
                                            Keyboard.dismiss()
                                            customSheetRef.current?.expand()
                                        }}
                                    >
                                        <Feather name="settings" size={15} color={Colors.secondary} />
                                        <Text
                                            style={[styles.chipText, styles.chipTextActive]}
                                            numberOfLines={1}
                                        >
                                            {customLabel}
                                        </Text>
                                    </Ripple>
                                )}
                            </ScrollView>
                        </Animated.View>

                        <NumberPad
                            onKeyPress={handleAmountChange}
                            onBackPress={formik.values.amount === "0" ? () => navigation.goBack() : undefined}
                        />
                    </View>
                </View>
            </View>

            <BottomSheet ref={reminderSheetRef} snapPoints={["40%"]}>
                <BottomSheetView style={styles.sheetContent}>
                    <Text variant="subtitle" style={styles.sheetTitle}>
                        Reminder
                    </Text>
                    <View style={styles.sheetGrid}>
                        {REMINDER_PRESETS.map((days) => {
                            const active = formik.values.reminderDaysBeforehand === days
                            return (
                                <Ripple
                                    key={days}
                                    onPress={() => {
                                        Feedback.trigger("impactLight")
                                        formik.setFieldValue("reminderDaysBeforehand", days)
                                        reminderSheetRef.current?.close()
                                    }}
                                    style={[styles.sheetOption, active && styles.sheetOptionActive]}
                                >
                                    <Text style={[styles.sheetOptionText, active && styles.sheetOptionTextActive]}>
                                        {days === 0 ? "Same day" : `${days}d before`}
                                    </Text>
                                </Ripple>
                            )
                        })}
                    </View>
                </BottomSheetView>
            </BottomSheet>

            <BottomSheet ref={customSheetRef} snapPoints={["75%"]}>
                <BottomSheetScrollView contentContainerStyle={styles.sheetContent}>
                    <View style={styles.sheetRow}>
                        <View>
                            <Text variant="subtitle" style={styles.sheetTitle}>
                                Custom Billing
                            </Text>
                            <Text style={styles.sheetHint}>Tap a day to set billing day of month</Text>
                        </View>
                        <View style={styles.daySummary}>
                            <Text style={styles.daySummaryText}>Day {formik.values.billingDay}</Text>
                        </View>
                    </View>

                    <Calendar
                        onDayPress={handleDayPress}
                        markedDates={dayPickerMarkedDates}
                        enableSwipeMonths
                        theme={CALENDAR_THEME as any}
                        style={{ borderRadius: 14, marginBottom: 20 }}
                    />

                    <Text style={styles.sectionLabel}>Active months</Text>
                    {MONTH_NAMES.map((name, i) => {
                        const m = i + 1
                        const active = formik.values.customBillingMonths.includes(m)
                        return (
                            <Ripple key={m} onPress={() => toggleMonth(m)} style={styles.monthRow}>
                                <Text style={[styles.monthRowLabel, active && { color: Colors.foreground }]}>
                                    {name}
                                </Text>
                                <View style={[styles.monthToggle, active && styles.monthToggleActive]}>
                                    {active && <Feather name="check" size={13} color={Colors.secondary} />}
                                </View>
                            </Ripple>
                        )
                    })}
                </BottomSheetScrollView>
            </BottomSheet>
            <BottomSheet ref={accountSheetRef} snapPoints={["40%"]}>
                <BottomSheetView style={styles.sheetContent}>
                    <Text variant="subtitle" style={styles.sheetTitle}>
                        Account
                    </Text>
                    <View style={styles.sheetGrid}>
                        {subAccounts.map((account) => {
                            const active = formik.values.subAccountId === account.id
                            return (
                                <Ripple
                                    key={account.id}
                                    onPress={() => {
                                        Feedback.trigger("impactLight")
                                        formik.setFieldValue("subAccountId", active ? undefined : account.id)
                                        accountSheetRef.current?.close()
                                    }}
                                    style={[styles.sheetOption, active && styles.sheetOptionActive]}
                                >
                                    <Text style={[styles.sheetOptionText, active && styles.sheetOptionTextActive]}>
                                        {account.name}
                                    </Text>
                                </Ripple>
                            )
                        })}
                    </View>
                </BottomSheetView>
            </BottomSheet>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 15,
        justifyContent: "space-between",
    },
    amountContainer: {
        height: 250,
        justifyContent: "center",
        width: "100%",
        alignItems: "center",
        flexDirection: "row",
        paddingTop: 45,
        paddingHorizontal: 15,
    },
    amountText: {
        color: Colors.foreground,
        fontWeight: "bold",
        textAlign: "center",
    },
    contentContainer: {
        padding: 15,
        flex: 1,
        gap: 15,
        maxHeight: Layout.screen.height / 1.65,
        backgroundColor: Colors.primary_light,
        borderTopRightRadius: 30,
        borderTopLeftRadius: 30,
        paddingBottom: 30,
    },
    chip: {
        padding: 10,
        paddingHorizontal: 20,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        gap: 10,
        backgroundColor: Colors.primary_lighter,
        borderColor: Color(Colors.primary_lighter).lighten(0.25).hex(),
        borderWidth: 2,
        height: 45,
    },
    chipActive: {
        backgroundColor: Color(Colors.secondary).alpha(0.2).string(),
        borderColor: Color(Colors.secondary).alpha(0.4).string(),
    },
    chipText: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 14,
    },
    chipTextActive: {
        color: Colors.secondary,
    },
    sheetContent: {
        padding: 20,
        paddingTop: 10,
    },
    sheetTitle: {
        color: Colors.text_light,
        fontWeight: "700",
        fontSize: 18,
        marginBottom: 2,
    },
    sheetHint: {
        color: "rgba(255,255,255,0.35)",
        fontSize: 12,
        marginBottom: 16,
    },
    sheetGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    sheetOption: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 14,
        backgroundColor: Color(Colors.primary_lighter).lighten(0.1).string(),
        borderWidth: 1.5,
        borderColor: "rgba(255,255,255,0.08)",
    },
    sheetOptionActive: {
        backgroundColor: Color(Colors.secondary).alpha(0.18).string(),
        borderColor: Color(Colors.secondary).alpha(0.45).string(),
    },
    sheetOptionText: {
        color: "rgba(255,255,255,0.65)",
        fontSize: 15,
        fontWeight: "600",
    },
    sheetOptionTextActive: {
        color: Colors.secondary,
    },
    sheetRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 14,
    },
    daySummary: {
        backgroundColor: Color(Colors.secondary).alpha(0.18).string(),
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderWidth: 1.5,
        borderColor: Color(Colors.secondary).alpha(0.4).string(),
    },
    daySummaryText: {
        color: Colors.secondary,
        fontWeight: "700",
        fontSize: 16,
    },
    sectionLabel: {
        color: "rgba(255,255,255,0.4)",
        fontSize: 12,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 10,
    },
    monthRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 13,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "rgba(255,255,255,0.06)",
    },
    monthRowLabel: {
        color: "rgba(255,255,255,0.45)",
        fontSize: 16,
        fontWeight: "500",
    },
    monthToggle: {
        width: 26,
        height: 26,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: "rgba(255,255,255,0.12)",
        alignItems: "center",
        justifyContent: "center",
    },
    monthToggleActive: {
        borderColor: Color(Colors.secondary).alpha(0.5).string(),
        backgroundColor: Color(Colors.secondary).alpha(0.15).string(),
    },
})
