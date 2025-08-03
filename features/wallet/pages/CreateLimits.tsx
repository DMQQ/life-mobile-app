import { AnimatedSelector } from "@/components"
import Button2 from "@/components/ui/Button/Button2"
import IconButton from "@/components/ui/IconButton/IconButton"
import Text from "@/components/ui/Text/Text"
import ValidatedInput from "@/components/ui/ValidatedInput"
import Colors from "@/constants/Colors"
import { gql, useMutation } from "@apollo/client"
import { AntDesign } from "@expo/vector-icons"
import { Formik } from "formik"
import { useState } from "react"
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native"
import Feedback from "react-native-haptic-feedback"
import * as yup from "yup"
import CategorySelector from "../components/CreateExpense/CategorySelectorView"
import { CategoryIcon, Icons } from "../components/Expense/ExpenseIcon"
import { WalletScreens } from "../Main"

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

export default function CreateLimits({ navigation }: WalletScreens<"CreateLimits">) {
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

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topBar}>
                <IconButton
                    icon={<AntDesign name="close" size={24} color={Colors.foreground} />}
                    onPress={() => navigation.goBack()}
                />
                <Text variant="title" style={styles.modalTitle}>
                    Create Spending Limit
                </Text>
                <View style={{ width: 44 }} />
            </View>

            <Formik
                validationSchema={validationSchema}
                initialValues={{ category: "", amount: "", type: "monthly" }}
                onSubmit={(values) => {
                    createLimit({
                        variables: {
                            input: {
                                category: values.category,
                                amount: parseFloat(values.amount),
                                type: values.type,
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
                                Set a limit to track your spending in a specific category over time. You'll get
                                notifications when you're close to reaching your limit.
                            </Text>

                            {categoryPicker ? (
                                <>
                                    <View style={styles.categoryOpenSection}>
                                        <Text style={styles.sectionTitle}>Category</Text>
                                        <Text style={styles.helperText}>
                                            Select the category you want to limit spending for
                                        </Text>
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
                                        <Text style={styles.helperText}>
                                            Select the category you want to limit spending for
                                        </Text>
                                        <ValidatedInput
                                            formik={formik}
                                            name="category"
                                            placeholder="Select a category"
                                            onPress={() => {
                                                Feedback.trigger("impactLight")
                                                setCategoryPicker(true)
                                            }}
                                            editable={false}
                                            style={
                                                formik.values.category ? styles.selectedCategoryInput : undefined
                                            }
                                            left={
                                                formik.values.category ? (
                                                    <CategoryIcon
                                                        category={formik.values.category as keyof typeof Icons}
                                                        type="expense"
                                                        size={20}
                                                    />
                                                ) : (
                                                    <AntDesign name="down" size={20} color={Colors.foreground} />
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
                                                    <AntDesign name="wallet" size={20} color={Colors.secondary} />
                                                </View>
                                            }
                                        />
                                    </View>

                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>Time period</Text>
                                        <Text style={styles.helperText}>
                                            Choose how often you want this limit to reset
                                        </Text>
                                        <View style={styles.selectorContainer}>
                                            <AnimatedSelector
                                                items={["daily", "weekly", "monthly", "yearly"]}
                                                selectedItem={formik.values.type}
                                                onItemSelect={(type) => {
                                                    Feedback.trigger("impactLight")
                                                    formik.setFieldValue("type", type)
                                                }}
                                                renderItem={(item) => item.charAt(0).toUpperCase() + item.slice(1)}
                                                containerStyle={styles.animatedSelector}
                                            />
                                        </View>
                                    </View>
                                </>
                            )}
                        </ScrollView>

                        {!categoryPicker && (
                            <View style={styles.bottomButtonContainer}>
                                <Button2
                                    disabled={!(formik.isValid && formik.dirty)}
                                    onPress={() => formik.handleSubmit()}
                                    style={styles.createButton}
                                >
                                    Create Limit
                                </Button2>
                            </View>
                        )}
                    </>
                )}
            </Formik>
        </SafeAreaView>
    )
}

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
    animatedSelector: {
        backgroundColor: Colors.primary_lighter,
        borderRadius: 12,
        padding: 4,
    },
    bottomButtonContainer: {
        padding: 15,
        paddingBottom: 15,
    },
    createButton: {
        width: "100%",
        borderRadius: 100,
    },
})
