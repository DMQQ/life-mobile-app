import Colors from "@/constants/Colors"
import Text from "@/components/ui/Text/Text"
import Input from "@/components/ui/TextInput/TextInput"
import { useCallback, useLayoutEffect, useState } from "react"
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
import Ripple from "react-native-material-ripple"
import Color from "color"
import CategorySelect from "../../components/CreateExpense/CategorySelect"
import { useCorrectionMaps, type CorrectionMap } from "../../hooks/useCorrectionMaps"
import { router, useNavigation, useLocalSearchParams } from "expo-router"
import GlassView from "@/components/ui/GlassView"
import GroupSelector from "@/components/ui/GroupSelector"
import Section from "@/components/ui/Section"

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
    { value: "shop", label: "Shop" },
    { value: "description", label: "Desc" },
    { value: "category", label: "Category" },
    { value: "amount", label: "Amount" },
]

const OVERRIDE_OPTIONS: { key: OverrideType; label: string }[] = [
    { key: "shop", label: "Shop" },
    { key: "category", label: "Category" },
    { key: "description", label: "Description" },
]

export default function CorrectionMapForm() {
    const navigation = useNavigation()
    const { prefill, editingItem } = useLocalSearchParams<{ prefill?: any; editingItem?: any }>()
    const { creating, createCorrectionMap, updateCorrectionMap } = useCorrectionMaps()

    const [state, setState] = useState<FormState>(() => {
        if (editingItem) return mapToState(editingItem)
        if (prefill) {
            const values: FormValues = {
                ...EMPTY.values,
                matchShop: prefill.shop ?? "",
                matchDescription: prefill.description ?? "",
                matchCategory: prefill.category ?? "",
                matchAmountMin: prefill.amount?.toString() ?? "",
            }
            const defaultMatchType: MatchType = prefill.shop
                ? "shop"
                : prefill.description
                  ? "description"
                  : prefill.category
                    ? "category"
                    : "amount"
            return { matchType: defaultMatchType, overrideTypes: [], values }
        }
        return EMPTY
    })

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

    const handleSubmit = useCallback(async () => {
        if (!isValid(state) || creating) return
        Keyboard.dismiss()
        const input = toInput(state)
        if (editingItem) {
            await updateCorrectionMap(editingItem.id, input)
        } else {
            await createCorrectionMap(input)
        }
        Feedback.trigger("impactMedium")
        router.back()
    }, [state, editingItem, creating])

    const valid = isValid(state)

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Pressable style={{ width: 60 }} onPress={handleSubmit} disabled={!valid || creating} hitSlop={12}>
                    {creating ? (
                        <ActivityIndicator size={20} color={Colors.secondary} />
                    ) : (
                        <Text style={[styles.headerSave, !valid && styles.headerSaveDisabled]}>
                            {editingItem ? "Save" : "Add"}
                        </Text>
                    )}
                </Pressable>
            ),
            title: editingItem ? "Edit Rule" : "New Rule",
        })
    }, [editingItem, valid, creating, handleSubmit])

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.divider} />

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    keyboardDismissMode="on-drag"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Match section */}
                    <Section title="Match when">
                        <View style={[styles.sectionCard, { padding: 15 }]}>
                            <GroupSelector
                                options={MATCH_BUTTONS}
                                value={state.matchType}
                                onChange={(value) => setMatchType(value as string)}
                            />

                            {state.matchType === "shop" && (
                                <>
                                    <Input
                                        label="Shop name"
                                        value={state.values.matchShop}
                                        onChangeText={(v) => setVal("matchShop", v)}
                                        placeholder="e.g. Mariola* or /^biedronka/i"
                                        autoCapitalize="none"
                                        returnKeyType="next"
                                        autoFocus
                                    />
                                    <Text style={styles.patternHint}>
                                        Substring by default · use <Text style={styles.patternHintMono}>*</Text> /{" "}
                                        <Text style={styles.patternHintMono}>?</Text> wildcards or{" "}
                                        <Text style={styles.patternHintMono}>/regex/flags</Text>
                                    </Text>
                                </>
                            )}

                            {state.matchType === "description" && (
                                <>
                                    <Input
                                        label="Description"
                                        value={state.values.matchDescription}
                                        onChangeText={(v) => setVal("matchDescription", v)}
                                        placeholder="e.g. *sklep* or /^biedronka/i"
                                        autoCapitalize="none"
                                        returnKeyType="next"
                                        autoFocus
                                    />
                                    <Text style={styles.patternHint}>
                                        Substring by default · use <Text style={styles.patternHintMono}>*</Text> /{" "}
                                        <Text style={styles.patternHintMono}>?</Text> wildcards or{" "}
                                        <Text style={styles.patternHintMono}>/regex/flags</Text>
                                    </Text>
                                </>
                            )}

                            {state.matchType === "category" && (
                                <>
                                    <Input.Label text="Category equals" error={false} labelStyle={styles.inputLabel} />
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
                    </Section>

                    {/* Override section */}
                    <Section title="Then change">
                        <View style={{ padding: 15 }}>
                            <View style={styles.sectionCard}>
                                <View style={styles.overrideRow}>
                                    {OVERRIDE_OPTIONS.map(({ key, label }) => {
                                        const active = state.overrideTypes.includes(key)
                                        return (
                                            <Ripple
                                                key={key}
                                                onPress={() => toggleOverride(key)}
                                                style={[styles.overrideChip, active && styles.overrideChipActive]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.overrideChipText,
                                                        active && styles.overrideChipTextActive,
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
                        </View>
                    </Section>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const cardBg = Color(Colors.primary).lighten(0.12).hex()
const cardBorder = Color(Colors.primary).lighten(0.22).hex()

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 25,
        paddingVertical: 15,
    },
    headerBtn: {
        minWidth: 60,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: "600",
        color: Colors.foreground,
    },
    headerCancel: {
        fontSize: 16,
        color: Colors.foreground_secondary,
    },
    headerSave: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.secondary,
        textAlign: "center",
    },
    headerSaveDisabled: {
        opacity: 0.35,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: "rgba(255,255,255,0.08)",
    },
    scroll: { flex: 1 },
    scrollContent: {
        padding: 16,
        paddingBottom: 60,
        gap: 24,
    },
    section: {
        gap: 8,
    },
    sectionLabel: {
        color: Colors.foreground_secondary,
        fontSize: 12,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.6,
        paddingHorizontal: 4,
    },
    sectionCard: {
        borderRadius: 16,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: cardBorder,
        gap: 12,
    },
    segmented: {
        borderRadius: 10,
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
    patternHint: {
        color: Colors.foreground_secondary,
        fontSize: 11,
        lineHeight: 16,
        paddingHorizontal: 4,
        paddingBottom: 2,
        opacity: 0.7,
    },
    patternHintMono: {
        fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
        fontSize: 11,
    },
    overrideRow: {
        flexDirection: "row",
        gap: 8,
    },
    overrideChip: {
        flex: 1,
        height: 40,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Color(Colors.primary).lighten(0.25).hex(),
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "rgba(255,255,255,0.08)",
    },
    overrideChipActive: {
        backgroundColor: Color(Colors.secondary).alpha(0.2).string(),
        borderColor: Color(Colors.secondary).alpha(0.5).string(),
    },
    overrideChipText: {
        fontSize: 13,
        fontWeight: "600",
        color: Colors.foreground_secondary,
    },
    overrideChipTextActive: {
        color: Colors.secondary,
    },
})
