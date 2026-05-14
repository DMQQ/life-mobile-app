import Text from "@/components/ui/Text/Text"
import ValidatedInput from "@/components/ui/ValidatedInput"
import Colors from "@/constants/Colors"
import { Feather } from "@expo/vector-icons"
import { gql, useMutation } from "@apollo/client"
import { useFormik } from "formik"
import { useLayoutEffect, useState } from "react"
import { Pressable, ScrollView, StyleSheet, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Feedback from "react-native-haptic-feedback"
import * as yup from "yup"
import CategorySelector from "../../components/CreateExpense/CategorySelectorView"
import { CategoryIcon, Icons } from "../../components/Expense/ExpenseIcon"
import GroupSelector from "@/components/ui/GroupSelector"

const validationSchema = yup.object().shape({
    category: yup.string().required("Please select a category"),
    amount: yup
        .number()
        .typeError("Please enter a valid number")
        .positive("Amount must be greater than 0")
        .min(0.01, "Minimum amount is 0.01 zł")
        .max(999999, "Maximum amount is 999,999 zł")
        .required("Spending limit is required"),
    type: yup.string().required("Please select a time period"),
})

const GET_LIMITS = gql`
    query Limits($range: String!, $date: String) {
        limits(range: $range, date: $date) {
            id
            category
            amount
            current
        }
    }
`

export default function SpendingLimitsCreate({ navigation }: any) {
    const [categoryPicker, setCategoryPicker] = useState(false)

    const [createLimit] = useMutation(
        gql`
            mutation CreateLimit($input: CreateLimit!) {
                createLimit(input: $input) {
                    id
                }
            }
        `,
        {
            onCompleted: () => {
                navigation.goBack()
                Feedback.trigger("impactLight")
            },
            onError: (error) => {
                console.log("Error creating limit:", JSON.stringify(error, null, 2))
            },
            refetchQueries: ["daily", "weekly", "monthly", "yearly"].map((item) => ({
                query: GET_LIMITS,
                variables: { range: item },
            })),
        },
    )

    const formik = useFormik({
        validationSchema,
        initialValues: { category: "", amount: "", type: "monthly" },
        onSubmit: (values) => {
            createLimit({
                variables: {
                    input: {
                        category: values.category,
                        amount: parseFloat(values.amount),
                        type: values.type,
                    },
                },
            })
        },
    })

    const valid = formik.isValid && formik.dirty

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Pressable onPress={() => formik.handleSubmit()} disabled={!valid} hitSlop={12} style={styles.saveBtn}>
                    <Text style={[styles.saveBtnText, !valid && styles.saveBtnDisabled]}>Save</Text>
                </Pressable>
            ),
        })
    }, [navigation, valid])

    return (
        <SafeAreaView style={styles.container} edges={["bottom"]}>
            <ScrollView
                style={styles.content}
                contentContainerStyle={{ paddingBottom: 20, paddingTop: 24 }}
                keyboardDismissMode="on-drag"
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.subtitle}>
                    Set a limit to track your spending in a specific category over time. You'll get notifications when
                    you're close to reaching your limit.
                </Text>

                {categoryPicker ? (
                    <>
                        <View style={styles.categoryOpenSection}>
                            <Text style={styles.sectionTitle}>Category</Text>
                            <Text style={styles.helperText}>Select the category you want to limit spending for</Text>
                        </View>
                        <CategorySelector
                            current={formik.values.category}
                            dismiss={() => {
                                Feedback.trigger("impactLight")
                                setCategoryPicker(false)
                            }}
                            onPress={(category) => {
                                Feedback.trigger("impactLight")
                                formik.setFieldValue("category", category)
                                setCategoryPicker(false)
                            }}
                        />
                    </>
                ) : (
                    <>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Category</Text>
                            <Text style={styles.helperText}>Select the category you want to limit spending for</Text>
                            <ValidatedInput
                                formik={formik}
                                name="category"
                                placeholder="Select a category"
                                onPress={() => {
                                    Feedback.trigger("impactLight")
                                    setCategoryPicker(true)
                                }}
                                editable={false}
                                style={formik.values.category ? styles.selectedCategoryInput : undefined}
                                left={
                                    formik.values.category ? (
                                        <CategoryIcon
                                            category={formik.values.category as keyof typeof Icons}
                                            type="expense"
                                            size={20}
                                        />
                                    ) : (
                                        <Feather name="chevron-down" size={20} color={Colors.foreground} />
                                    )
                                }
                            />
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Spending limit</Text>
                            <Text style={styles.helperText}>
                                Enter the maximum amount you want to spend in this category
                            </Text>
                            <ValidatedInput
                                formik={formik}
                                name="amount"
                                placeholder="0.00 zł"
                                keyboardType="numeric"
                                onChange={(event) => {
                                    const cleanedText = event.nativeEvent.text.replace(/[^0-9.]/g, "")
                                    formik.setFieldValue("amount", cleanedText)
                                }}
                                left={
                                    <View style={styles.spendingLimitIcon}>
                                        <Feather name="credit-card" size={20} color={Colors.secondary} />
                                    </View>
                                }
                            />
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Time period</Text>
                            <Text style={styles.helperText}>Choose how often you want this limit to reset</Text>
                            <View style={styles.selectorContainer}>
                                <GroupSelector
                                    options={["daily", "weekly", "monthly", "yearly"].map((v) => ({
                                        value: v,
                                        label: v.slice(0, 1).toUpperCase() + v.slice(1),
                                    }))}
                                    value={formik.values.type}
                                    onChange={(type) => {
                                        Feedback.trigger("impactLight")
                                        formik.setFieldValue("type", type)
                                    }}
                                />
                            </View>
                        </View>
                    </>
                )}
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
    categoryOpenSection: {
        marginBottom: 0,
    },
    selectedCategoryInput: {
        backgroundColor: Colors.primary_lighter,
        borderColor: Colors.secondary,
        borderWidth: 1,
    },
    spendingLimitIcon: {
        paddingLeft: 8,
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
    selectorContainer: {
        marginTop: 8,
    },
})
