import { FONTS } from "@/constants/Fonts"
import Input from "@/components/ui/TextInput/TextInput"
import { useEffect, useState } from "react"
import { StyleSheet, Switch, TouchableOpacity, View } from "react-native"
import Text from "@/components/ui/Text/Text"
import { useWalletContext, type Action, type Filters } from "../components/WalletContext"
import DatePicker from "@/components/DatePicker"
import { formatDate } from "@/utils/functions/parseDate"
import CategorySelect from "../components/CreateExpense/CategorySelect"
import Colors from "@/constants/Colors"
import { useNavigation } from "@react-navigation/native"
import { Feather } from "@expo/vector-icons"
import { CategoryUtils } from "../components/Expense/ExpenseIcon"
import { ModalHeader } from "@/components"
import dayjs from "dayjs"
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated"
import GroupSelector from "@/components/ui/GroupSelector"
import { useSubAccounts } from "../hooks/useSubAccounts"
import Color from "color"
import Feedback from "react-native-haptic-feedback"

const CARD_BG = Color(Colors.primary).lighten(0.4).string()
const SEPARATOR = "rgba(255,255,255,0.08)"

interface FiltersFormProps {
    filters: Filters
    dispatch: (action: Action) => void
}

export default function ExpenseFiltersSheet() {
    const { filters, dispatch } = useWalletContext()
    return <FiltersForm filters={filters} dispatch={dispatch} />
}

function SectionLabel({ title }: { title: string }) {
    return <Text style={s.sectionLabel}>{title}</Text>
}

function Card({ children }: { children: React.ReactNode }) {
    return <View style={s.card}>{children}</View>
}

function RowSeparator() {
    return <View style={s.separator} />
}

const FiltersForm = ({ filters, dispatch }: FiltersFormProps) => {
    const navigation = useNavigation()
    const { data: subAccountsData } = useSubAccounts()
    const subAccounts = subAccountsData?.wallet?.subAccounts ?? []

    const scrollY = useSharedValue(0)
    const onScroll = useAnimatedScrollHandler({ onScroll: (e) => { scrollY.value = e.contentOffset.y } })

    const fromDate = filters.date.from ? new Date(filters.date.from) : new Date()
    const toDate = filters.date.to ? new Date(filters.date.to) : new Date()

    const [timeFrom, setTimeFrom] = useState(filters.time?.from ?? "")
    const [timeTo, setTimeTo] = useState(filters.time?.to ?? "")
    const [shopName, setShopName] = useState(filters.shopName ?? "")

    useEffect(() => {
        const t = setTimeout(() => dispatch({ type: "SET_TIME_FROM", payload: timeFrom }), 400)
        return () => clearTimeout(t)
    }, [timeFrom])

    useEffect(() => {
        const t = setTimeout(() => dispatch({ type: "SET_TIME_TO", payload: timeTo }), 400)
        return () => clearTimeout(t)
    }, [timeTo])

    useEffect(() => {
        const t = setTimeout(() => dispatch({ type: "SET_SHOP_NAME", payload: shopName || undefined }), 400)
        return () => clearTimeout(t)
    }, [shopName])

    return (
        <View style={{ flex: 1 }}>
            <ModalHeader
                title="Filters"
                onClose={navigation.goBack}
                saveLabel="Clear"
                onSave={() => {
                    dispatch({ type: "RESET" })
                    navigation.goBack()
                }}
            />
            <Animated.ScrollView
                keyboardDismissMode="on-drag"
                onScroll={onScroll}
                contentContainerStyle={s.scrollContent}
            >
                <SectionLabel title="Type" />
                <GroupSelector
                    options={[
                        { label: "All", value: undefined },
                        { label: "Income", value: "income" },
                        { label: "Expense", value: "expense" },
                        { label: "Refunded", value: "refunded" },
                    ]}
                    onChange={(value) => dispatch({ type: "SET_TYPE", payload: value === "all" ? undefined : value })}
                    value={filters.type || "all"}
                />

                <SectionLabel title="Date Range" />
                <Card>
                    <View style={s.dateRow}>
                        <DatePicker
                            mode="single"
                            placeholder={filters.date.from || "Start date"}
                            dates={{ start: fromDate, end: fromDate }}
                            setDates={({ start }) => dispatch({ type: "SET_DATE_MIN", payload: formatDate(start) })}
                        />
                        <Text style={s.dateSep}>–</Text>
                        <DatePicker
                            mode="single"
                            placeholder={filters.date.to || "End date"}
                            dates={{ start: toDate, end: toDate }}
                            setDates={({ start }) => dispatch({ type: "SET_DATE_MAX", payload: formatDate(start) })}
                        />
                    </View>
                    {(filters.date.from || filters.date.to) && (
                        <>
                            <RowSeparator />
                            <View style={s.quickDatesRow}>
                                {[
                                    { label: "Today", from: dayjs().format("YYYY-MM-DD"), to: dayjs().format("YYYY-MM-DD") },
                                    { label: "This week", from: dayjs().startOf("week").format("YYYY-MM-DD"), to: dayjs().endOf("week").format("YYYY-MM-DD") },
                                    { label: "This month", from: dayjs().startOf("month").format("YYYY-MM-DD"), to: dayjs().endOf("month").format("YYYY-MM-DD") },
                                ].map((preset) => (
                                    <TouchableOpacity
                                        key={preset.label}
                                        style={s.quickChip}
                                        onPress={() => {
                                            dispatch({ type: "SET_DATE_MIN", payload: preset.from })
                                            dispatch({ type: "SET_DATE_MAX", payload: preset.to })
                                        }}
                                    >
                                        <Text style={s.quickChipText}>{preset.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </>
                    )}
                </Card>

                <SectionLabel title="Time of Day" />
                <Card>
                    <View style={s.timeRow}>
                        <View style={s.timeField}>
                            <Text style={s.timeLabel}>From</Text>
                            <Input
                                value={timeFrom}
                                onChangeText={setTimeFrom}
                                placeholder="00:00"
                                placeholderTextColor={Colors.text_dark}
                                keyboardType="numbers-and-punctuation"
                                style={s.timeInput}
                                containerStyle={s.timeInputContainer}
                            />
                        </View>
                        <Feather name="arrow-right" size={14} color={Colors.foreground_secondary} style={{ marginTop: 18 }} />
                        <View style={s.timeField}>
                            <Text style={s.timeLabel}>To</Text>
                            <Input
                                value={timeTo}
                                onChangeText={setTimeTo}
                                placeholder="23:59"
                                placeholderTextColor={Colors.text_dark}
                                keyboardType="numbers-and-punctuation"
                                style={s.timeInput}
                                containerStyle={s.timeInputContainer}
                            />
                        </View>
                    </View>
                    <RowSeparator />
                    <View style={s.quickDatesRow}>
                        {[
                            { label: "Morning", from: "06:00", to: "12:00" },
                            { label: "Afternoon", from: "12:00", to: "18:00" },
                            { label: "Evening", from: "18:00", to: "24:00" },
                            { label: "Night", from: "00:00", to: "06:00" },
                        ].map((p) => {
                            const active = timeFrom === p.from && timeTo === p.to
                            return (
                                <TouchableOpacity
                                    key={p.label}
                                    style={[s.quickChip, active && s.quickChipActive]}
                                    onPress={() => {
                                        setTimeFrom(p.from)
                                        setTimeTo(p.to)
                                    }}
                                >
                                    <Text style={[s.quickChipText, active && s.quickChipTextActive]}>{p.label}</Text>
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                </Card>

                <SectionLabel title="Amount" />
                <Card>
                    <View style={s.amountRow}>
                        <Input
                            keyboardAppearance="dark"
                            keyboardType="numeric"
                            label="Min"
                            value={filters.amount.min === 0 ? "" : filters.amount.min.toString()}
                            placeholder="0"
                            placeholderTextColor={Colors.text_dark}
                            containerStyle={{ flex: 1 }}
                            right={<Text style={s.currencyLabel}>zł</Text>}
                            style={{ textAlign: "center" }}
                            onChangeText={(text) =>
                                dispatch({ type: "SET_AMOUNT_MIN", payload: Number.isNaN(parseInt(text)) ? 0 : parseInt(text) })
                            }
                        />
                        <Feather name="arrow-right" size={14} color={Colors.foreground_secondary} style={{ marginTop: 18 }} />
                        <Input
                            keyboardAppearance="dark"
                            keyboardType="numeric"
                            label="Max"
                            value={filters.amount.max === 999999999 ? "" : filters.amount.max.toString()}
                            placeholder="∞"
                            placeholderTextColor={Colors.text_dark}
                            containerStyle={{ flex: 1 }}
                            right={<Text style={s.currencyLabel}>zł</Text>}
                            style={{ textAlign: "center" }}
                            onChangeText={(text) =>
                                dispatch({ type: "SET_AMOUNT_MAX", payload: Number.isNaN(parseInt(text)) ? 999999999 : parseInt(text) })
                            }
                        />
                    </View>
                </Card>

                {subAccounts.length > 0 && (
                    <>
                        <SectionLabel title="Sub-account" />
                        <Card>
                            {subAccounts.map((sa, i) => {
                                const isSelected = filters.accountId === sa.id
                                const isLast = i === subAccounts.length - 1
                                return (
                                    <View key={sa.id}>
                                        <TouchableOpacity
                                            style={s.accountRow}
                                            activeOpacity={0.65}
                                            onPress={() => {
                                                Feedback.trigger("selection")
                                                dispatch({ type: "SET_ACCOUNT_ID", payload: isSelected ? undefined : sa.id })
                                            }}
                                        >
                                            <View style={[s.accountDot, { backgroundColor: sa.color ?? Colors.secondary }]} />
                                            <Text style={s.accountName}>{sa.name}</Text>
                                            {isSelected && (
                                                <Feather name="check" size={16} color={Colors.secondary} />
                                            )}
                                        </TouchableOpacity>
                                        {!isLast && <RowSeparator />}
                                    </View>
                                )
                            })}
                        </Card>
                    </>
                )}

                <SectionLabel title="Scheduled" />
                <Card>
                    <View style={s.switchRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={s.switchLabel}>Scheduled only</Text>
                            <Text style={s.switchSub}>Show only recurring / scheduled expenses</Text>
                        </View>
                        <Switch
                            value={filters.scheduled === true}
                            onValueChange={(v) => {
                                Feedback.trigger("selection")
                                dispatch({ type: "SET_SCHEDULED", payload: v ? true : undefined })
                            }}
                            trackColor={{ false: "rgba(255,255,255,0.15)", true: Colors.secondary }}
                            thumbColor={filters.scheduled === true ? Colors.primary : "rgba(255,255,255,0.85)"}
                        />
                    </View>
                    <RowSeparator />
                    <View style={s.switchRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={s.switchLabel}>Exclude scheduled</Text>
                            <Text style={s.switchSub}>Hide recurring / scheduled expenses</Text>
                        </View>
                        <Switch
                            value={filters.scheduled === false}
                            onValueChange={(v) => {
                                Feedback.trigger("selection")
                                dispatch({ type: "SET_SCHEDULED", payload: v ? false : undefined })
                            }}
                            trackColor={{ false: "rgba(255,255,255,0.15)", true: Colors.secondary }}
                            thumbColor={filters.scheduled === false ? Colors.primary : "rgba(255,255,255,0.85)"}
                        />
                    </View>
                </Card>

                <SectionLabel title="Shop" />
                <Card>
                    <Input
                        value={shopName}
                        onChangeText={setShopName}
                        placeholder="Filter by shop name..."
                        placeholderTextColor={Colors.text_dark}
                        containerStyle={{ borderRadius: 0 }}
                    />
                </Card>

                <SectionLabel title="Category" />
                <CategorySelect
                    maxSelectHeight={300}
                    multiSelect
                    closeOnSelect={false}
                    selected={Array.isArray(filters.category) ? filters.category : [filters.category]}
                    setSelected={(selected) =>
                        dispatch({ type: "SET_CATEGORY", payload: selected.map(CategoryUtils.getCategoryParent) })
                    }
                    isActive={(category) => filters.category.includes(category)}
                />

                <View style={{ height: 40 }} />
            </Animated.ScrollView>
        </View>
    )
}

const s = StyleSheet.create({
    scrollContent: {
        padding: 15,
        gap: 8,
    },
    sectionLabel: {
        color: Colors.text_dark,
        fontSize: 11.5,
        letterSpacing: 0.6,
        textTransform: "uppercase",
        marginBottom: 6,
        marginLeft: 4,
        marginTop: 12,
    },
    card: {
        backgroundColor: CARD_BG,
        borderRadius: 20,
        overflow: "hidden",
    },
    separator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: SEPARATOR,
        marginHorizontal: 14,
    },
    dateRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        paddingVertical: 8,
        gap: 10,
    },
    dateSep: {
        color: Colors.foreground_secondary,
        fontSize: 16,
    },
    quickDatesRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        padding: 12,
    },
    quickChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 100,
        backgroundColor: "rgba(255,255,255,0.07)",
    },
    quickChipActive: {
        backgroundColor: Colors.secondary,
    },
    quickChipText: {
        fontSize: 12,
        fontFamily: FONTS.semibold,
        color: Colors.foreground_secondary,
    },
    quickChipTextActive: {
        color: Colors.primary,
    },
    timeRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        paddingTop: 8,
        gap: 12,
    },
    timeField: {
        flex: 1,
    },
    timeLabel: {
        fontSize: 11,
        color: Colors.text_dark,
        marginBottom: 4,
        marginLeft: 2,
    },
    timeInput: {
        textAlign: "center",
        letterSpacing: 1,
    },
    timeInputContainer: {
        flex: 1,
    },
    amountRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        paddingVertical: 8,
        gap: 12,
    },
    currencyLabel: {
        color: Colors.foreground_secondary,
        fontSize: 14,
    },
    accountRow: {
        flexDirection: "row",
        alignItems: "center",
        minHeight: 50,
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 12,
    },
    accountDot: {
        width: 10,
        height: 10,
        borderRadius: 100,
    },
    accountName: {
        flex: 1,
        color: Colors.text_light,
        fontSize: 15,
    },
    switchRow: {
        flexDirection: "row",
        alignItems: "center",
        minHeight: 52,
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 12,
    },
    switchLabel: {
        color: Colors.text_light,
        fontSize: 15,
    },
    switchSub: {
        color: Colors.foreground_secondary,
        fontSize: 12,
        marginTop: 2,
    },
})
