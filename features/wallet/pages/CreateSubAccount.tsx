import { Button } from "@/components"
import IconButton from "@/components/ui/IconButton/IconButton"
import Text from "@/components/ui/Text/Text"
import Input from "@/components/ui/TextInput/TextInput"
import Colors, { secondary_candidates } from "@/constants/Colors"
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons"
import Color from "color"
import { Formik } from "formik"
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native"
import Feedback from "react-native-haptic-feedback"
import { SafeAreaView } from "react-native-safe-area-context"
import * as yup from "yup"
import { useCreateSubAccount, useUpdateSubAccount } from "../hooks/useSubAccounts"
import { router, useLocalSearchParams } from "expo-router"
import GlassView from "@/components/ui/GlassView"
import IconSaveButton from "@/components/ui/Button/IconSaveButton"

const ICONS = [
    "credit-card",
    "bank",
    "cash",
    "piggy-bank",
    "wallet",
    "briefcase",
    "chart-line",
    "shopping",
    "car",
    "home",
    "airplane",
    "heart",
    "gift",
    "food",
    "school",
]

const schema = yup.object().shape({
    name: yup.string().required("Name is required").max(30, "Max 30 characters"),
    description: yup.string().max(100, "Max 100 characters"),
    balance: yup
        .string()
        .test("is-number", "Enter a valid number", (v) => !v || !isNaN(Number(v)))
        .test("min", "Cannot be negative", (v) => !v || Number(v) >= 0),
    color: yup.string().required(),
    icon: yup.string().required(),
})

export default function CreateSubAccount() {
    const { editSubAccount: editing } = useLocalSearchParams<{ editSubAccount?: any }>()

    const [createSubAccount, { loading: creating }] = useCreateSubAccount(() => {
        Feedback.trigger("impactLight")
        router.back()
    })

    const [updateSubAccount, { loading: updating, error }] = useUpdateSubAccount(() => {
        Feedback.trigger("impactLight")
        router.back()
    })

    const loading = creating || updating

    const initialValues = {
        name: editing?.name ?? "",
        description: editing?.description ?? "",
        balance: editing?.balance != null ? String(editing.balance) : "",
        color: editing?.color ?? secondary_candidates[0],
        icon: editing?.icon ?? "credit-card",
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topBar}>
                <GlassView style={{ borderRadius: 100, padding: 7.5 }}>
                    <IconButton
                        icon={<AntDesign name="close" size={20} color={Colors.foreground} />}
                        onPress={() => router.back()}
                    />
                </GlassView>
                <Text variant="title" style={styles.title}>
                    {editing ? "Edit Sub account" : "New Sub account"}
                </Text>
                <View style={{ width: 44 }} />
            </View>

            <Formik
                validationSchema={schema}
                initialValues={initialValues}
                onSubmit={(values) => {
                    if (editing) {
                        updateSubAccount({
                            variables: {
                                id: editing.id,
                                input: {
                                    name: values.name,
                                    description: values.description || undefined,
                                    color: values.color,
                                    icon: values.icon,
                                    balance: values.balance ? parseFloat(values.balance) : 0,
                                },
                            },
                        })
                    } else {
                        createSubAccount({
                            variables: {
                                input: {
                                    name: values.name,
                                    description: values.description || undefined,
                                    balance: values.balance ? parseFloat(values.balance) : 0,
                                    color: values.color,
                                    icon: values.icon,
                                },
                            },
                        })
                    }
                }}
            >
                {(f) => (
                    <>
                        <IconSaveButton
                            onPress={() => f.handleSubmit()}
                            disabled={!(f.isValid && f.dirty) || loading}
                            loading={loading}
                        />
                        <ScrollView
                            style={styles.content}
                            contentContainerStyle={{ paddingBottom: 24 }}
                            keyboardDismissMode="on-drag"
                            showsVerticalScrollIndicator={false}
                        >
                            <Input
                                value={f.values.name}
                                onChangeText={f.handleChange("name")}
                                onBlur={f.handleBlur("name")}
                                placeholder="Account name"
                                error={!!(f.errors.name && f.touched.name)}
                                helperText={f.touched.name ? f.errors.name?.toString() : undefined}
                                left={
                                    <View style={styles.inputIcon}>
                                        <AntDesign name="tag" size={18} color={Colors.secondary} />
                                    </View>
                                }
                            />

                            <Input
                                value={f.values.description}
                                onChangeText={f.handleChange("description")}
                                onBlur={f.handleBlur("description")}
                                placeholder="Description (optional)"
                                error={!!(f.errors.description && f.touched.description)}
                                helperText={f.touched.description ? f.errors.description?.toString() : undefined}
                                left={
                                    <View style={styles.inputIcon}>
                                        <AntDesign name="info-circle" size={18} color={Colors.secondary} />
                                    </View>
                                }
                            />

                            <Input
                                value={f.values.balance}
                                onChangeText={(t) => f.setFieldValue("balance", t.replace(/[^0-9.]/g, ""))}
                                onBlur={f.handleBlur("balance")}
                                placeholder="Initial balance (optional)"
                                keyboardType="numeric"
                                error={!!(f.errors.balance && f.touched.balance)}
                                helperText={f.touched.balance ? f.errors.balance?.toString() : undefined}
                                left={
                                    <View style={styles.inputIcon}>
                                        <AntDesign name="wallet" size={18} color={Colors.secondary} />
                                    </View>
                                }
                            />

                            <Text style={styles.label}>Color</Text>
                            <View style={styles.colorGrid}>
                                {secondary_candidates.map((c) => (
                                    <TouchableOpacity
                                        key={c}
                                        activeOpacity={0.8}
                                        onPress={() => f.setFieldValue("color", c)}
                                        style={[
                                            styles.colorDot,
                                            { backgroundColor: c },
                                            f.values.color === c && styles.colorDotSelected,
                                        ]}
                                    />
                                ))}
                            </View>

                            <Text style={styles.label}>Icon</Text>
                            <View style={styles.iconGrid}>
                                {ICONS.map((ic) => (
                                    <TouchableOpacity
                                        key={ic}
                                        activeOpacity={0.8}
                                        onPress={() => f.setFieldValue("icon", ic)}
                                        style={[
                                            styles.iconBtn,
                                            f.values.icon === ic && {
                                                backgroundColor: Color(f.values.color).alpha(0.25).string(),
                                                borderColor: f.values.color,
                                            },
                                        ]}
                                    >
                                        <MaterialCommunityIcons
                                            name={ic as any}
                                            size={22}
                                            color={f.values.icon === ic ? f.values.color : Colors.foreground_secondary}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
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
    title: {
        fontSize: 18,
        fontWeight: "600",
    },
    content: {
        flex: 1,
        padding: 15,
    },
    inputIcon: {
        paddingLeft: 8,
    },
    label: {
        color: Colors.foreground_secondary,
        fontSize: 14,
        marginBottom: 10,
        marginTop: 16,
    },
    colorGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    colorDot: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    colorDotSelected: {
        borderWidth: 3,
        borderColor: Colors.foreground,
    },
    iconGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    iconBtn: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.primary_light,
        borderWidth: 1.5,
        borderColor: "transparent",
    },
    footer: {
        padding: 15,
        paddingBottom: 15,
    },
    btn: {
        width: "100%",
        borderRadius: 100,
    },
})
