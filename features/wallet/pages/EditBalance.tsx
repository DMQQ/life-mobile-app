import Button2 from "@/components/ui/Button/Button2"
import IconButton from "@/components/ui/IconButton/IconButton"
import Text from "@/components/ui/Text/Text"
import Input from "@/components/ui/TextInput/TextInput"
import Colors from "@/constants/Colors"
import { AntDesign, Ionicons } from "@expo/vector-icons"
import Color from "color"
import dayjs from "dayjs"
import { Formik } from "formik"
import { useState } from "react"
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native"
import Feedback from "react-native-haptic-feedback"
import DatePicker from "@/components/DatePicker"
import * as yup from "yup"
import useEditWallet from "../hooks/useEditWallet"
import { WalletScreens } from "../Main"
import { SafeAreaView } from "react-native-safe-area-context"
import { Button } from "@/components"
import AnimatedSelector from "@/components/ui/AnimatedSelector"

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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    topBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 15,
    },
    modalTitle: {
        textAlign: "center",
        fontSize: 18,
        fontWeight: "600",
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
    balanceIcon: {
        paddingLeft: 8,
    },
    calendarIcon: {
        paddingLeft: 4,
        paddingRight: 12,
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
    bottomButtonContainer: {
        padding: 15,
        paddingBottom: 15,
    },
    saveButton: {
        width: "100%",
        borderRadius: 100,
    },
})

export default function EditBalance({ navigation }: WalletScreens<"EditBalance">) {
    const { editBalance, loading } = useEditWallet(() => {
        navigation.goBack()
    })

    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [paycheckOption, setPaycheckOption] = useState<"start" | "end" | "custom">("start")

    const getPaycheckDate = () => {
        if (paycheckOption === "start") {
            const startOfMonth = dayjs().startOf("month").toDate()
            return startOfMonth.toISOString()
        } else if (paycheckOption === "end") {
            const endOfMonth = dayjs().endOf("month").toDate()
            return endOfMonth.toISOString()
        } else if (paycheckOption === "custom" && selectedDate) {
            return selectedDate.toISOString()
        }
        return null
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topBar}>
                <IconButton
                    icon={<AntDesign name="close" size={24} color={Colors.foreground} />}
                    onPress={() => navigation.goBack()}
                />
                <Text variant="title" style={styles.modalTitle}>
                    Edit balance
                </Text>
                <View style={{ width: 44 }} />
            </View>

            <Formik
                validationSchema={validationSchema}
                initialValues={{ balance: "", monthlySalary: "", paycheckDate: "" }}
                onSubmit={async (values) => {
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
                }}
            >
                {(formik) => (
                    <>
                        <ScrollView
                            style={styles.content}
                            contentContainerStyle={{ paddingBottom: 20 }}
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
                                        const cleanedText = text.replace(/[^0-9.]/g, "")
                                        formik.setFieldValue("balance", cleanedText)
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
                                        <View style={styles.balanceIcon}>
                                            <AntDesign name="wallet" size={20} color={Colors.secondary} />
                                        </View>
                                    }
                                />
                            </View>

                            <View style={styles.warningBanner}>
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <Ionicons
                                        name="warning"
                                        size={20}
                                        color={Colors.error}
                                        style={{ marginRight: 8 }}
                                    />
                                    <Text
                                        style={[
                                            styles.sectionTitle,
                                            { color: Colors.error, fontSize: 16, marginBottom: 0 },
                                        ]}
                                    >
                                        Important warning
                                    </Text>
                                </View>
                                <Text
                                    style={[
                                        styles.helperText,
                                        { color: Colors.error, fontSize: 13, marginBottom: 0, marginTop: 4 },
                                    ]}
                                >
                                    This action cannot be undone. Make sure the amount is correct. This will set your
                                    balance to the value you enter. It will not affect your expenses or income.
                                </Text>
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Monthly salary</Text>
                                <Text style={styles.helperText}>Enter your monthly salary amount (optional)</Text>
                                <Input
                                    value={formik.values.monthlySalary}
                                    onChangeText={(text: string) => {
                                        // Only allow positive numbers and decimal points
                                        const cleanedText = text.replace(/[^0-9.]/g, "")
                                        formik.setFieldValue("monthlySalary", cleanedText)
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
                                        <View style={styles.balanceIcon}>
                                            <AntDesign name="credit-card" size={20} color={Colors.secondary} />
                                        </View>
                                    }
                                />
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Paycheck date</Text>
                                <Text style={styles.helperText}>Select when you receive your paycheck</Text>

                                <AnimatedSelector
                                    textStyle={{ fontSize: 11 }}
                                    items={["start", "end", "custom"] as const}
                                    selectedItem={paycheckOption}
                                    onItemSelect={(item) => {
                                        setPaycheckOption(item)
                                        if (item !== "custom") setSelectedDate(null)
                                    }}
                                    renderItem={(item) => {
                                        const labels = {
                                            start: "Start of month",
                                            end: "End of month",
                                            custom: "Custom date",
                                        }
                                        return labels[item]
                                    }}
                                    containerStyle={{
                                        marginBottom: 12,
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

                        <View style={styles.bottomButtonContainer}>
                            <Button
                                disabled={!(formik.isValid && formik.dirty) || loading}
                                onPress={() => formik.handleSubmit()}
                                style={styles.saveButton}
                                icon={
                                    loading && (
                                        <ActivityIndicator
                                            style={{ marginHorizontal: 10 }}
                                            size="small"
                                            color={Colors.foreground}
                                        />
                                    )
                                }
                            >
                                Save balance
                            </Button>
                        </View>
                    </>
                )}
            </Formik>
        </SafeAreaView>
    )
}
