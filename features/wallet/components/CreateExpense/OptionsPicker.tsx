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
import React from "react"

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

function Chip({
    icon,
    value,
    valueColor,
    onPress,
}: {
    icon: React.ReactNode
    value: string
    valueColor?: string
    onPress?: () => void
}) {
    return (
        <Pressable
            style={({ pressed }) => [styles.chip, pressed && { opacity: 0.7 }]}
            onPress={() => {
                Feedback.trigger("impactLight")
                onPress?.()
            }}
        >
            <View style={styles.chipIcon}>{icon}</View>
            <Text style={[styles.chipValue, valueColor ? { color: valueColor } : undefined]} numberOfLines={1}>
                {value}
            </Text>
        </Pressable>
    )
}

export default function OptionsPicker() {
    const { state, methods } = useCreateExpenseContext()
    const { category, spontaneousRate, date, subAccountId, type, optionsCollapsed } = state
    const { setDate, setSubAccountId, setOptionsCollapsed } = methods

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

    const maybeExpand = () => {
        if (optionsCollapsed) {
            setOptionsCollapsed(false)
        }
    }

    const categoryValue = category === "none" ? "None" : CategoryUtils.getCategoryName(category)
    const spontaneousValue = spontaneousRate === 0 ? "Planned" : `${spontaneousRate}%`

    if (optionsCollapsed) {
        return (
            <View style={{ minHeight: 56 }}>
                <View style={styles.chipRow}>
                    <View style={styles.chips}>
                        <Chip
                            icon={<AntDesign name="calendar" size={14} color="rgba(255,255,255,0.6)" />}
                            value={dateLabel}
                            onPress={() => {
                                setOptionsCollapsed(false)
                                setExpanded("date")
                            }}
                        />
                        {type !== "income" && (
                            <Chip
                                icon={
                                    category !== "none" ? (
                                        React.cloneElement(Icons[category]?.icon as React.ReactElement, {
                                            width: 14,
                                            height: 14,
                                        })
                                    ) : (
                                        <AntDesign name="tag" size={14} color="rgba(255,255,255,0.6)" />
                                    )
                                }
                                value={categoryValue}
                                valueColor={categoryColor}
                                onPress={() => {
                                    setOptionsCollapsed(false)
                                    setExpanded("category")
                                }}
                            />
                        )}
                        <Chip
                            icon={<Text style={{ fontSize: 14 }}>{spontaneousEmoji(spontaneousRate)}</Text>}
                            value={spontaneousValue}
                            valueColor={spontaneousRate > 0 ? getRateColor(spontaneousRate) : undefined}
                            onPress={() => {
                                setOptionsCollapsed(false)
                                setExpanded("spontaneous")
                            }}
                        />
                        {hasAccount && (
                            <Chip
                                icon={
                                    <MaterialCommunityIcons
                                        name={selectedAccount ? (selectedAccount.icon as any) : "credit-card-outline"}
                                        size={14}
                                        color={selectedAccount ? selectedAccount.color : "rgba(255,255,255,0.6)"}
                                    />
                                }
                                value={selectedAccount ? selectedAccount.name : "Default"}
                                valueColor={selectedAccount ? selectedAccount.color : undefined}
                                onPress={() => {
                                    setOptionsCollapsed(false)
                                    setExpanded("account")
                                }}
                            />
                        )}
                    </View>
                    <Pressable
                        style={({ pressed }) => [styles.expandBtn, pressed && { opacity: 0.7 }]}
                        onPress={maybeExpand}
                    >
                        <MaterialCommunityIcons name="dots-horizontal" size={18} color="rgba(255,255,255,0.5)" />
                    </Pressable>
                </View>
            </View>
        )
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
                            value={categoryValue}
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
                        value={spontaneousValue}
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
                <Pressable
                    style={({ pressed }) => [styles.collapseBtn, pressed && { opacity: 0.7 }]}
                    onPress={() => {
                        setExpanded(null)
                        setOptionsCollapsed(true)
                    }}
                >
                    <MaterialCommunityIcons name="chevron-up" size={18} color="rgba(255,255,255,0.4)" />
                </Pressable>
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
    chipRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.primary_lighter,
        borderRadius: 18,
        paddingVertical: 10,
        paddingHorizontal: 12,
        gap: 8,
    },
    chips: {
        flex: 1,
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    chip: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.08)",
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 6,
        gap: 6,
    },
    chipIcon: {
        width: 14,
        alignItems: "center",
    },
    chipValue: {
        fontSize: 12,
        color: "rgba(255,255,255,0.6)",
        fontWeight: "500",
    },
    expandBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    collapseBtn: {
        alignItems: "center",
        paddingVertical: 6,
    },
})
