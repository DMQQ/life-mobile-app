import ModalHeader from "@/components/ui/ModalHeader"
import Section from "@/components/ui/Section"
import Text from "@/components/ui/Text/Text"
import Input from "@/components/ui/TextInput/TextInput"
import GroupSelector from "@/components/ui/GroupSelector"
import GlassView from "@/components/ui/GlassView"
import Colors from "@/constants/Colors"
import { Feather } from "@expo/vector-icons"
import { SymbolView } from "expo-symbols"
import { DatePicker as SwiftDatePicker, Host } from "@expo/ui/swift-ui"
import { datePickerStyle, frame } from "@expo/ui/swift-ui/modifiers"
import Color from "color"
import dayjs from "dayjs"
import moment from "moment"
import { useState } from "react"
import { Pressable, ScrollView, StyleSheet, View } from "react-native"
import Feedback from "react-native-haptic-feedback"
import Ripple from "react-native-material-ripple"
import { useNavigation } from "@react-navigation/native"
import { useCreateExpenseContext } from "../../context/CreateExpenseContext"
import { CategoryUtils, Icons } from "../../components/Expense/ExpenseIcon"
import CategorySelector from "../../components/CreateExpense/CategorySelectorView"
import { SpontaneousRateSelector, getRateColor } from "../../components/CreateExpense/SpontaneousRate"
import { useSubAccounts } from "../../hooks/useSubAccounts"
import SubExpenseSheet from "../../components/CreateExpense/SubexpenseSheet"
import PredictionView from "../../components/CreateExpense/PredictionView"
import layout from "@/constants/Layout"

type ExpenseType = "expense" | "income"

const TYPE_OPTIONS: { label: string; value: ExpenseType }[] = [
    { label: "Expense", value: "expense" },
    { label: "Income", value: "income" },
]

export default function Form({ route }: any) {
    const params = route.params ?? {}
    const navigation = useNavigation<any>()
    const { state, methods } = useCreateExpenseContext()

    const saveLabel = !state.isValid && state.prediction ? "Apply" : params?.isEditing ? "Save" : "Add"
    const onSave = !state.isValid && state.prediction ? methods.applyPrediction : methods.handleSubmit
    const saveDisabled = !state.isValid && !state.canPredict && !state.prediction

    return (
        <View style={{ flex: 1 }}>
            <ModalHeader
                title={params?.isEditing ? "Edit Expense" : "New Expense"}
                onSave={onSave}
                saveLabel={saveLabel}
                saveDisabled={saveDisabled || state.loading}
                saveLoading={state.loading}
                saveIcon="checkmark"
                dirty
                onClose={() => navigation.goBack()}
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardDismissMode="on-drag"
                showsVerticalScrollIndicator={false}
            >
                <AmountSection showPrediction={!!(state.prediction && !params?.isEditing)} />
                <DetailsSection />

                <DateSection />
                <SubExpensesSection />
            </ScrollView>

            <Pressable
                style={styles.fab}
                onPress={() => {
                    Feedback.trigger("impactLight")
                    navigation.navigate("AIScanner")
                }}
            >
                <GlassView style={styles.fabInner}>
                    <Feather name="camera" size={22} color={Colors.secondary} />
                </GlassView>
            </Pressable>

            <SubExpenseSheet />
        </View>
    )
}

function AmountSection({ showPrediction }: { showPrediction: boolean }) {
    const { state, methods } = useCreateExpenseContext()
    return (
        <Section title="Amount" cardStyle={{ padding: 5 }} noGap>
            <Input
                value={state.amount === "0" ? "" : state.amount}
                onChangeText={(text) => methods.setAmount(text || "0")}
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
                value={state.name}
                onChangeText={methods.setName}
                placeholder="What are you spending on?"
                flat
                containerStyle={{ borderRadius: 0 }}
            />
            {showPrediction && <PredictionView />}
        </Section>
    )
}

function DetailsSection() {
    const { state, methods } = useCreateExpenseContext()
    const { data: subAccountsData } = useSubAccounts()
    const subAccounts = subAccountsData?.wallet.subAccounts ?? []

    const [expanded, setExpanded] = useState<"category" | "spontaneous" | "account" | null>(null)
    const toggle = (key: "category" | "spontaneous" | "account") => setExpanded((p) => (p === key ? null : key))

    const { category, spontaneousRate, subAccountId } = state
    const hasCategory = category !== "none"
    const catColor = hasCategory
        ? Color(Icons[category]?.backgroundColor ?? Colors.secondary)
              .lighten(0.25)
              .hex()
        : undefined
    const spontaneousActive = spontaneousRate > 0
    const spontaneousColor = getRateColor(spontaneousRate)
    const selectedAccount = subAccounts.find((a) => a.id === subAccountId) ?? null

    return (
        <Section title="Details">
            <View style={{ padding: 10 }}>
                <GroupSelector
                    options={TYPE_OPTIONS}
                    value={state.type ?? "expense"}
                    onChange={(value) => methods.setType(value)}
                    size="medium"
                />
            </View>

            {state.type !== "income" && (
                <>
                    <View style={styles.divider} />
                    <Pressable
                        onPress={() => {
                            Feedback.trigger("impactLight")
                            toggle("category")
                        }}
                        style={styles.row}
                    >
                        <Text variant="subtitle">Category</Text>
                        <View style={styles.rowRight}>
                            <SymbolView name="tag.fill" size={15} tintColor={hasCategory ? catColor : Colors.foreground_secondary} />
                            <Text variant="body" style={[styles.rowValue, hasCategory && { color: catColor }]}>
                                {hasCategory ? CategoryUtils.getCategoryName(category) : "None selected"}
                            </Text>
                        </View>
                    </Pressable>
                    {expanded === "category" && (
                        <View style={styles.categoryContainer}>
                            <CategorySelector
                                current={category}
                                onPress={(item) => {
                                    methods.setCategory(item as keyof typeof Icons)
                                    methods.setIsSubscription(item === "subscription")
                                    methods.setType("expense")
                                    setExpanded(null)
                                }}
                                dismiss={() => setExpanded(null)}
                            />
                        </View>
                    )}
                </>
            )}

            <View style={styles.divider} />
            <Pressable
                onPress={() => {
                    Feedback.trigger("impactLight")
                    toggle("spontaneous")
                }}
                style={styles.row}
            >
                <Text variant="subtitle">Impulsiveness</Text>
                <View style={styles.rowRight}>
                    <SymbolView name="bolt.fill" size={15} tintColor={spontaneousActive ? spontaneousColor : Colors.foreground_secondary} />
                    <Text variant="body" style={[styles.rowValue, spontaneousActive && { color: spontaneousColor }]}>
                        {spontaneousRate === 0 ? "Not spontaneous" : `${spontaneousRate}%`}
                    </Text>
                </View>
            </Pressable>
            {expanded === "spontaneous" && (
                <View style={styles.spontaneousContainer}>
                    <SpontaneousRateSelector onDismiss={() => setExpanded(null)} />
                </View>
            )}

            {subAccounts.length > 0 && (
                <>
                    <View style={styles.divider} />
                    <Pressable
                        onPress={() => {
                            Feedback.trigger("impactLight")
                            toggle("account")
                        }}
                        style={styles.row}
                    >
                        <Text variant="subtitle">Account</Text>
                        <View style={styles.rowRight}>
                            <SymbolView name="creditcard.fill" size={15} tintColor={selectedAccount ? Colors.secondary : Colors.foreground_secondary} />
                            <Text variant="body" style={[styles.rowValue, selectedAccount && { color: Colors.secondary }]}>
                                {selectedAccount?.name ?? "Default"}
                            </Text>
                        </View>
                    </Pressable>
                    {expanded === "account" && (
                        <View>
                            {[{ id: null as string | null, name: "Default" }, ...subAccounts].map((item) => {
                                const active = subAccountId === item.id
                                return (
                                    <Ripple
                                        key={item.id ?? "__default"}
                                        onPress={() => {
                                            Feedback.trigger("impactLight")
                                            methods.setSubAccountId(item.id)
                                            setExpanded(null)
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
                </>
            )}
        </Section>
    )
}

function DateSection() {
    const { state, methods } = useCreateExpenseContext()
    const [expanded, setExpanded] = useState({ date: false, time: false })
    const dateObj = moment(state.date || undefined)

    const setDatePart = (d: Date) => {
        const datePart = dayjs(d).format("YYYY-MM-DD")
        const timePart = dateObj.format("HH:mm")
        methods.setDate(`${datePart}T${timePart}:00`)
    }

    const setTimePart = (d: Date) => {
        const datePart = dateObj.format("YYYY-MM-DD")
        const timePart = moment(d).format("HH:mm")
        methods.setDate(`${datePart}T${timePart}:00`)
    }

    return (
        <Section title="Date">
            <Pressable onPress={() => setExpanded((p) => ({ ...p, date: !p.date }))} style={styles.row}>
                <Text variant="subtitle">Date</Text>
                <View style={styles.rowRight}>
                    <SymbolView name="calendar" size={15} tintColor={Colors.foreground_secondary} />
                    <Text variant="body" style={styles.rowValue}>
                        {dateObj.format("DD MMMM YYYY")}
                    </Text>
                </View>
            </Pressable>
            {expanded.date && (
                <View style={styles.pickerContainer}>
                    <Host matchContents>
                        <SwiftDatePicker
                            selection={dateObj.toDate()}
                            onDateChange={setDatePart}
                            modifiers={[datePickerStyle("graphical"), frame({ width: layout.screen.width - 30 })]}
                        />
                    </Host>
                </View>
            )}

            <View style={styles.divider} />

            <Pressable onPress={() => setExpanded((p) => ({ ...p, time: !p.time }))} style={styles.row}>
                <Text variant="subtitle">Time</Text>
                <View style={styles.rowRight}>
                    <SymbolView name="clock.fill" size={15} tintColor={Colors.foreground_secondary} />
                    <Text variant="body" style={styles.rowValue}>
                        {dateObj.format("HH:mm")}
                    </Text>
                </View>
            </Pressable>
            {expanded.time && (
                <View style={styles.pickerContainer}>
                    <Host matchContents>
                        <SwiftDatePicker
                            selection={dateObj.toDate()}
                            displayedComponents={["hourAndMinute"]}
                            onDateChange={setTimePart}
                            modifiers={[datePickerStyle("wheel")]}
                        />
                    </Host>
                </View>
            )}
        </Section>
    )
}

function SubExpensesSection() {
    const { state, subexpenseSheetRef } = useCreateExpenseContext()
    const count = state.SubExpenses.length

    return (
        <Section title="Sub-expenses">
            <Ripple
                onPress={() => {
                    Feedback.trigger("impactLight")
                    subexpenseSheetRef.current?.expand()
                }}
                style={styles.navRow}
            >
                <SymbolView name="list.bullet" size={16} tintColor={count > 0 ? Colors.secondary : Colors.foreground_secondary} />
                <Text style={[styles.navRowText, count > 0 && { color: Colors.secondary }]}>
                    {count > 0 ? `${count} sub-expense${count > 1 ? "s" : ""}` : "Add sub-expenses"}
                </Text>
                <Feather name="chevron-right" size={16} color={Colors.foreground_secondary} />
            </Ripple>
        </Section>
    )
}

const styles = StyleSheet.create({
    scrollContent: {
        padding: 15,
        paddingBottom: 100,
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
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 15,
        paddingVertical: 12,
    },
    rowRight: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        gap: 6,
    },
    rowValue: {
        color: Colors.foreground,
    },
    pickerContainer: {
        alignItems: "center",
        paddingBottom: 10,
    },
    categoryContainer: {
        height: 320,
        paddingHorizontal: 10,
        paddingBottom: 10,
    },
    spontaneousContainer: {
        paddingHorizontal: 10,
        paddingBottom: 10,
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
    fab: {
        position: "absolute",
        bottom: 28,
        right: 20,
        zIndex: 100,
    },
    fabInner: {
        width: 56,
        height: 56,
        borderRadius: 100,
        justifyContent: "center",
        alignItems: "center",
    },
})
