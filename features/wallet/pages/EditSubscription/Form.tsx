import GroupSelector from "@/components/ui/GroupSelector"
import ModalHeader from "@/components/ui/ModalHeader"
import Section from "@/components/ui/Section"
import Text from "@/components/ui/Text/Text"
import Input from "@/components/ui/TextInput/TextInput"
import Colors from "@/constants/Colors"
import { Subscription } from "@/types"
import { Feather } from "@expo/vector-icons"
import Color from "color"
import { DatePicker as SwiftDatePicker, Host } from "@expo/ui/swift-ui"
import { datePickerStyle, frame } from "@expo/ui/swift-ui/modifiers"
import dayjs from "dayjs"
import { useFormik } from "formik"
import moment from "moment"
import { useEffect, useState } from "react"
import { Keyboard, Pressable, ScrollView, StyleSheet, View } from "react-native"
import Feedback from "react-native-haptic-feedback"
import Ripple from "react-native-material-ripple"
import useSubscription from "../../hooks/useSubscription"
import { useSubAccounts } from "../../hooks/useSubAccounts"
import { EditSubscriptionStackParams } from "./Main"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import layout from "@/constants/Layout"

type BillingCycle = "daily" | "weekly" | "monthly" | "yearly" | "custom"

type Props = NativeStackScreenProps<EditSubscriptionStackParams, "Form">

const BILLING_CYCLE_OPTIONS = [
    { label: "Daily", value: "daily" as BillingCycle },
    { label: "Weekly", value: "weekly" as BillingCycle },
    { label: "Monthly", value: "monthly" as BillingCycle },
    { label: "Yearly", value: "yearly" as BillingCycle },
    { label: "Custom", value: "custom" as BillingCycle },
]

const REMINDER_OPTIONS = [
    { label: "Same day", value: "0" },
    { label: "1d", value: "1" },
    { label: "3d", value: "3" },
    { label: "7d", value: "7" },
    { label: "30d", value: "30" },
]

export default function Form({ route, navigation }: Props) {
    const subscription = (route.params as any)?.subscription as Subscription | undefined
    const isEdit = !!subscription

    const {
        modifySubscription,
        modifySubscriptionState,
        createSubscriptionFromInput,
        createSubscriptionFromInputState,
    } = useSubscription()

    const { data: subAccountsData } = useSubAccounts()
    const subAccounts = subAccountsData?.wallet?.subAccounts ?? []

    const [expanded, setExpanded] = useState({ start: false, nextBilling: false, end: false, account: false })
    const toggleExpanded = (key: "start" | "nextBilling" | "end" | "account") =>
        setExpanded((p) => ({ ...p, [key]: !p[key] }))

    const formik = useFormik({
        initialValues: {
            description: subscription?.description ?? "",
            amount: subscription?.amount?.toString() ?? "",
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
            if (isEdit) {
                await modifySubscription({ variables: { input: { id: subscription!.id, ...input } as any } })
            } else {
                await createSubscriptionFromInput({ variables: { input: input as any } })
            }
            navigation.getParent()?.goBack()
        },
    })

    useEffect(() => {
        const cb = route.params?.customBilling
        if (cb) {
            formik.setFieldValue("billingDay", cb.billingDay)
            formik.setFieldValue("customBillingMonths", cb.customBillingMonths)
        }
    }, [route.params?.customBilling])

    const loading = modifySubscriptionState.loading || createSubscriptionFromInputState.loading
    const isValid = parseFloat(formik.values.amount) > 0

    const customLabel =
        formik.values.customBillingMonths.length > 0
            ? `Day ${formik.values.billingDay} · ${formik.values.customBillingMonths.map((m) => ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1]).join(", ")}`
            : `Day ${formik.values.billingDay}`

    const selectedAccount = subAccounts.find((a) => a.id === formik.values.subAccountId)

    return (
        <View style={{ flex: 1 }}>
            <ModalHeader
                title={isEdit ? "Edit Subscription" : "New Subscription"}
                onClose={() => navigation.getParent()?.goBack()}
                onSave={() => formik.handleSubmit()}
                saveDisabled={!isValid || loading}
                saveLoading={loading}
                dirty={formik.dirty}
                saveIcon="checkmark"
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardDismissMode="on-drag"
                showsVerticalScrollIndicator={false}
            >
                <Section title="Amount" cardStyle={{ padding: 5 }} noGap>
                    <Input
                        value={formik.values.amount}
                        onChangeText={(v) => formik.setFieldValue("amount", v)}
                        placeholder="0.00"
                        keyboardType="decimal-pad"
                        flat
                        style={styles.amountInput}
                        containerStyle={{ borderRadius: 0 }}
                        left={
                            <Text variant="body" style={styles.currencyLabel}>
                                zł
                            </Text>
                        }
                    />
                    <View style={styles.divider} />
                    <Input
                        value={formik.values.description}
                        onChangeText={(v) => formik.setFieldValue("description", v)}
                        placeholder="Description"
                        flat
                        containerStyle={{ borderRadius: 0 }}
                    />
                </Section>

                <Section title="Dates">
                    <Pressable onPress={() => toggleExpanded("start")} style={styles.dateRow}>
                        <Text variant="subtitle">Start date</Text>
                        <Text variant="body" style={styles.dateValue}>
                            {moment(formik.values.dateStart).format("DD MMMM YYYY")}
                        </Text>
                    </Pressable>
                    {expanded.start && (
                        <View style={styles.pickerContainer}>
                            <Host matchContents>
                                <SwiftDatePicker
                                    selection={dayjs(formik.values.dateStart).toDate()}
                                    onDateChange={(d) => formik.setFieldValue("dateStart", d)}
                                    modifiers={[
                                        datePickerStyle("graphical"),
                                        frame({ width: layout.screen.width - 30 }),
                                    ]}
                                />
                            </Host>
                        </View>
                    )}

                    <View style={styles.divider} />

                    <Pressable onPress={() => toggleExpanded("nextBilling")} style={styles.dateRow}>
                        <Text variant="subtitle">Next billing</Text>
                        <Text variant="body" style={styles.dateValue}>
                            {moment(formik.values.nextBillingDate).format("DD MMMM YYYY")}
                        </Text>
                    </Pressable>
                    {expanded.nextBilling && (
                        <View style={styles.pickerContainer}>
                            <Host matchContents>
                                <SwiftDatePicker
                                    selection={dayjs(formik.values.nextBillingDate).toDate()}
                                    onDateChange={(d) => formik.setFieldValue("nextBillingDate", d)}
                                    modifiers={[
                                        datePickerStyle("graphical"),
                                        frame({ width: layout.screen.width - 30 }),
                                    ]}
                                />
                            </Host>
                        </View>
                    )}

                    <View style={styles.divider} />

                    <Pressable
                        onPress={() => {
                            if (!formik.values.dateEnd) formik.setFieldValue("dateEnd", new Date())
                            toggleExpanded("end")
                        }}
                        style={styles.dateRow}
                    >
                        <Text variant="subtitle">End date</Text>
                        <View style={styles.dateRowRight}>
                            <Text
                                variant="body"
                                style={[styles.dateValue, !formik.values.dateEnd && styles.dateValueMuted]}
                            >
                                {formik.values.dateEnd
                                    ? moment(formik.values.dateEnd).format("DD MMMM YYYY")
                                    : "No end date"}
                            </Text>
                            {formik.values.dateEnd && (
                                <Pressable
                                    onPress={(e) => {
                                        e.stopPropagation()
                                        formik.setFieldValue("dateEnd", null)
                                        setExpanded((p) => ({ ...p, end: false }))
                                    }}
                                    hitSlop={8}
                                >
                                    <Feather name="x" size={14} color={Colors.foreground_secondary} />
                                </Pressable>
                            )}
                        </View>
                    </Pressable>
                    {expanded.end && formik.values.dateEnd && (
                        <View style={styles.pickerContainer}>
                            <Host matchContents>
                                <SwiftDatePicker
                                    selection={dayjs(formik.values.dateEnd).toDate()}
                                    onDateChange={(d) => formik.setFieldValue("dateEnd", d)}
                                    modifiers={[
                                        datePickerStyle("graphical"),
                                        frame({ width: layout.screen.width - 30 }),
                                    ]}
                                />
                            </Host>
                        </View>
                    )}
                </Section>

                <Section title="Billing cycle">
                    <GroupSelector
                        options={BILLING_CYCLE_OPTIONS}
                        value={formik.values.billingCycle}
                        onChange={(cycle) => {
                            Feedback.trigger("impactLight")
                            formik.setFieldValue("billingCycle", cycle)
                        }}
                        size="medium"
                    />
                </Section>

                {formik.values.billingCycle === "custom" && (
                    <Section title="Custom billing">
                        <Ripple
                            onPress={() => {
                                Keyboard.dismiss()
                                navigation.navigate("CustomBilling", {
                                    billingDay: formik.values.billingDay,
                                    customBillingMonths: formik.values.customBillingMonths,
                                })
                            }}
                            style={styles.navRow}
                        >
                            <Feather name="settings" size={16} color={Colors.secondary} />
                            <Text style={styles.navRowText}>{customLabel}</Text>
                            <Feather
                                name="chevron-right"
                                size={16}
                                color={Colors.foreground_secondary}
                                style={styles.navRowChevron}
                            />
                        </Ripple>
                    </Section>
                )}

                <Section title="Reminder">
                    <GroupSelector
                        options={REMINDER_OPTIONS}
                        value={String(formik.values.reminderDaysBeforehand)}
                        onChange={(v) => {
                            Feedback.trigger("impactLight")
                            formik.setFieldValue("reminderDaysBeforehand", parseInt(v))
                        }}
                        size="medium"
                    />
                </Section>

                {!isEdit && subAccounts.length > 0 && (
                    <Section title="Account">
                        <Pressable
                            onPress={() => {
                                Keyboard.dismiss()
                                Feedback.trigger("impactLight")
                                toggleExpanded("account")
                            }}
                            style={styles.dateRow}
                        >
                            <Text variant="subtitle">Account</Text>
                            <Text
                                variant="body"
                                style={[styles.rowValue, selectedAccount && { color: Colors.secondary }]}
                            >
                                {selectedAccount?.name ?? "Default"}
                            </Text>
                        </Pressable>
                        {expanded.account && (
                            <View>
                                {(
                                    [{ id: undefined as string | undefined, name: "Default" }, ...subAccounts] as {
                                        id: string | undefined
                                        name: string
                                    }[]
                                ).map((item) => {
                                    const active = formik.values.subAccountId === item.id
                                    return (
                                        <Ripple
                                            key={item.id ?? "__default"}
                                            onPress={() => {
                                                Feedback.trigger("impactLight")
                                                formik.setFieldValue("subAccountId", item.id)
                                                toggleExpanded("account")
                                            }}
                                            style={[styles.accountRow, active && styles.accountRowActive]}
                                        >
                                            <Feather
                                                name="credit-card"
                                                size={16}
                                                color={active ? Colors.secondary : Colors.foreground_secondary}
                                            />
                                            <Text style={[styles.accountLabel, active && { color: Colors.secondary }]}>
                                                {item.name}
                                            </Text>
                                            {active && <Feather name="check" size={15} color={Colors.secondary} />}
                                        </Ripple>
                                    )
                                })}
                            </View>
                        )}
                    </Section>
                )}
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    scrollContent: {
        padding: 15,
        paddingBottom: 60,
    },
    amountInput: {
        fontSize: 28,
        fontWeight: "700",
        color: Colors.foreground,
    },
    currencyLabel: {
        color: Colors.foreground_secondary,
        marginRight: 4,
    },
    divider: {
        borderWidth: 0.5,
        borderColor: Colors.borderColor,
    },
    dateRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 15,
        paddingVertical: 12,
    },
    dateRowRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    dateValue: {
        color: Colors.foreground,
    },
    dateValueMuted: {
        color: Colors.foreground_secondary,
    },
    pickerContainer: {
        alignItems: "center",
        paddingBottom: 10,
    },
    rowValue: {
        color: Colors.foreground,
    },
    accountRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 15,
        paddingVertical: 13,
        borderRadius: 10,
    },
    accountRowActive: {
        backgroundColor: Color(Colors.secondary).alpha(0.1).string(),
    },
    accountLabel: {
        flex: 1,
        color: Colors.foreground_secondary,
        fontSize: 15,
    },
    navRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 15,
        paddingVertical: 14,
    },
    navRowText: {
        color: Colors.foreground_secondary,
        fontSize: 15,
        flex: 1,
    },
    navRowChevron: {
        marginLeft: "auto" as any,
    },
})
