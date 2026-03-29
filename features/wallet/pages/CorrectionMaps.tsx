import Colors from "@/constants/Colors"
import Text from "@/components/ui/Text/Text"
import IconButton from "@/components/ui/IconButton/IconButton"
import Button from "@/components/ui/Button/Button"
import Input from "@/components/ui/TextInput/TextInput"
import SegmentedButtons from "@/components/ui/SegmentedButtons"
import { AntDesign } from "@expo/vector-icons"
import { useCallback, useEffect, useRef, useState } from "react"
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Feedback from "react-native-haptic-feedback"
import Color from "color"
import lowOpacity from "@/utils/functions/lowOpacity"
import Ripple from "react-native-material-ripple"
import CategorySelect from "../components/CreateExpense/CategorySelect"
import CorrectionMapItem from "../components/CorrectionMap/CorrectionMapItem"
import { useCorrectionMaps, type CorrectionMap } from "../hooks/useCorrectionMaps"
import { WalletScreens } from "../Main"
import GlassView from "@/components/ui/GlassView"

type MatchType = "shop" | "description" | "category" | "amount"
type OverrideType = "shop" | "category" | "description"

type FormValues = {
    matchShop: string
    matchDescription: string
    matchCategory: string
    matchAmountMin: string
    matchAmountMax: string
    overrideShop: string
    overrideCategory: string
    overrideDescription: string
}

type FormState = {
    matchType: MatchType | ""
    overrideTypes: OverrideType[]
    values: FormValues
}

const EMPTY: FormState = {
    matchType: "",
    overrideTypes: [],
    values: {
        matchShop: "",
        matchDescription: "",
        matchCategory: "",
        matchAmountMin: "",
        matchAmountMax: "",
        overrideShop: "",
        overrideCategory: "",
        overrideDescription: "",
    },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toInput(state: FormState) {
    const v = state.values
    return {
        matchShop: state.matchType === "shop" ? v.matchShop.trim() || null : null,
        matchDescription: state.matchType === "description" ? v.matchDescription.trim() || null : null,
        matchCategory: state.matchType === "category" ? v.matchCategory || null : null,
        matchAmountMin: state.matchType === "amount" && v.matchAmountMin ? parseFloat(v.matchAmountMin) : null,
        matchAmountMax: state.matchType === "amount" && v.matchAmountMax ? parseFloat(v.matchAmountMax) : null,
        overrideShop: state.overrideTypes.includes("shop") ? v.overrideShop.trim() || null : null,
        overrideCategory: state.overrideTypes.includes("category") ? v.overrideCategory || null : null,
        overrideDescription: state.overrideTypes.includes("description") ? v.overrideDescription.trim() || null : null,
    }
}

function isValid(state: FormState): boolean {
    if (!state.matchType || state.overrideTypes.length === 0) return false
    const v = state.values
    const matchFilled =
        (state.matchType === "shop" && !!v.matchShop.trim()) ||
        (state.matchType === "description" && !!v.matchDescription.trim()) ||
        (state.matchType === "category" && !!v.matchCategory) ||
        (state.matchType === "amount" && (!!v.matchAmountMin || !!v.matchAmountMax))
    const overrideFilled =
        (state.overrideTypes.includes("shop") && !!v.overrideShop.trim()) ||
        (state.overrideTypes.includes("category") && !!v.overrideCategory) ||
        (state.overrideTypes.includes("description") && !!v.overrideDescription.trim())
    return matchFilled && overrideFilled
}

function mapToState(map: CorrectionMap): FormState {
    let matchType: MatchType | "" = ""
    if (map.matchShop) matchType = "shop"
    else if (map.matchDescription) matchType = "description"
    else if (map.matchCategory) matchType = "category"
    else if (map.matchAmountMin !== null || map.matchAmountMax !== null) matchType = "amount"

    const overrideTypes: OverrideType[] = []
    if (map.overrideShop) overrideTypes.push("shop")
    if (map.overrideCategory) overrideTypes.push("category")
    if (map.overrideDescription) overrideTypes.push("description")

    return {
        matchType,
        overrideTypes,
        values: {
            matchShop: map.matchShop ?? "",
            matchDescription: map.matchDescription ?? "",
            matchCategory: map.matchCategory ?? "",
            matchAmountMin: map.matchAmountMin?.toString() ?? "",
            matchAmountMax: map.matchAmountMax?.toString() ?? "",
            overrideShop: map.overrideShop ?? "",
            overrideCategory: map.overrideCategory ?? "",
            overrideDescription: map.overrideDescription ?? "",
        },
    }
}

const MATCH_BUTTONS = [
    { value: "shop", text: "Shop" },
    { value: "description", text: "Description" },
    { value: "category", text: "Category" },
    { value: "amount", text: "Amount" },
]

const OVERRIDE_OPTIONS: { key: OverrideType; label: string }[] = [
    { key: "shop", label: "Shop name" },
    { key: "category", label: "Category" },
    { key: "description", label: "Description" },
]

// ─── Screen ───────────────────────────────────────────────────────────────────

export type CorrectionMapsParams = {
    prefill?: {
        shop?: string
        description?: string
        category?: string
        amount?: number
    }
}

export default function CorrectionMapsScreen({ navigation, route }: WalletScreens<"CorrectionMaps">) {
    const { maps, loading, creating, createCorrectionMap, updateCorrectionMap, deleteCorrectionMap, toggleActive } =
        useCorrectionMaps()

    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [state, setState] = useState<FormState>(EMPTY)
    const scrollRef = useRef<ScrollView>(null)

    const prefill = (route as any)?.params?.prefill as CorrectionMapsParams["prefill"] | undefined

    useEffect(() => {
        if (!prefill) return
        // Pre-fill all match fields so switching the match type selector
        // immediately shows the correct value instead of a blank input.
        const values: FormValues = {
            ...EMPTY.values,
            matchShop: prefill.shop ?? "",
            matchDescription: prefill.description ?? "",
            matchCategory: prefill.category ?? "",
            matchAmountMin: prefill.amount?.toString() ?? "",
            matchAmountMax: "",
        }
        const defaultMatchType: MatchType = prefill.shop
            ? "shop"
            : prefill.description
              ? "description"
              : prefill.category
                ? "category"
                : "amount"
        setState({ matchType: defaultMatchType, overrideTypes: [], values })
        setShowForm(true)
    }, [])

    const setVal = useCallback((key: keyof FormValues, value: string) => {
        setState((prev) => ({ ...prev, values: { ...prev.values, [key]: value } }))
    }, [])

    const setMatchType = useCallback((type: string) => {
        Feedback.trigger("impactLight")
        setState((prev) => ({ ...prev, matchType: type as MatchType }))
    }, [])

    const toggleOverride = useCallback((key: OverrideType) => {
        Feedback.trigger("impactLight")
        setState((prev) => {
            const has = prev.overrideTypes.includes(key)
            const overrideTypes = has ? prev.overrideTypes.filter((t) => t !== key) : [...prev.overrideTypes, key]
            const values = { ...prev.values }
            if (has) {
                if (key === "shop") values.overrideShop = ""
                if (key === "category") values.overrideCategory = ""
                if (key === "description") values.overrideDescription = ""
            }
            return { ...prev, overrideTypes, values }
        })
    }, [])

    const openAdd = useCallback(() => {
        Feedback.trigger("impactLight")
        setState(EMPTY)
        setEditingId(null)
        setShowForm(true)
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)
    }, [])

    const openEdit = useCallback((item: CorrectionMap) => {
        Feedback.trigger("impactLight")
        setState(mapToState(item))
        setEditingId(item.id)
        setShowForm(true)
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)
    }, [])

    const closeForm = useCallback(() => {
        Keyboard.dismiss()
        setShowForm(false)
        setEditingId(null)
    }, [])

    const handleSubmit = useCallback(async () => {
        if (!isValid(state)) return
        Keyboard.dismiss()
        const input = toInput(state)
        if (editingId) {
            await updateCorrectionMap(editingId, input)
        } else {
            await createCorrectionMap(input)
        }
        Feedback.trigger("impactMedium")
        closeForm()
    }, [state, editingId])

    const handleDelete = useCallback(async (id: string) => {
        Feedback.trigger("impactMedium")
        await deleteCorrectionMap(id)
    }, [])

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topBar}>
                <GlassView style={{ borderRadius: 100, padding: 7.5 }}>
                    <IconButton
                        icon={<AntDesign name="close" size={22} color={Colors.foreground} />}
                        onPress={() => navigation.goBack()}
                    />
                </GlassView>
                <Text variant="title" style={styles.title}>
                    Correction Rules
                </Text>
                <GlassView style={{ borderRadius: 100, padding: 7.5 }}>
                    <IconButton
                        icon={<AntDesign name={showForm ? "minus" : "plus"} size={22} color={Colors.secondary} />}
                        onPress={showForm ? closeForm : openAdd}
                    />
                </GlassView>
            </View>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <ScrollView
                    ref={scrollRef}
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    keyboardDismissMode="on-drag"
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.subtitle}>
                        Auto-correct shop names and categories on card-tap expenses. First matching rule wins.
                    </Text>

                    {loading ? (
                        <ActivityIndicator color={Colors.secondary} style={{ marginTop: 40 }} />
                    ) : (
                        <>
                            {maps.map((item) => (
                                <CorrectionMapItem
                                    key={item.id}
                                    item={item}
                                    onEdit={openEdit}
                                    onDelete={handleDelete}
                                    onToggle={toggleActive}
                                />
                            ))}

                            {maps.length === 0 && !showForm && (
                                <View style={styles.empty}>
                                    <Text style={styles.emptyText}>No rules yet</Text>
                                    <Text style={styles.emptySubtext}>e.g. "Mariola Iwanska Firma" → Lewiatan</Text>
                                    <Pressable onPress={openAdd} style={styles.emptyBtn}>
                                        <Text style={styles.emptyBtnText}>Add first rule</Text>
                                    </Pressable>
                                </View>
                            )}
                        </>
                    )}

                    {showForm && (
                        <View style={styles.form}>
                            <Text style={styles.formTitle}>{editingId ? "Edit Rule" : "New Rule"}</Text>

                            {/* Step 1 — Match */}
                            <View style={styles.section}>
                                <Text style={styles.sectionLabel}>Match when</Text>
                                <SegmentedButtons
                                    buttons={MATCH_BUTTONS}
                                    value={state.matchType}
                                    onChange={setMatchType}
                                    containerStyle={styles.segmented}
                                    buttonStyle={{ height: 42 }}
                                    buttonTextStyle={{ fontSize: 13, fontWeight: "600" }}
                                />

                                {state.matchType === "shop" && (
                                    <Input
                                        label="Shop name contains"
                                        value={state.values.matchShop}
                                        onChangeText={(v) => setVal("matchShop", v)}
                                        placeholder="e.g. Mariola Iwanska"
                                        autoCapitalize="words"
                                        returnKeyType="next"
                                        autoFocus
                                    />
                                )}

                                {state.matchType === "description" && (
                                    <Input
                                        label="Description contains"
                                        value={state.values.matchDescription}
                                        onChangeText={(v) => setVal("matchDescription", v)}
                                        placeholder="e.g. Biedronka"
                                        autoCapitalize="words"
                                        returnKeyType="next"
                                        autoFocus
                                    />
                                )}

                                {state.matchType === "category" && (
                                    <>
                                        <Input.Label
                                            text="Category equals"
                                            error={false}
                                            labelStyle={styles.inputLabel}
                                        />
                                        <CategorySelect
                                            selected={state.values.matchCategory ? [state.values.matchCategory] : []}
                                            setSelected={(sel) => setVal("matchCategory", sel[0] ?? "")}
                                            isActive={(c) => c === state.values.matchCategory}
                                            maxSelectHeight={220}
                                            closeOnSelect
                                        />
                                    </>
                                )}

                                {state.matchType === "amount" && (
                                    <View style={styles.amountRow}>
                                        <View style={{ flex: 1 }}>
                                            <Input
                                                label="Min"
                                                value={state.values.matchAmountMin}
                                                onChangeText={(v) => setVal("matchAmountMin", v)}
                                                placeholder="0"
                                                keyboardType="numeric"
                                                right={<Text style={styles.unit}>zł</Text>}
                                                autoFocus
                                            />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Input
                                                label="Max"
                                                value={state.values.matchAmountMax}
                                                onChangeText={(v) => setVal("matchAmountMax", v)}
                                                placeholder="∞"
                                                keyboardType="numeric"
                                                right={<Text style={styles.unit}>zł</Text>}
                                            />
                                        </View>
                                    </View>
                                )}
                            </View>

                            {/* Step 2 — Override */}
                            <View style={styles.section}>
                                <Text style={styles.sectionLabel}>Then change</Text>

                                <View style={styles.overrideRow}>
                                    {OVERRIDE_OPTIONS.map(({ key, label }) => {
                                        const active = state.overrideTypes.includes(key)
                                        return (
                                            <Ripple
                                                key={key}
                                                onPress={() => toggleOverride(key)}
                                                style={[styles.overrideBtn, active && styles.overrideBtnActive]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.overrideBtnText,
                                                        active && styles.overrideBtnTextActive,
                                                    ]}
                                                >
                                                    {label}
                                                </Text>
                                            </Ripple>
                                        )
                                    })}
                                </View>

                                {state.overrideTypes.includes("shop") && (
                                    <Input
                                        label="New shop name"
                                        value={state.values.overrideShop}
                                        onChangeText={(v) => setVal("overrideShop", v)}
                                        placeholder="e.g. Lewiatan"
                                        autoCapitalize="words"
                                        returnKeyType="next"
                                    />
                                )}

                                {state.overrideTypes.includes("category") && (
                                    <>
                                        <Input.Label text="New category" error={false} labelStyle={styles.inputLabel} />
                                        <CategorySelect
                                            selected={
                                                state.values.overrideCategory ? [state.values.overrideCategory] : []
                                            }
                                            setSelected={(sel) => setVal("overrideCategory", sel[0] ?? "")}
                                            isActive={(c) => c === state.values.overrideCategory}
                                            maxSelectHeight={220}
                                            closeOnSelect
                                        />
                                    </>
                                )}

                                {state.overrideTypes.includes("description") && (
                                    <Input
                                        label="New description"
                                        value={state.values.overrideDescription}
                                        onChangeText={(v) => setVal("overrideDescription", v)}
                                        placeholder="Optional rename"
                                        autoCapitalize="sentences"
                                        returnKeyType="done"
                                    />
                                )}
                            </View>

                            <View style={styles.actions}>
                                <Button color="secondary" style={styles.cancelBtn} onPress={closeForm}>
                                    Cancel
                                </Button>
                                <Button
                                    style={styles.saveBtn}
                                    disabled={!isValid(state) || creating}
                                    onPress={handleSubmit}
                                >
                                    {creating ? (
                                        <ActivityIndicator color={Colors.foreground} size="small" />
                                    ) : editingId ? (
                                        "Save changes"
                                    ) : (
                                        "Add rule"
                                    )}
                                </Button>
                            </View>
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
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
        paddingHorizontal: 15,
        paddingVertical: 15,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
    },
    scroll: { flex: 1 },
    scrollContent: {
        padding: 15,
        paddingBottom: 50,
    },
    subtitle: {
        color: Colors.foreground_secondary,
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 18,
    },
    empty: {
        alignItems: "center",
        paddingVertical: 52,
        gap: 10,
    },
    emptyText: {
        color: Colors.foreground,
        fontSize: 17,
        fontWeight: "600",
    },
    emptySubtext: {
        color: Colors.foreground_secondary,
        fontSize: 13,
        textAlign: "center",
    },
    emptyBtn: {
        marginTop: 4,
        paddingHorizontal: 20,
        paddingVertical: 9,
        borderRadius: 100,
        backgroundColor: lowOpacity(Colors.secondary, 0.15),
        borderWidth: 1,
        borderColor: lowOpacity(Colors.secondary, 0.35),
    },
    emptyBtnText: {
        color: Colors.secondary,
        fontSize: 14,
        fontWeight: "500",
    },
    form: {
        backgroundColor: Color(Colors.primary).lighten(0.1).hex(),
        borderRadius: 16,
        padding: 16,
        marginTop: 8,
        borderWidth: 1,
        borderColor: Color(Colors.primary).lighten(0.22).hex(),
        gap: 16,
    },
    formTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: Colors.foreground,
    },
    section: {
        gap: 10,
    },
    sectionLabel: {
        color: Colors.foreground_secondary,
        fontSize: 12,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    segmented: {
        borderRadius: 10,
        marginBottom: 4,
    },
    inputLabel: {
        marginTop: 0,
        marginBottom: 4,
    },
    amountRow: {
        flexDirection: "row",
        gap: 10,
    },
    unit: {
        color: Colors.foreground_secondary,
        fontSize: 14,
        paddingRight: 8,
    },
    overrideRow: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 4,
    },
    overrideBtn: {
        flex: 1,
        height: 42,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.primary_light,
        borderWidth: 1,
        borderColor: Colors.primary_light,
    },
    overrideBtnActive: {
        backgroundColor: Colors.secondary,
        borderColor: Colors.secondary,
    },
    overrideBtnText: {
        fontSize: 13,
        fontWeight: "600",
        color: Colors.foreground_secondary,
    },
    overrideBtnTextActive: {
        color: Colors.foreground,
    },
    actions: {
        flexDirection: "row",
        gap: 10,
    },
    cancelBtn: {
        flex: 1,
        borderRadius: 100,
    },
    saveBtn: {
        flex: 2,
        borderRadius: 100,
    },
})
