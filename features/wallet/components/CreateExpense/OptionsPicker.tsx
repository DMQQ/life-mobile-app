import Colors from "@/constants/Colors"
import { CategoryUtils, Icons } from "@/features/wallet/components/Expense/ExpenseIcon"
import { useCreateExpenseContext } from "@/features/wallet/context/CreateExpenseContext"
import { getRateColor } from "@/features/wallet/components/CreateExpense/SpontaneousRate"
import { SpontaneousRateSelector } from "@/features/wallet/components/CreateExpense/SpontaneousRate"
import CategorySelector from "@/features/wallet/components/CreateExpense/CategorySelectorView"
import { AntDesign, Entypo, MaterialCommunityIcons } from "@expo/vector-icons"
import Color from "color"
import dayjs from "dayjs"
import moment from "moment/moment"
import { useState } from "react"
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native"
import Animated, { FadeIn } from "react-native-reanimated"
import Feedback from "react-native-haptic-feedback"
import { Calendar } from "react-native-calendars"
import { useSubAccounts } from "../../hooks/useSubAccounts"

const spontaneousEmoji = (rate: number) => {
    if (rate <= 0) return "📅"
    if (rate <= 20) return "📝"
    if (rate <= 40) return "🏷️"
    if (rate <= 60) return "⏱️"
    if (rate <= 80) return "🍦"
    return "🛍️"
}

type ExpandedSection = "category" | "spontaneous" | "date" | "account" | null

const calendarTheme = {
    backgroundColor: "transparent",
    calendarBackground: "transparent",
    dayTextColor: "#FFFFFF",
    textDisabledColor: "#666666",
    monthTextColor: "#FFFFFF",
    textMonthFontSize: 16,
    textMonthFontWeight: "600" as const,
    selectedDayBackgroundColor: Colors.secondary,
    selectedDayTextColor: "#FFFFFF",
    todayTextColor: Colors.secondary,
    arrowColor: "#FFFFFF",
    textDayFontSize: 14,
    textDayHeaderFontSize: 12,
    textDayHeaderFontWeight: "500" as const,
    textSectionTitleColor: "#999999",
}

function Row({
    icon,
    label,
    value,
    valueColor,
    expanded,
    onPress,
    isLast,
}: {
    icon: React.ReactNode
    label: string
    value: string
    valueColor?: string
    expanded?: boolean
    onPress?: () => void
    isLast?: boolean
}) {
    return (
        <Pressable
            style={({ pressed }) => [styles.row, !isLast && styles.rowBorder, pressed && { opacity: 0.7 }]}
            onPress={() => {
                Feedback.trigger("impactLight")
                onPress?.()
            }}
            disabled={!onPress}
        >
            <View style={styles.iconWrap}>{icon}</View>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={[styles.rowValue, valueColor ? { color: valueColor } : undefined]} numberOfLines={1}>
                {value}
            </Text>
            {onPress && (
                <Entypo
                    name="chevron-right"
                    size={14}
                    color="rgba(255,255,255,0.3)"
                    style={{ transform: [{ rotate: expanded ? "90deg" : "0deg" }] }}
                />
            )}
        </Pressable>
    )
}

export default function OptionsPicker() {
    const { state, methods } = useCreateExpenseContext()
    const { category, spontaneousRate, date, subAccountId, type } = state
    const { setDate, setSubAccountId } = methods

    const { data: subAccountsData } = useSubAccounts()
    const subAccounts = subAccountsData?.wallet.subAccounts ?? []
    const selectedAccount = subAccounts.find((a) => a.id === subAccountId) ?? null

    const [expanded, setExpanded] = useState<ExpandedSection>(null)

    const toggle = (section: ExpandedSection) => {
        setExpanded((prev) => (prev === section ? null : section))
    }

    const isToday = moment(date).isSame(moment(), "day")
    const dateLabel = isToday ? "Today" : moment(date).format("MMM D, YYYY")

    const categoryColor =
        category !== "none" ? Color(Icons[category]?.backgroundColor).lighten(0.25).hex() : "rgba(255,255,255,0.5)"

    const hasAccount = subAccounts.length > 0

    const dateMarked: Record<string, any> = {}
    const dateStr = date ? moment(date).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD")
    dateMarked[dateStr] = {
        selected: true,
        selectedColor: Colors.secondary,
    }

    return (
        <View style={{ minHeight: 220 }}>
            <View style={styles.container}>
                <Row
                    icon={<AntDesign name="calendar" size={16} color="rgba(255,255,255,0.6)" />}
                    label="Date"
                    value={dateLabel}
                    expanded={expanded === "date"}
                    onPress={() => toggle("date")}
                    isLast={expanded !== "date" && type === "income" && !hasAccount}
                />
                {expanded === "date" && (
                    <Animated.View entering={FadeIn} style={[styles.expandedSection, { height: 350 }]}>
                        <Calendar
                            onDayPress={(day) => {
                                setDate(dayjs(day.dateString).format("YYYY-MM-DD"))
                                setExpanded(null)
                            }}
                            markedDates={dateMarked}
                            theme={calendarTheme}
                            style={{ borderRadius: 15 }}
                        />
                    </Animated.View>
                )}

                {type !== "income" && (
                    <>
                        <Row
                            icon={
                                category !== "none" ? (
                                    Icons[category]?.icon
                                ) : (
                                    <AntDesign name="tag" size={16} color="rgba(255,255,255,0.6)" />
                                )
                            }
                            label="Category"
                            value={category === "none" ? "None" : CategoryUtils.getCategoryName(category)}
                            valueColor={categoryColor}
                            expanded={expanded === "category"}
                            onPress={() => toggle("category")}
                            isLast={expanded !== "category"}
                        />
                        {expanded === "category" && (
                            <Animated.View entering={FadeIn} style={styles.expandedSection}>
                                <CategorySelector
                                    current={category}
                                    onPress={(item) => {
                                        methods.setCategory(item as any)
                                        methods.setIsSubscription(item === "subscription")
                                        methods.setType("expense")
                                        setExpanded(null)
                                    }}
                                    dismiss={() => setExpanded(null)}
                                />
                            </Animated.View>
                        )}
                    </>
                )}

                <>
                    <Row
                        icon={<Text style={{ fontSize: 16 }}>{spontaneousEmoji(spontaneousRate)}</Text>}
                        label="Spontaneous"
                        value={spontaneousRate === 0 ? "Planned" : `${spontaneousRate}%`}
                        valueColor={spontaneousRate > 0 ? getRateColor(spontaneousRate) : undefined}
                        expanded={expanded === "spontaneous"}
                        onPress={() => toggle("spontaneous")}
                        isLast={expanded !== "spontaneous" && !hasAccount}
                    />
                    {expanded === "spontaneous" && (
                        <Animated.View entering={FadeIn} style={styles.expandedSection}>
                            <SpontaneousRateSelector onDismiss={() => setExpanded(null)} />
                        </Animated.View>
                    )}
                </>

                {hasAccount && (
                    <>
                        <Row
                            icon={
                                <MaterialCommunityIcons
                                    name={selectedAccount ? (selectedAccount.icon as any) : "credit-card-outline"}
                                    size={16}
                                    color={selectedAccount ? selectedAccount.color : "rgba(255,255,255,0.6)"}
                                />
                            }
                            label="Account"
                            value={selectedAccount ? selectedAccount.name : "Default"}
                            valueColor={selectedAccount ? selectedAccount.color : undefined}
                            expanded={expanded === "account"}
                            onPress={() => toggle("account")}
                            isLast={expanded !== "account"}
                        />
                        {expanded === "account" && (
                            <Animated.View entering={FadeIn} style={styles.expandedSection}>
                                <FlatList
                                    data={[
                                        {
                                            id: null,
                                            name: "Default",
                                            icon: "credit-card-outline",
                                            color: "rgba(255,255,255,0.6)",
                                        },
                                        ...subAccounts,
                                    ]}
                                    keyExtractor={(item) => item.id ?? "__default"}
                                    scrollEnabled={false}
                                    renderItem={({ item }) => (
                                        <Pressable
                                            style={({ pressed }) => [
                                                styles.optionRow,
                                                {
                                                    backgroundColor:
                                                        subAccountId === item.id
                                                            ? Color(item.color || Colors.primary_light)
                                                                  .alpha(0.15)
                                                                  .rgb()
                                                                  .string()
                                                            : Colors.primary_lighter,
                                                    opacity: pressed ? 0.7 : 1,
                                                },
                                            ]}
                                            onPress={() => {
                                                Feedback.trigger("impactLight")
                                                setSubAccountId(item.id)
                                                setExpanded(null)
                                            }}
                                        >
                                            <MaterialCommunityIcons
                                                name={item.icon as any}
                                                size={18}
                                                color={item.color}
                                            />
                                            <Text style={styles.optionRowText}>{item.name}</Text>
                                            {subAccountId === item.id && (
                                                <Entypo name="check" size={16} color={item.color || Colors.secondary} />
                                            )}
                                        </Pressable>
                                    )}
                                />
                            </Animated.View>
                        )}
                    </>
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.primary_lighter,
        borderRadius: 18,
        overflow: "hidden",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 18,
        gap: 12,
    },
    rowBorder: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "rgba(255,255,255,0.07)",
    },
    iconWrap: {
        width: 22,
        alignItems: "center",
    },
    rowLabel: {
        flex: 1,
        fontSize: 14,
        color: "rgba(255,255,255,0.75)",
        fontWeight: "500",
    },
    rowValue: {
        fontSize: 14,
        color: "rgba(255,255,255,0.45)",
        maxWidth: 120,
        textAlign: "right",
    },
    expandedSection: {
        height: 300,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: "rgba(255,255,255,0.07)",
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "rgba(255,255,255,0.07)",
    },
    optionRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 10,
        gap: 12,
        marginBottom: 8,
    },
    optionRowText: {
        flex: 1,
        fontSize: 14,
        color: "rgba(255,255,255,0.85)",
        fontWeight: "500",
    },
})
