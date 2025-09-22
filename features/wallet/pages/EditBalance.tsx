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
import DateTimePicker from "react-native-modal-datetime-picker"
import * as yup from "yup"
import useEditWallet from "../hooks/useEditWallet"
import { WalletScreens } from "../Main"
import { SafeAreaView } from "react-native-safe-area-context"

const validationSchema = yup.object().shape({
    balance: yup
        .number()
        .typeError("Please enter a valid number")
        .min(0, "Balance cannot be negative")
        .max(999999999, "Maximum balance is 999,999,999 zł")
        .required("Balance amount is required"),
    monthlySalary: yup
        .number()
        .typeError("Please enter a valid number")
        .min(0, "Salary cannot be negative")
        .max(999999999, "Maximum salary is 999,999,999 zł"),
    paycheckDate: yup
        .number()
        .typeError("Please enter a valid day")
        .min(1, "Day must be between 1 and 31")
        .max(31, "Day must be between 1 and 31"),
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

    const [isDatePickerVisible, setDatePickerVisibility] = useState(false)
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)

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
                            balance: parseFloat(values.balance),
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
                                        // Only allow positive numbers and decimal points
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
                                            <AntDesign name="creditcard" size={20} color={Colors.secondary} />
                                        </View>
                                    }
                                />
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Paycheck date</Text>
                                <Text style={styles.helperText}>Select the date you receive your next paycheck</Text>
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    onPress={() => setDatePickerVisibility(true)}
                                    style={{
                                        borderWidth: 2,
                                        borderColor: Color(Colors.primary).lighten(0.5).hex(),
                                        borderRadius: 12,
                                        paddingVertical: 15,
                                        paddingHorizontal: 15,
                                        flexDirection: "row",
                                        alignItems: "center",
                                        backgroundColor: Colors.primary_light,
                                    }}
                                >
                                    <View style={styles.calendarIcon}>
                                        <AntDesign name="calendar" size={20} color={Colors.secondary} />
                                    </View>
                                    <Text
                                        style={{
                                            color: selectedDate ? Colors.foreground : Colors.foreground_secondary,
                                            fontSize: 16,
                                            marginLeft: 8,
                                        }}
                                    >
                                        {selectedDate
                                            ? dayjs(selectedDate).format("YYYY-MM-DD")
                                            : "Select paycheck date"}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <DateTimePicker
                                isVisible={isDatePickerVisible}
                                mode="date"
                                onConfirm={(date) => {
                                    setSelectedDate(date)
                                    setDatePickerVisibility(false)
                                    formik.setFieldValue("paycheckDate", date.toISOString())
                                }}
                                onCancel={() => setDatePickerVisibility(false)}
                                minimumDate={new Date()}
                                isDarkModeEnabled={true}
                                textColor={Colors.foreground}
                                accentColor={Colors.secondary}
                            />
                        </ScrollView>

                        <View style={styles.bottomButtonContainer}>
                            <Button2
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
                            </Button2>
                        </View>
                    </>
                )}
            </Formik>
        </SafeAreaView>
    )
}
