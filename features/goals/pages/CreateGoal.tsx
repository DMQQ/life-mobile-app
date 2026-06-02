import { FONTS } from "@/constants/Fonts"
import { Feather } from "@expo/vector-icons"
import { Formik, FormikProps } from "formik"
import { useMemo } from "react"
import { ScrollView, StyleSheet, View } from "react-native"
import { Slider, Host, Menu, Button } from "@expo/ui/swift-ui"
import * as yup from "yup"
import ValidatedInput from "@/components/ui/ValidatedInput"
import ModalHeader from "@/components/ui/ModalHeader"
import GroupSelector from "@/components/ui/GroupSelector"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import Ripple from "react-native-material-ripple"
import { useGoal, useGetGoal } from "../hooks/hooks"
import GlassView from "@/components/ui/GlassView"

interface FormValues {
    name: string
    icon: string
    goalType: "REACH" | "LIMIT"
    target: number
    unit: string
}

const validationSchema = yup.object().shape({
    name: yup.string().required("Goal name is required"),
    icon: yup.string().required("Icon is required"),
    goalType: yup.string().oneOf(["REACH", "LIMIT"]).required(),
    target: yup.number().min(1, "Must be at least 1").required("Target is required"),
    unit: yup.string().optional(),
})

const UNIT_CONFIG: Record<string, { label: string; sliderMax: number }> = {
    min: { label: "minutes", sliderMax: 480 },
    hours: { label: "hours", sliderMax: 24 },
    km: { label: "kilometers", sliderMax: 42 },
    miles: { label: "miles", sliderMax: 26 },
    steps: { label: "steps", sliderMax: 50000 },
    pages: { label: "pages", sliderMax: 500 },
    reps: { label: "reps", sliderMax: 100 },
    sets: { label: "sets", sliderMax: 20 },
    cups: { label: "cups", sliderMax: 12 },
    glasses: { label: "glasses", sliderMax: 12 },
    liters: { label: "liters", sliderMax: 5 },
    ml: { label: "milliliters", sliderMax: 3000 },
    kg: { label: "kilograms", sliderMax: 200 },
    lbs: { label: "pounds", sliderMax: 440 },
    cal: { label: "calories", sliderMax: 5000 },
    tasks: { label: "tasks", sliderMax: 50 },
    sessions: { label: "sessions", sliderMax: 10 },
    times: { label: "times", sliderMax: 50 },
}

function getSliderMax(unit: string, goalType: "REACH" | "LIMIT"): number {
    if (unit && UNIT_CONFIG[unit]) return UNIT_CONFIG[unit].sliderMax
    return goalType === "LIMIT" ? 24 : 100
}

const GOAL_TYPE_OPTIONS = [
    { label: "Reach Target", value: "REACH" as const },
    { label: "Stay Under Limit", value: "LIMIT" as const },
]

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
            }
        }
        return {
            name: "",
            icon: "",
            goalType: "REACH",
            target: 1,
            unit: "",
        }
    }, [isEdit, goal])

    const onSubmit = (values: FormValues) => {
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
            {(f: FormikProps<FormValues>) => (
                <View style={styles.container}>
                    <ModalHeader
                        onClose={() => navigation.goBack()}
                        onSave={f.handleSubmit}
                        title={isEdit ? "Edit Goal" : "New Goal"}
                        saveLabel="Save"
                        dirty={f.dirty}
                    />

                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.iconSection}>
                            <Ripple
                                style={[styles.iconButton, f.values.icon ? styles.iconButtonSelected : {}]}
                                onPress={() =>
                                    navigation.navigate("IconPicker", {
                                        onSelectIcon: (icon: string) => f.setFieldValue("icon", icon),
                                        selectedIcon: f.values.icon,
                                    })
                                }
                            >
                                <Feather
                                    name={(f.values.icon || "plus-circle") as any}
                                    size={40}
                                    color={f.values.icon ? Colors.foreground : Colors.secondary}
                                />
                            </Ripple>
                            <Text variant="caption" style={styles.iconHint}>
                                {f.values.icon ? "Tap to change icon" : "Tap to choose an icon"}
                            </Text>
                        </View>

                        <ValidatedInput
                            showLabel
                            label="Name"
                            name="name"
                            placeholder="What do you want to track?"
                            formik={f}
                            containerStyle={styles.input}
                        />

                        <View style={styles.typeSection}>
                            <Text variant="body" style={styles.label}>
                                Goal Type
                            </Text>
                            <GroupSelector
                                options={GOAL_TYPE_OPTIONS}
                                value={f.values.goalType}
                                onChange={(v) => f.setFieldValue("goalType", v)}
                            />
                            <Text variant="caption" style={styles.typeHint}>
                                {f.values.goalType === "REACH"
                                    ? "Green when you meet or exceed your target."
                                    : "Green when you stay under your limit. Red if exceeded."}
                            </Text>
                        </View>

                        <View style={styles.input}>
                            <View
                                style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
                            >
                                <Text variant="body" style={styles.label}>
                                    Value: {f.values.target}
                                    {f.values.unit ? ` ${f.values.unit}` : ""}
                                </Text>
                                <View style={{ width: 90 }}>
                                    <Host matchContents>
                                        <Menu
                                            label={
                                                f.values.unit
                                                    ? UNIT_CONFIG[f.values.unit]?.label || f.values.unit
                                                    : "Select unit"
                                            }
                                        >
                                            {Object.entries(UNIT_CONFIG).map(([key, { label }]) => (
                                                <Button
                                                    key={key}
                                                    label={label}
                                                    onPress={() => f.setFieldValue("unit", key)}
                                                />
                                            ))}
                                        </Menu>
                                    </Host>
                                </View>
                            </View>
                            <GlassView style={{ marginTop: 10, padding: 15, borderRadius: 100 }}>
                                <View>
                                    <Host matchContents useViewportSizeMeasurement>
                                        <Slider
                                            value={f.values.target}
                                            min={1}
                                            max={getSliderMax(f.values.unit, f.values.goalType)}
                                            step={1}
                                            onValueChange={(v) => f.setFieldValue("target", v)}
                                            modifiers={[]}
                                        />
                                    </Host>
                                </View>
                            </GlassView>
                        </View>

                        {isEdit ? (
                            <View style={styles.input}>
                                <Text variant="body" style={styles.label}>
                                    Unit
                                </Text>
                                <View style={styles.unitReadonly}>
                                    <Text variant="body" style={styles.unitReadonlyText}>
                                        {f.values.unit || "(none)"}
                                    </Text>
                                </View>
                                <Text variant="caption" style={styles.typeHint}>
                                    Unit cannot be changed after creation.
                                </Text>
                            </View>
                        ) : null}

                        <View style={styles.bottomSpacer} />
                    </ScrollView>
                </View>
            )}
        </Formik>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingTop: 60,
    },
    iconSection: {
        alignItems: "center",
        marginBottom: 20,
        marginTop: 10,
    },
    iconButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.primary_light,
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.1)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },
    iconButtonSelected: {
        backgroundColor: Colors.secondary,
        borderColor: Colors.secondary,
    },
    iconHint: {
        color: Colors.foreground_secondary,
    },
    input: {
        marginBottom: 18,
    },
    typeSection: {
        marginBottom: 18,
    },
    label: {
        color: Colors.foreground,
        fontFamily: FONTS.semibold,
        marginBottom: 8,
    },
    typeHint: {
        color: Colors.foreground_secondary,
        marginTop: 8,
    },
    sliderHost: {
        flex: 1,
        marginTop: 4,
    },
    menuHost: {
        height: 44,
    },
    unitReadonly: {
        padding: 15,
        borderRadius: 15,
        backgroundColor: Colors.primary_lighter,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
    },
    unitReadonlyText: {
        color: Colors.foreground_secondary,
    },
    bottomSpacer: {
        height: 60,
    },
})
