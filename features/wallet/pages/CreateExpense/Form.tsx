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
import useShops from "../../hooks/useShops"
import AddSubExpenseSheet from "../../components/Expense/AddSubExpenseSheet"
import PredictionView from "../../components/CreateExpense/PredictionView"
import layout from "@/constants/Layout"
import ShopSelectCard from "../../components/Shops/ShopSelectCard"
import ShopImage from "../../components/Shops/ShopImage"

type ExpenseType = "expense" | "income" | "refunded"

const TYPE_OPTIONS: { label: string; value: ExpenseType }[] = [
    { label: "Expense", value: "expense" },
    { label: "Income", value: "income" },
    { label: "Refund", value: "refunded" as ExpenseType },
]

export default function Form({ route }: any) {
    const params = route.params ?? {}
    const navigation = useNavigation<any>()
    const { state, methods, subexpenseSheetRef } = useCreateExpenseContext()

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
                <DetailsSection isEditing={!!params?.isEditing} />
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

            <AddSubExpenseSheet
                ref={subexpenseSheetRef}
                onAdd={(item) =>
                    methods.setSubExpenses((prev) => [
                        ...prev,
                        { id: Math.random().toString(), ...item, category: item.category as keyof typeof Icons },
                    ])
                }
                items={state.SubExpenses}
                onDelete={(id) => methods.setSubExpenses((prev) => prev.filter((i) => i.id !== id))}
                date={state.date}
            />
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

function DetailsSection({ isEditing }: { isEditing: boolean }) {
    const { state, methods } = useCreateExpenseContext()
    const { data: subAccountsData } = useSubAccounts()
    const { data: shopsData } = useShops()
    const subAccounts = subAccountsData?.wallet.subAccounts ?? []

    const hasExtras = !!(state.shop || state.note || state.tags || state.spontaneousRate > 0)
    const [showExtras, setShowExtras] = useState(() => isEditing && hasExtras)
    const [expanded, setExpanded] = useState<"category" | "spontaneous" | "account" | "shop" | null>(null)
    const toggle = (key: typeof expanded) => setExpanded((p) => (p === key ? null : key))

    const { category, spontaneousRate, subAccountId, shop, note, tags } = state

    const hasCategory = category !== "none"
    const catColor = hasCategory
        ? Color(Icons[category]?.backgroundColor ?? Colors.secondary).lighten(0.25).hex()
        : undefined
    const spontaneousActive = spontaneousRate > 0
    const spontaneousColor = getRateColor(spontaneousRate)
    const selectedAccount = subAccounts.find((a) => a.id === subAccountId) ?? null
    const selectedShopEntity = shopsData?.shops.find((s) => s.id === state.shopEntityId) ?? null

    const tagsPreview = tags
        ? tags.split(",").filter(Boolean).join(" ")
        : null

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
                    <Pressable onPress={() => { Feedback.trigger("impactLight"); toggle("category") }} style={styles.row}>
                        <Text variant="subtitle">Category</Text>
                        <View style={styles.rowRight}>
                            <SymbolView name="tag.fill" size={15} tintColor={hasCategory ? catColor : Colors.foreground_secondary} />
                            <Text variant="body" style={[styles.rowValue, hasCategory && { color: catColor }]}>
                                {hasCategory ? CategoryUtils.getCategoryName(category) : "None"}
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

            {subAccounts.length > 0 && (
                <>
                    <View style={styles.divider} />
                    <Pressable onPress={() => { Feedback.trigger("impactLight"); toggle("account") }} style={styles.row}>
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
                                        onPress={() => { Feedback.trigger("impactLight"); methods.setSubAccountId(item.id); setExpanded(null) }}
                                        style={[styles.accountRow, active && styles.accountRowActive]}
                                    >
                                        <Feather name="credit-card" size={16} color={active ? Colors.secondary : Colors.foreground_secondary} />
                                        <Text style={[styles.accountLabel, active && { color: Colors.secondary }]}>{item.name}</Text>
                                        {active && <Feather name="check" size={15} color={Colors.secondary} />}
                                    </Ripple>
                                )
                            })}
                        </View>
                    )}
                </>
            )}

            {showExtras && (
                <>
                    <View style={styles.divider} />
                    <Pressable onPress={() => { Feedback.trigger("impactLight"); toggle("shop") }} style={styles.row}>
                        <Text variant="subtitle">Shop</Text>
                        <View style={styles.rowRight}>
                            {selectedShopEntity ? (
                                <ShopImage image={selectedShopEntity.image} size={22} radius={6} />
                            ) : (
                                <SymbolView name="storefront.fill" size={15} tintColor={shop ? Colors.secondary : Colors.foreground_secondary} />
                            )}
                            <Text variant="body" style={[styles.rowValue, shop ? { color: Colors.secondary } : undefined]}>
                                {shop || "None"}
                            </Text>
                        </View>
                    </Pressable>
                    {expanded === "shop" && (
                        <ShopPicker
                            shop={shop}
                            shopEntityId={state.shopEntityId}
                            shops={shopsData?.shops ?? []}
                            onSelect={(name, id) => { methods.setShop(name); methods.setShopEntityId(id); setExpanded(null) }}
                            onClear={() => { methods.setShop(""); methods.setShopEntityId(null) }}
                        />
                    )}

                    <View style={styles.divider} />
                    <NoteRow note={note} onChangeNote={methods.setNote} />

                    <View style={styles.divider} />
                    <TagsRow tagsString={tags} onChangeTags={methods.setTags} preview={tagsPreview} />

                    <View style={styles.divider} />
                    <Pressable onPress={() => { Feedback.trigger("impactLight"); toggle("spontaneous") }} style={styles.row}>
                        <Text variant="subtitle">Impulsiveness</Text>
                        <View style={styles.rowRight}>
                            <SymbolView name="bolt.fill" size={15} tintColor={spontaneousActive ? spontaneousColor : Colors.foreground_secondary} />
                            <Text variant="body" style={[styles.rowValue, spontaneousActive && { color: spontaneousColor }]}>
                                {spontaneousRate === 0 ? "None" : `${spontaneousRate}%`}
                            </Text>
                        </View>
                    </Pressable>
                    {expanded === "spontaneous" && (
                        <View style={styles.spontaneousContainer}>
                            <SpontaneousRateSelector onDismiss={() => setExpanded(null)} />
                        </View>
                    )}
                </>
            )}

            <Pressable
                onPress={() => { Feedback.trigger("impactLight"); setShowExtras((p) => !p) }}
                style={styles.expandBtn}
            >
                <Text style={styles.expandBtnText}>{showExtras ? "Fewer options" : "More options"}</Text>
                <Feather name={showExtras ? "chevron-up" : "chevron-down"} size={13} color={Colors.foreground_secondary} />
            </Pressable>
        </Section>
    )
}

function ShopPicker({
    shop,
    shopEntityId,
    shops,
    onSelect,
    onClear,
}: {
    shop: string
    shopEntityId: string | null
    shops: NonNullable<ReturnType<typeof useShops>["data"]>["shops"]
    onSelect: (name: string, id: string) => void
    onClear: () => void
}) {
    const [search, setSearch] = useState(shop)

    const filtered = shops
        .filter((s) => search.length === 0 || s.name.toLowerCase().includes(search.toLowerCase()))
        .slice(0, 6)

    return (
        <View style={styles.shopPickerContainer}>
            <View style={styles.shopSearchRow}>
                <Feather name="search" size={15} color={Colors.foreground_secondary} />
                <Input
                    value={search}
                    onChangeText={(text) => {
                        setSearch(text)
                        if (!shopEntityId) return
                        onClear()
                    }}
                    placeholder="Search shops..."
                    flat
                    autoFocus
                    containerStyle={styles.shopSearchInput}
                />
                {search.length > 0 && (
                    <Pressable onPress={() => { setSearch(""); onClear() }} hitSlop={8}>
                        <Feather name="x" size={15} color={Colors.foreground_secondary} />
                    </Pressable>
                )}
            </View>
            {filtered.map((s) => (
                <ShopSelectCard
                    key={s.id}
                    shop={s}
                    selected={shopEntityId === s.id}
                    onPress={() => onSelect(s.name, s.id)}
                />
            ))}
            {filtered.length === 0 && search.length > 0 && (
                <Pressable
                    onPress={() => onSelect(search, null as any)}
                    style={styles.shopFreeformRow}
                >
                    <Feather name="plus" size={15} color={Colors.secondary} />
                    <Text style={styles.shopFreeformText}>Use "{search}"</Text>
                </Pressable>
            )}
        </View>
    )
}

function NoteRow({ note, onChangeNote }: { note: string; onChangeNote: (v: string) => void }) {
    const [open, setOpen] = useState(!!note)

    return (
        <>
            <Pressable onPress={() => { Feedback.trigger("impactLight"); setOpen((p) => !p) }} style={styles.row}>
                <Text variant="subtitle">Note</Text>
                <View style={styles.rowRight}>
                    <SymbolView name="note.text" size={15} tintColor={note ? Colors.secondary : Colors.foreground_secondary} />
                    {note ? (
                        <Text variant="body" style={[styles.rowValue, { color: Colors.secondary }]} numberOfLines={1}>
                            {note}
                        </Text>
                    ) : (
                        <Text variant="body" style={styles.rowValue}>None</Text>
                    )}
                </View>
            </Pressable>
            {open && (
                <View style={styles.noteContainer}>
                    <Input
                        value={note}
                        onChangeText={onChangeNote}
                        placeholder="Write a note..."
                        flat
                        multiline
                        autoFocus={!note}
                        containerStyle={styles.noteInputContainer}
                        style={styles.noteInput}
                    />
                </View>
            )}
        </>
    )
}

function TagsRow({ tagsString, onChangeTags, preview }: { tagsString: string; onChangeTags: (v: string) => void; preview: string | null }) {
    const [open, setOpen] = useState(!!tagsString)
    const [input, setInput] = useState("")

    const tags = tagsString ? tagsString.split(",").filter(Boolean) : []

    const addTag = () => {
        const trimmed = input.trim()
        if (!trimmed) return
        const tag = trimmed.startsWith("#") ? trimmed : `#${trimmed}`
        if (tags.includes(tag)) { setInput(""); return }
        onChangeTags([...tags, tag].join(","))
        setInput("")
        Feedback.trigger("impactLight")
    }

    const removeTag = (index: number) => {
        const next = tags.filter((_, i) => i !== index)
        onChangeTags(next.join(","))
        Feedback.trigger("impactLight")
    }

    return (
        <>
            <Pressable onPress={() => { Feedback.trigger("impactLight"); setOpen((p) => !p) }} style={styles.row}>
                <Text variant="subtitle">Tags</Text>
                <View style={styles.rowRight}>
                    <SymbolView name="tag.fill" size={15} tintColor={tags.length > 0 ? Colors.secondary : Colors.foreground_secondary} />
                    {tags.length > 0 ? (
                        <Text variant="body" style={[styles.rowValue, { color: Colors.secondary }]} numberOfLines={1}>
                            {preview}
                        </Text>
                    ) : (
                        <Text variant="body" style={styles.rowValue}>None</Text>
                    )}
                </View>
            </Pressable>
            {open && (
                <View style={styles.tagsContainer}>
                    {tags.length > 0 && (
                        <View style={styles.tagsList}>
                            {tags.map((tag, i) => (
                                <Pressable key={i} onPress={() => removeTag(i)} style={styles.tagChip}>
                                    <Text style={styles.tagText}>{tag}</Text>
                                    <Feather name="x" size={10} color={Colors.secondary} />
                                </Pressable>
                            ))}
                        </View>
                    )}
                    <View style={styles.tagInputRow}>
                        <Input
                            value={input}
                            onChangeText={setInput}
                            onSubmitEditing={addTag}
                            placeholder="#shopping"
                            flat
                            autoFocus={!tagsString}
                            returnKeyType="done"
                            blurOnSubmit={false}
                            containerStyle={styles.tagInput}
                        />
                        {input.trim().length > 0 && (
                            <Pressable onPress={addTag} style={styles.tagAddBtn} hitSlop={8}>
                                <Feather name="plus" size={18} color={Colors.secondary} />
                            </Pressable>
                        )}
                    </View>
                </View>
            )}
        </>
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
                    <Text variant="body" style={styles.rowValue}>{dateObj.format("DD MMMM YYYY")}</Text>
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
                    <Text variant="body" style={styles.rowValue}>{dateObj.format("HH:mm")}</Text>
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
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    rowValue: {
        color: Colors.foreground,
        maxWidth: 160,
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
    expandBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        paddingVertical: 12,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: Colors.borderColor,
    },
    expandBtnText: {
        color: Colors.foreground_secondary,
        fontSize: 13,
    },
    shopPickerContainer: {
        paddingHorizontal: 10,
        paddingBottom: 8,
        gap: 2,
    },
    shopSearchRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginBottom: 4,
        borderRadius: 12,
        backgroundColor: Color(Colors.primary_lighter).alpha(0.5).string(),
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.borderColor,
    },
    shopSearchInput: {
        flex: 1,
        borderWidth: 0,
        borderRadius: 0,
        backgroundColor: "transparent",
    },
    shopFreeformRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    shopFreeformText: {
        color: Colors.secondary,
        fontSize: 14,
    },
    noteContainer: {
        paddingHorizontal: 10,
        paddingBottom: 10,
        paddingTop: 4,
    },
    noteInputContainer: {
        borderRadius: 14,
        backgroundColor: Color(Colors.primary_lighter).alpha(0.5).string(),
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.borderColor,
        minHeight: 100,
        alignItems: "flex-start",
    },
    noteInput: {
        minHeight: 80,
        paddingTop: 4,
        textAlignVertical: "top",
    },
    tagsContainer: {
        paddingHorizontal: 10,
        paddingBottom: 10,
        paddingTop: 4,
        gap: 8,
    },
    tagsList: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
    },
    tagChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 100,
        backgroundColor: Color(Colors.secondary).alpha(0.12).string(),
        borderWidth: 1,
        borderColor: Color(Colors.secondary).alpha(0.3).string(),
    },
    tagText: {
        color: Colors.secondary,
        fontSize: 13,
        fontWeight: "500",
    },
    tagInputRow: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 12,
        backgroundColor: Color(Colors.primary_lighter).alpha(0.5).string(),
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.borderColor,
        paddingRight: 8,
    },
    tagInput: {
        flex: 1,
        borderWidth: 0,
        borderRadius: 0,
        backgroundColor: "transparent",
    },
    tagAddBtn: {
        padding: 4,
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
