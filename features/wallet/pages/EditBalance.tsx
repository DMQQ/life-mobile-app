import Text from "@/components/ui/Text/Text"
import Input from "@/components/ui/TextInput/TextInput"
import IconButton from "@/components/ui/IconButton/IconButton"
import Colors from "@/constants/Colors"
import { Feather } from "@expo/vector-icons"
import dayjs from "dayjs"
import { useFormik } from "formik"
import { useLayoutEffect, useState } from "react"
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native"
import Feedback from "react-native-haptic-feedback"
import DatePicker from "@/components/DatePicker"
import * as yup from "yup"
import useEditWallet from "../hooks/useEditWallet"
import { router, useNavigation } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import AnimatedSelector from "@/components/ui/AnimatedSelector"
import GroupSelector from "@/components/ui/GroupSelector"

const validationSchema = yup.object().shape({
    balance: yup
        .string()
        .test("is-number", "Please enter a valid number", (value) => {
            if (!value || value === "") return true
            return !isNaN(Number(value))
        })
        .test("min-value", "Balance cannot be negative", (value) => {
            if (!value || value === "") return true
            return Number(value) >= 0
        })
        .test("max-value", "Maximum balance is 999,999,999 zł", (value) => {
            if (!value || value === "") return true
            return Number(value) <= 999999999
        }),
    monthlySalary: yup
        .string()
        .test("is-number", "Please enter a valid number", (value) => {
            if (!value || value === "") return true
            return !isNaN(Number(value))
        })
        .test("min-value", "Salary cannot be negative", (value) => {
            if (!value || value === "") return true
            return Number(value) >= 0
        })
        .test("max-value", "Maximum salary is 999,999,999 zł", (value) => {
            if (!value || value === "") return true
            return Number(value) <= 999999999
        }),
    paycheckDate: yup.string(),
})

export default function EditBalance() {
    const navigation = useNavigation()
    const { editBalance, loading } = useEditWallet(() => {
        router.back()
    })

    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [paycheckOption, setPaycheckOption] = useState<"start" | "end" | "custom">("start")

    const getPaycheckDate = () => {
        if (paycheckOption === "start") return dayjs().startOf("month").toDate().toISOString()
        if (paycheckOption === "end") return dayjs().endOf("month").toDate().toISOString()
        if (paycheckOption === "custom" && selectedDate) return selectedDate.toISOString()
        return null
    }

    const formik = useFormik({
        validationSchema,
        initialValues: { balance: "", monthlySalary: "", paycheckDate: "" },
        onSubmit: async (values) => {
            Feedback.trigger("impactLight")
            await editBalance({
                variables: {
                    input: {
                        amount: values.balance && values.balance.trim() !== "" ? parseInt(values.balance) : null,
                        paycheck:
                            values.monthlySalary && values.monthlySalary.trim() !== ""
                                ? parseFloat(values.monthlySalary)
                                : null,
                        paycheckDate: getPaycheckDate(),
                    },
                },
            })
        },
    })

    const valid = formik.isValid && formik.dirty

    useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
                <IconButton
                    icon={<Feather name="x" size={20} color={Colors.foreground} />}
                    onPress={() => router.back()}
                />
            ),
            headerRight: () => (
                <Pressable
                    onPress={() => formik.handleSubmit()}
                    disabled={!valid || loading}
                    hitSlop={12}
                    style={styles.saveBtn}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color={Colors.secondary} />
                    ) : (
                        <Text style={[styles.saveBtnText, (!valid || loading) && styles.saveBtnDisabled]}>Save</Text>
                    )}
                </Pressable>
            ),
        })
    }, [navigation, valid, loading])

    return (
        <SafeAreaView style={styles.container} edges={["bottom"]}>
            <ScrollView
                style={styles.content}
                contentContainerStyle={{ paddingBottom: 20, paddingTop: 24 }}
                keyboardDismissMode="on-drag"
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.subtitle}>
                    Enter your current balance amount. This will update your wallet balance.
                </Text>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Balance amount</Text>
                    <Text style={styles.helperText}>Enter the current amount you have in your wallet</Text>
                    <Input
                        value={formik.values.balance}
                        onChangeText={(text: string) => {
                            formik.setFieldValue("balance", text.replace(/[^0-9.]/g, ""))
                        }}
                        onBlur={formik.handleBlur("balance")}
                        placeholder="0.00 zł"
                        keyboardType="numeric"
                        error={!!(formik.errors.balance && formik.touched.balance)}
                        helperText={
                            formik.errors.balance && formik.touched.balance
                                ? formik.errors.balance.toString()
                                : undefined
                        }
                        left={
                            <View style={styles.inputIcon}>
                                <Feather name="credit-card" size={20} color={Colors.secondary} />
                            </View>
                        }
                    />
                </View>

                <View style={styles.warningBanner}>
                    <View style={styles.warningRow}>
                        <Feather name="alert-triangle" size={20} color={Colors.error} style={{ marginRight: 8 }} />
                        <Text style={styles.warningTitle}>Important warning</Text>
                    </View>
                    <Text style={styles.warningText}>
                        This action cannot be undone. Make sure the amount is correct. This will set your balance to the
                        value you enter. It will not affect your expenses or income.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Monthly salary</Text>
                    <Text style={styles.helperText}>Enter your monthly salary amount (optional)</Text>
                    <Input
                        value={formik.values.monthlySalary}
                        onChangeText={(text: string) => {
                            formik.setFieldValue("monthlySalary", text.replace(/[^0-9.]/g, ""))
                        }}
                        onBlur={formik.handleBlur("monthlySalary")}
                        placeholder="0.00 zł"
                        keyboardType="numeric"
                        error={!!(formik.errors.monthlySalary && formik.touched.monthlySalary)}
                        helperText={
                            formik.errors.monthlySalary && formik.touched.monthlySalary
                                ? formik.errors.monthlySalary.toString()
                                : undefined
                        }
                        left={
                            <View style={styles.inputIcon}>
                                <Feather name="dollar-sign" size={20} color={Colors.secondary} />
                            </View>
                        }
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Paycheck date</Text>
                    <Text style={styles.helperText}>Select when you receive your paycheck</Text>

                    <GroupSelector
                        options={["start", "end", "custom"].map((v) => ({
                            value: v,
                            label: v.slice(0, 1).toUpperCase() + v.slice(1),
                        }))}
                        value={paycheckOption}
                        onChange={(item) => {
                            setPaycheckOption(item)
                            if (item !== "custom") setSelectedDate(null)
                        }}
                    />

                    {paycheckOption === "custom" && (
                        <DatePicker
                            mode="single"
                            placeholder={selectedDate ? dayjs(selectedDate).format("YYYY-MM-DD") : "Select custom date"}
                            dates={{ start: selectedDate ?? new Date(), end: selectedDate ?? new Date() }}
                            setDates={({ start }) => {
                                setSelectedDate(start)
                                formik.setFieldValue("paycheckDate", start.toISOString())
                            }}
                        />
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    saveBtn: {
        width: 60,
    },
    saveBtnText: {
        color: Colors.secondary,
        fontSize: 16,
        fontWeight: "600",
        textAlign: "center",
    },
    saveBtnDisabled: {
        opacity: 0.35,
    },
    content: {
        flex: 1,
        padding: 15,
    },
    subtitle: {
        color: Colors.foreground_secondary,
        fontSize: 15,
        marginBottom: 24,
        lineHeight: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        color: Colors.foreground,
        fontWeight: "600",
        fontSize: 18,
        marginBottom: 8,
    },
    helperText: {
        color: Colors.foreground_secondary,
        fontSize: 14,
        marginBottom: 12,
        lineHeight: 18,
    },
    inputIcon: {
        paddingLeft: 8,
    },
    warningBanner: {
        backgroundColor: Colors.error + "15",
        borderRadius: 12,
        padding: 12,
        marginTop: -16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: Colors.error,
    },
    warningRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
    },
    warningTitle: {
        color: Colors.error,
        fontSize: 16,
        fontWeight: "600",
    },
    warningText: {
        color: Colors.error,
        fontSize: 13,
        lineHeight: 18,
    },
})
