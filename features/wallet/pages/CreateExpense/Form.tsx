import ModalHeader from "@/components/ui/ModalHeader"
import Section from "@/components/ui/Section"
import Text from "@/components/ui/Text/Text"
import Input from "@/components/ui/TextInput/TextInput"
import GroupSelector from "@/components/ui/GroupSelector"
import GlassView from "@/components/ui/GlassView"
import Colors from "@/constants/Colors"
import { Feather } from "@expo/vector-icons"
import { SymbolView } from "expo-symbols"
import { DatePicker as SwiftDatePicker, Host, BottomSheet, Group, RNHostView } from "@expo/ui/swift-ui"
import {
    datePickerStyle,
    frame,
    presentationDetents,
    presentationDragIndicator,
    background,
    ignoreSafeArea,
} from "@expo/ui/swift-ui/modifiers"
import Color from "color"
import dayjs from "dayjs"
import moment from "moment"
import { useState } from "react"
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native"
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
import Background from "@/components/ui/Background"

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

                <Background {...{ tintColor: CategoryUtils.getCategoryColor(state.category, state.type) }} />

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

type SheetKey = "category" | "spontaneous" | "account" | "shop" | "note" | "tags"

const SHEET_DETENTS: Record<SheetKey, { fraction: number }> = {
    category: { fraction: 0.6 },
    account: { fraction: 0.6 },
    shop: { fraction: 0.6 },
    note: { fraction: 0.6 },
    tags: { fraction: 0.6 },
    spontaneous: { fraction: 0.6 },
}

function DetailsSection({ isEditing }: { isEditing: boolean }) {
    const { state, methods } = useCreateExpenseContext()
    const { data: subAccountsData } = useSubAccounts()
    const { data: shopsData } = useShops()
    const subAccounts = subAccountsData?.wallet.subAccounts ?? []

    const hasExtras = !!(state.shop || state.note || state.tags || state.spontaneousRate > 0)
    const [showExtras, setShowExtras] = useState(() => isEditing && hasExtras)
    const [sheetKey, setSheetKey] = useState<SheetKey | null>(null)
    const [sheetPresented, setSheetPresented] = useState(false)

    const openSheet = (key: SheetKey) => {
        setSheetKey(key)
        setSheetPresented(true)
        Feedback.trigger("impactLight")
    }

    const closeSheet = () => setSheetPresented(false)

    const { category, spontaneousRate, subAccountId, shop, note, tags } = state

    const hasCategory = category !== "none"
    const catColor = hasCategory
        ? Color(Icons[category]?.backgroundColor ?? Colors.secondary)
              .lighten(0.25)
              .hex()
        : undefined
    const spontaneousActive = spontaneousRate > 0
    const spontaneousColor = getRateColor(spontaneousRate)
    const selectedAccount = subAccounts.find((a) => a.id === subAccountId) ?? null
    const selectedShopEntity = shopsData?.shops.find((s) => s.id === state.shopEntityId) ?? null
    const tagsPreview = tags ? tags.split(",").filter(Boolean).join(" ") : null

    const detent = sheetKey ? SHEET_DETENTS[sheetKey] : { fraction: 0.5 }

    return (
        <>
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
                        <Pressable onPress={() => openSheet("category")} style={styles.row}>
                            <Text variant="subtitle">Category</Text>
                            <View style={styles.rowRight}>
                                <SymbolView
                                    name="tag.fill"
                                    size={15}
                                    tintColor={hasCategory ? catColor : Colors.foreground_secondary}
                                />
                                <Text variant="body" style={[styles.rowValue, hasCategory && { color: catColor }]}>
                                    {hasCategory ? CategoryUtils.getCategoryName(category) : "None"}
                                </Text>
                            </View>
                        </Pressable>
                    </>
                )}

                {subAccounts.length > 0 && (
                    <>
                        <View style={styles.divider} />
                        <Pressable onPress={() => openSheet("account")} style={styles.row}>
                            <Text variant="subtitle">Account</Text>
                            <View style={styles.rowRight}>
                                <SymbolView
                                    name="creditcard.fill"
                                    size={15}
                                    tintColor={selectedAccount ? Colors.secondary : Colors.foreground_secondary}
                                />
                                <Text
                                    variant="body"
                                    style={[styles.rowValue, selectedAccount && { color: Colors.secondary }]}
                                >
                                    {selectedAccount?.name ?? "Default"}
                                </Text>
                            </View>
                        </Pressable>
                    </>
                )}

                {showExtras && (
                    <>
                        <View style={styles.divider} />
                        <Pressable onPress={() => openSheet("shop")} style={styles.row}>
                            <Text variant="subtitle">Shop</Text>
                            <View style={styles.rowRight}>
                                {selectedShopEntity ? (
                                    <ShopImage image={selectedShopEntity.image} size={22} radius={6} />
                                ) : (
                                    <SymbolView
                                        name="storefront.fill"
                                        size={15}
                                        tintColor={shop ? Colors.secondary : Colors.foreground_secondary}
                                    />
                                )}
                                <Text
                                    variant="body"
                                    style={[styles.rowValue, shop ? { color: Colors.secondary } : undefined]}
                                >
                                    {shop || "None"}
                                </Text>
                            </View>
                        </Pressable>

                        <View style={styles.divider} />
                        <Pressable onPress={() => openSheet("note")} style={styles.row}>
                            <Text variant="subtitle">Note</Text>
                            <View style={styles.rowRight}>
                                <SymbolView
                                    name="note.text"
                                    size={15}
                                    tintColor={note ? Colors.secondary : Colors.foreground_secondary}
                                />
                                {note ? (
                                    <Text
                                        variant="body"
                                        style={[styles.rowValue, { color: Colors.secondary }]}
                                        numberOfLines={1}
                                    >
                                        {note}
                                    </Text>
                                ) : (
                                    <Text variant="body" style={styles.rowValue}>
                                        None
                                    </Text>
                                )}
                            </View>
                        </Pressable>

                        <View style={styles.divider} />
                        <Pressable onPress={() => openSheet("tags")} style={styles.row}>
                            <Text variant="subtitle">Tags</Text>
                            <View style={styles.rowRight}>
                                <SymbolView
                                    name="tag.fill"
                                    size={15}
                                    tintColor={tags?.length > 0 ? Colors.secondary : Colors.foreground_secondary}
                                />
                                {tagsPreview ? (
                                    <Text
                                        variant="body"
                                        style={[styles.rowValue, { color: Colors.secondary }]}
                                        numberOfLines={1}
                                    >
                                        {tagsPreview}
                                    </Text>
                                ) : (
                                    <Text variant="body" style={styles.rowValue}>
                                        None
                                    </Text>
                                )}
                            </View>
                        </Pressable>

                        <View style={styles.divider} />
                        <Pressable onPress={() => openSheet("spontaneous")} style={styles.row}>
                            <Text variant="subtitle">Impulsiveness</Text>
                            <View style={styles.rowRight}>
                                <SymbolView
                                    name="bolt.fill"
                                    size={15}
                                    tintColor={spontaneousActive ? spontaneousColor : Colors.foreground_secondary}
                                />
                                <Text
                                    variant="body"
                                    style={[styles.rowValue, spontaneousActive && { color: spontaneousColor }]}
                                >
                                    {spontaneousRate === 0 ? "None" : `${spontaneousRate}%`}
                                </Text>
                            </View>
                        </Pressable>
                    </>
                )}

                <Pressable
                    onPress={() => {
                        Feedback.trigger("impactLight")
                        setShowExtras((p) => !p)
                    }}
                    style={styles.expandBtn}
                >
                    <Text style={styles.expandBtnText}>{showExtras ? "Fewer options" : "More options"}</Text>
                    <Feather
                        name={showExtras ? "chevron-up" : "chevron-down"}
                        size={13}
                        color={Colors.foreground_secondary}
                    />
                </Pressable>
            </Section>

            <Host style={{ position: "absolute", width: 0, height: 0 }}>
                <BottomSheet
                    isPresented={sheetPresented}
                    onIsPresentedChange={(p) => {
                        setSheetPresented(p)
                        if (!p) setSheetKey(null)
                    }}
                >
                    <Group
                        modifiers={[
                            presentationDetents([detent]),
                            presentationDragIndicator("visible"),
                            background(Colors.primary),
                            frame({ maxWidth: 10000, maxHeight: 10000 }),
                            ignoreSafeArea({ edges: "bottom" }),
                        ]}
                    >
                        {/* @ts-ignore */}
                        <RNHostView>
                            <View style={styles.sheetInner}>
                                {sheetKey === "category" && (
                                    <CategorySelector
                                        current={category}
                                        onPress={(item) => {
                                            methods.setCategory(item as keyof typeof Icons)
                                            methods.setIsSubscription(item === "subscription")
                                            methods.setType("expense")
                                            closeSheet()
                                        }}
                                        dismiss={closeSheet}
                                    />
                                )}
                                {sheetKey === "account" && (
                                    <AccountSheetContent
                                        subAccounts={subAccounts}
                                        subAccountId={subAccountId}
                                        onSelect={(id) => {
                                            methods.setSubAccountId(id)
                                            closeSheet()
                                        }}
                                    />
                                )}
                                {sheetKey === "shop" && (
                                    <ShopPicker
                                        shop={shop}
                                        shopEntityId={state.shopEntityId}
                                        shops={shopsData?.shops ?? []}
                                        onSelect={(name, id) => {
                                            methods.setShop(name)
                                            methods.setShopEntityId(id)
                                            closeSheet()
                                        }}
                                        onClear={() => {
                                            methods.setShop("")
                                            methods.setShopEntityId(null)
                                        }}
                                    />
                                )}
                                {sheetKey === "note" && <NoteSheetContent note={note} onChangeNote={methods.setNote} />}
                                {sheetKey === "tags" && (
                                    <TagsSheetContent tagsString={tags} onChangeTags={methods.setTags} />
                                )}
                                {sheetKey === "spontaneous" && (
                                    <View style={styles.sheetContent}>
                                        <SpontaneousRateSelector onDismiss={closeSheet} />
                                    </View>
                                )}
                            </View>
                        </RNHostView>
                    </Group>
                </BottomSheet>
            </Host>
        </>
    )
}

function NoteSheetContent({ note, onChangeNote }: { note: string; onChangeNote: (v: string) => void }) {
    return (
        <View style={[styles.sheetContent, { flex: 1 }]}>
            <Input
                value={note}
                onChangeText={onChangeNote}
                placeholder="Write a note..."
                flat
                multiline
                autoFocus={!note}
                containerStyle={[styles.noteInputContainer, { flex: 1 }]}
                style={[styles.noteInput, { flex: 1 }]}
            />
        </View>
    )
}

function TagsSheetContent({ tagsString, onChangeTags }: { tagsString: string; onChangeTags: (v: string) => void }) {
    const [input, setInput] = useState("")
    const tags = tagsString ? tagsString.split(",").filter(Boolean) : []

    const addTag = () => {
        const trimmed = input.trim()
        if (!trimmed) return
        const tag = trimmed.startsWith("#") ? trimmed : `#${trimmed}`
        if (tags.includes(tag)) {
            setInput("")
            return
        }
        onChangeTags([...tags, tag].join(","))
        setInput("")
        Feedback.trigger("impactLight")
    }

    const removeTag = (index: number) => {
        onChangeTags(tags.filter((_, i) => i !== index).join(","))
        Feedback.trigger("impactLight")
    }

    return (
        <View style={[styles.sheetContent, { flex: 1 }]}>
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
    )
}

function AccountSheetContent({
    subAccounts,
    subAccountId,
    onSelect,
}: {
    subAccounts: { id: string; name: string }[]
    subAccountId: string | null
    onSelect: (id: string | null) => void
}) {
    const [query, setQuery] = useState("")
    const items = [{ id: null as string | null, name: "Default" }, ...subAccounts]
    const filtered = query ? items.filter((a) => a.name.toLowerCase().includes(query.toLowerCase())) : items

    return (
        <View style={styles.sheetContent}>
            <View style={styles.searchRow}>
                <Feather name="search" size={15} color="rgba(255,255,255,0.4)" />
                <TextInput
                    placeholder="Search account..."
                    placeholderTextColor="rgba(255,255,255,0.35)"
                    value={query}
                    onChangeText={setQuery}
                    style={styles.searchInput}
                />
            </View>
            {filtered.map((item) => {
                const active = subAccountId === item.id
                return (
                    <Ripple
                        key={item.id ?? "__default"}
                        onPress={() => {
                            Feedback.trigger("impactLight")
                            onSelect(item.id)
                        }}
                        style={[styles.accountRow, active && styles.accountRowActive]}
                    >
                        <Feather
                            name="credit-card"
                            size={16}
                            color={active ? Colors.secondary : Colors.foreground_secondary}
                        />
                        <Text style={[styles.accountLabel, active && { color: Colors.secondary }]}>{item.name}</Text>
                        {active && <Feather name="check" size={15} color={Colors.secondary} />}
                    </Ripple>
                )
            })}
        </View>
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

    const showFreeform = search.trim().length > 0 && filtered.length === 0

    return (
        <View style={styles.shopPickerContainer}>
            <View style={styles.searchRow}>
                <Feather name="search" size={15} color="rgba(255,255,255,0.4)" />
                <TextInput
                    placeholder="Search or type a shop name…"
                    placeholderTextColor="rgba(255,255,255,0.35)"
                    value={search}
                    onChangeText={(text) => {
                        setSearch(text)
                        if (shopEntityId) onClear()
                    }}
                    style={styles.searchInput}
                    autoFocus
                />
                {search.length > 0 && (
                    <Ripple
                        onPress={() => {
                            setSearch("")
                            onClear()
                        }}
                        style={styles.searchClearBtn}
                    >
                        <Feather name="x" size={15} color="rgba(255,255,255,0.5)" />
                    </Ripple>
                )}
            </View>

            {filtered.length > 0 && (
                <View style={styles.shopResults}>
                    {filtered.map((s) => (
                        <ShopSelectCard
                            key={s.id}
                            shop={s}
                            selected={shopEntityId === s.id}
                            onPress={() => onSelect(s.name, s.id)}
                        />
                    ))}
                </View>
            )}

            {showFreeform && (
                <Pressable onPress={() => onSelect(search.trim(), null as any)} style={styles.shopFreeformRow}>
                    <View style={styles.shopFreeformIcon}>
                        <Feather name="plus" size={13} color={Colors.primary} />
                    </View>
                    <Text style={styles.shopFreeformText}>Use "{search.trim()}"</Text>
                </Pressable>
            )}
        </View>
    )
}

const BASE_SHEET_MODIFIERS = [
    presentationDragIndicator("visible"),
    background(Colors.primary),
    frame({ maxWidth: 10000, maxHeight: 10000 }),
    ignoreSafeArea({ edges: "bottom" }),
]

const DATE_PICKER_MODIFIERS = [presentationDetents([{ fraction: 0.5 }]), ...BASE_SHEET_MODIFIERS]
const TIME_PICKER_MODIFIERS = [presentationDetents([{ fraction: 0.3 }]), ...BASE_SHEET_MODIFIERS]

function DateSection() {
    const { state, methods } = useCreateExpenseContext()
    const [datePresented, setDatePresented] = useState(false)
    const [timePresented, setTimePresented] = useState(false)
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
        <>
            <Section title="Date">
                <Pressable
                    onPress={() => {
                        Feedback.trigger("impactLight")
                        setDatePresented(true)
                    }}
                    style={styles.row}
                >
                    <Text variant="subtitle">Date</Text>
                    <View style={styles.rowRight}>
                        <SymbolView name="calendar" size={15} tintColor={Colors.foreground_secondary} />
                        <Text variant="body" style={styles.rowValue}>
                            {dateObj.format("DD MMMM YYYY")}
                        </Text>
                    </View>
                </Pressable>

                <View style={styles.divider} />

                <Pressable
                    onPress={() => {
                        Feedback.trigger("impactLight")
                        setTimePresented(true)
                    }}
                    style={styles.row}
                >
                    <Text variant="subtitle">Time</Text>
                    <View style={styles.rowRight}>
                        <SymbolView name="clock.fill" size={15} tintColor={Colors.foreground_secondary} />
                        <Text variant="body" style={styles.rowValue}>
                            {dateObj.format("HH:mm")}
                        </Text>
                    </View>
                </Pressable>
            </Section>

            <Host style={{ position: "absolute", width: 0, height: 0 }}>
                <BottomSheet isPresented={datePresented} onIsPresentedChange={setDatePresented}>
                    <Group modifiers={DATE_PICKER_MODIFIERS}>
                        {/* @ts-ignore */}
                        <RNHostView>
                            <View style={styles.datePickerContainer}>
                                <Host matchContents>
                                    <SwiftDatePicker
                                        selection={dateObj.toDate()}
                                        onDateChange={setDatePart}
                                        modifiers={[
                                            datePickerStyle("graphical"),
                                            frame({ width: layout.screen.width - 30 }),
                                        ]}
                                    />
                                </Host>
                            </View>
                        </RNHostView>
                    </Group>
                </BottomSheet>

                <BottomSheet isPresented={timePresented} onIsPresentedChange={setTimePresented}>
                    <Group modifiers={TIME_PICKER_MODIFIERS}>
                        {/* @ts-ignore */}
                        <RNHostView>
                            <View style={styles.datePickerContainer}>
                                <Host matchContents>
                                    <SwiftDatePicker
                                        selection={dateObj.toDate()}
                                        displayedComponents={["hourAndMinute"]}
                                        onDateChange={setTimePart}
                                        modifiers={[
                                            datePickerStyle("wheel"),
                                            frame({ width: layout.screen.width - 30, height: 200 }),
                                        ]}
                                    />
                                </Host>
                            </View>
                        </RNHostView>
                    </Group>
                </BottomSheet>
            </Host>
        </>
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
                <SymbolView
                    name="list.bullet"
                    size={16}
                    tintColor={count > 0 ? Colors.secondary : Colors.foreground_secondary}
                />
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
        paddingTop: 80,
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
    datePickerContainer: {
        flex: 1,
        backgroundColor: Colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    sheetInner: {
        flex: 1,
        backgroundColor: Colors.primary,
        paddingHorizontal: 15,
        paddingTop: 30,
    },
    sheetContent: {
        gap: 12,
    },
    sheetTitle: {
        marginBottom: 4,
    },
    searchRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.primary_lighter,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: "#fff",
        padding: 0,
    },
    searchClearBtn: {
        padding: 4,
    },
    shopPickerContainer: {
        paddingBottom: 14,
        gap: 10,
    },
    shopResults: {
        gap: 8,
    },
    shopFreeformRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 16,
        backgroundColor: Color(Colors.secondary).alpha(0.08).string(),
        borderWidth: 1,
        borderColor: Color(Colors.secondary).alpha(0.2).string(),
    },
    shopFreeformIcon: {
        width: 28,
        height: 28,
        borderRadius: 100,
        backgroundColor: Colors.secondary,
        justifyContent: "center",
        alignItems: "center",
    },
    shopFreeformText: {
        color: Colors.secondary,
        fontSize: 14,
        fontWeight: "500",
        flex: 1,
    },
    noteInputContainer: {
        borderRadius: 14,
        backgroundColor: Color(Colors.primary_lighter).alpha(0.5).string(),
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.borderColor,
        alignItems: "flex-start",
    },
    noteInput: {
        paddingTop: 4,
        textAlignVertical: "top",
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
