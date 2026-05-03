import { AnimatedSelector } from "@/components"
import DatePicker from "@/components/DatePicker"
import Skeleton from "@/components/SkeletonLoader/Skeleton"
import Header from "@/components/ui/Header/Header"
import Colors, { secondary_candidates } from "@/constants/Colors"
import Layout from "@/constants/Layout"
import Text from "@/components/ui/Text/Text"
import { CategoryIcon, CategoryUtils, Icons } from "../components/Expense/ExpenseIcon"
import PieChart from "../components/WalletChart/PieChart"
import { parseDateToText } from "../components/Wallet/WalletItem"
import { WalletScreens } from "../Main"
import { gql, useQuery } from "@apollo/client"
import Color from "color"
import moment from "moment"
import { useMemo, useState } from "react"
import { Pressable, ScrollView, StyleSheet, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Haptic from "react-native-haptic-feedback"
import Animated, { FadeIn, LinearTransition } from "react-native-reanimated"

const GET_LIMITS = gql`
    query Limits($range: String!, $date: String) {
        limits(range: $range, date: $date) {
            id
            category
            amount
            current
        }
    }
`

const GET_EXPENSES = gql`
    query GetExpensesForLimits($filters: GetWalletFilters, $take: Int) {
        wallet {
            expenses2(filters: $filters, take: $take) {
                expenses {
                    id
                    amount
                    date
                    description
                    type
                    category
                }
            }
        }
    }
`

function getDateRange(range: string) {
    const today = moment().format("YYYY-MM-DD")
    switch (range) {
        case "daily":
            return { from: today, to: today }
        case "weekly":
            return { from: moment().startOf("isoWeek").format("YYYY-MM-DD"), to: today }
        case "yearly":
            return { from: moment().startOf("year").format("YYYY-MM-DD"), to: today }
        default: // monthly
            return { from: moment().startOf("month").format("YYYY-MM-DD"), to: today }
    }
}

export default function LimitsDetail({ navigation }: WalletScreens<"LimitsDetail">) {
    const [range, setRange] = useState("monthly")
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [customDateRange, setCustomDateRange] = useState<{ from: string; to: string } | null>(null)
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

    const defaultDateRange = useMemo(() => getDateRange(range), [range])
    const dateRange = customDateRange ?? defaultDateRange

    const take = range === "yearly" && !customDateRange ? 12 : 1

    const { data: limitsData, loading: limitsLoading } = useQuery(GET_LIMITS, {
        variables: { range, date: dateRange.to },
        fetchPolicy: "cache-and-network",
    })

    const { data: expensesData, loading: expensesLoading } = useQuery(GET_EXPENSES, {
        variables: {
            filters: {
                date: { from: dateRange.from, to: dateRange.to },
                type: "expense",
            },
            take,
        },
        fetchPolicy: "cache-and-network",
    })

    const limits: { id: string; category: string; amount: number; current: number }[] = limitsData?.limits ?? []

    const allExpenses: any[] = useMemo(
        () => (expensesData?.wallet?.expenses2 ?? []).flatMap((m: any) => m.expenses),
        [expensesData],
    )

    const expensesByCategory = useMemo(
        () =>
            allExpenses.reduce(
                (acc, expense) => {
                    if (!acc[expense.category]) acc[expense.category] = []
                    acc[expense.category].push(expense)
                    return acc
                },
                {} as Record<string, any[]>,
            ),
        [allExpenses],
    )

    const pieData = useMemo(
        () =>
            limits
                .filter((l) => l.current > 0)
                .map((limit, i) => ({
                    label: CategoryUtils.getCategoryName(limit.category),
                    value: limit.current,
                    color:
                        Icons[limit.category as keyof typeof Icons]?.backgroundColor ??
                        secondary_candidates[i % secondary_candidates.length],
                    category: limit.category,
                })),
        [limits],
    )

    const totalSpent = useMemo(() => pieData.reduce((s, d) => s + d.value, 0), [pieData])

    const focusedIndex = useMemo(
        () => (selectedCategory ? pieData.findIndex((d) => d.category === selectedCategory) : null),
        [selectedCategory, pieData],
    )

    const selectedLimit = useMemo(
        () => (selectedCategory ? limits.find((l) => l.category === selectedCategory) : null),
        [selectedCategory, limits],
    )

    const centerLabel = useMemo(() => {
        if (!selectedLimit) return undefined
        const color = Icons[selectedLimit.category as keyof typeof Icons]?.backgroundColor ?? Colors.secondary
        const isOver = selectedLimit.current > selectedLimit.amount
        return {
            title: `${selectedLimit.current.toFixed(0)} / ${selectedLimit.amount.toFixed(0)}zł`,
            subtitle: CategoryUtils.getCategoryName(selectedLimit.category),
            color: isOver ? "#F07070" : color,
        }
    }, [selectedLimit])

    const visibleLimits = selectedCategory ? limits.filter((l) => l.category === selectedCategory) : limits
    const isLoading = limitsLoading && limits.length === 0

    return (
        <SafeAreaView style={styles.safe} edges={["top"]}>
            <Header
                title="Spending Limits"
                goBack
                buttons={[
                    {
                        icon: "plus",
                        onPress: () => navigation.navigate("CreateLimits"),
                        position: "right",
                    },
                ]}
            />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {pieData.length > 0 && (
                    <Animated.View entering={FadeIn} style={styles.chartWrap}>
                        <PieChart
                            data={pieData}
                            totalSum={totalSpent}
                            focusedIndex={focusedIndex}
                            centerLabel={centerLabel}
                            onPress={(dt) => {
                                Haptic.trigger("impactLight")
                                const cat =
                                    limits.find((l) => CategoryUtils.getCategoryName(l.category) === dt.label)
                                        ?.category ?? null
                                setSelectedCategory((prev) => (prev === cat ? null : cat))
                            }}
                        />
                    </Animated.View>
                )}

                <View style={styles.controlsRow}>
                    <AnimatedSelector
                        items={["daily", "weekly", "monthly", "yearly"]}
                        selectedItem={range}
                        onItemSelect={(r) => {
                            Haptic.trigger("impactLight")
                            setSelectedCategory(null)
                            setCustomDateRange(null)
                            setRange(r)
                        }}
                        containerStyle={{ backgroundColor: Colors.primary, flex: 1 }}
                        scale={0.85}
                    />
                    <DatePicker
                        mode="period"
                        dates={{
                            start: moment(dateRange.from).toDate(),
                            end: moment(dateRange.to).toDate(),
                        }}
                        setDates={({ start, end }) => {
                            Haptic.trigger("impactLight")
                            setCustomDateRange({
                                from: moment(start).format("YYYY-MM-DD"),
                                to: moment(end).format("YYYY-MM-DD"),
                            })
                        }}
                    />
                </View>

                {isLoading ? (
                    <LimitsSkeleton />
                ) : (
                    visibleLimits.map((limit) => {
                        const pct = Math.min(100, (limit.current / limit.amount) * 100)
                        const isOver = limit.current > limit.amount
                        const color = Icons[limit.category as keyof typeof Icons]?.backgroundColor ?? Colors.secondary
                        const expenses = expensesByCategory[limit.category] ?? []
                        const isSelected = selectedCategory === limit.category
                        const isExpanded = expandedCategories.has(limit.id)

                        return (
                            <Animated.View
                                key={limit.id}
                                entering={FadeIn}
                                style={[
                                    styles.section,
                                    isSelected && {
                                        borderColor: Color(color).alpha(0.6).hexa(),
                                        borderWidth: 1.5,
                                    },
                                ]}
                            >
                                {/* Category header */}
                                <Pressable
                                    style={({ pressed }) => [styles.catHeader, pressed && { opacity: 0.7 }]}
                                    onPress={() => {
                                        Haptic.trigger("impactLight")
                                        setSelectedCategory((prev) => (prev === limit.category ? null : limit.category))
                                        setExpandedCategories((prev) => {
                                            const next = new Set(prev)
                                            if (next.has(limit.id)) next.delete(limit.id)
                                            else next.add(limit.id)
                                            return next
                                        })
                                    }}
                                >
                                    <CategoryIcon
                                        category={limit.category as keyof typeof Icons}
                                        type="expense"
                                        size={16}
                                        style={styles.catIcon}
                                    />
                                    <View style={styles.catInfo}>
                                        <View style={styles.catTitleRow}>
                                            <Text variant="body" style={styles.catName}>
                                                {CategoryUtils.getCategoryName(limit.category)}
                                            </Text>
                                            <View style={styles.catTitleRight}>
                                                <Text
                                                    variant="caption"
                                                    style={[styles.pct, { color: isOver ? "#F07070" : color }]}
                                                >
                                                    {pct.toFixed(0)}%{isOver && "  over"}
                                                </Text>
                                                <Text variant="caption" style={styles.chevron}>
                                                    {isExpanded ? "▲" : "▼"}
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={styles.progressBg}>
                                            <View
                                                style={[
                                                    styles.progressFill,
                                                    {
                                                        width: `${pct}%` as any,
                                                        backgroundColor: isOver ? "#F07070" : color,
                                                    },
                                                ]}
                                            />
                                        </View>

                                        <Text variant="caption" style={styles.amountRow}>
                                            <Text
                                                variant="caption"
                                                style={{ color: isOver ? "#F07070" : "rgba(255,255,255,0.7)" }}
                                            >
                                                {limit.current.toFixed(2)} zł
                                            </Text>
                                            {"  /  "}
                                            {limit.amount.toFixed(2)} zł
                                        </Text>
                                    </View>
                                </Pressable>

                                {/* Expense rows — only when expanded */}
                                {isExpanded &&
                                    (expenses.length === 0 ? (
                                        <Text variant="caption" style={styles.empty}>
                                            No expenses this period
                                        </Text>
                                    ) : (
                                        expenses.map((expense: any) => (
                                            <Pressable
                                                key={expense.id}
                                                style={({ pressed }) => [
                                                    styles.expenseRow,
                                                    pressed && { opacity: 0.6 },
                                                ]}
                                                onPress={() => navigation.navigate("Expense", { expense })}
                                            >
                                                <View style={styles.expenseLeft}>
                                                    <Text variant="body" style={styles.expenseDesc} numberOfLines={1}>
                                                        {expense.description}
                                                    </Text>
                                                    <Text variant="caption" style={styles.expenseDate}>
                                                        {parseDateToText(expense.date)}
                                                    </Text>
                                                </View>
                                                <Text variant="body" style={styles.expenseAmount}>
                                                    -{expense.amount.toFixed(2)}{" "}
                                                    <Text variant="caption" style={styles.expenseAmountCurrency}>
                                                        zł
                                                    </Text>
                                                </Text>
                                            </Pressable>
                                        ))
                                    ))}
                            </Animated.View>
                        )
                    })
                )}
            </ScrollView>
        </SafeAreaView>
    )
}

function LimitsSkeleton() {
    const cardWidth = Layout.screen.width - 30
    const pieSize = (Layout.screen.width - 30) / 1.3

    return (
        <Skeleton size={{ width: cardWidth, height: 900 }}>
            <View style={{ gap: 15 }}>
                {/* Pie chart placeholder */}
                <View style={{ alignItems: "center", marginVertical: 5 }}>
                    <Skeleton.Item width={pieSize} height={pieSize} style={{ borderRadius: pieSize / 2 }} />
                </View>

                {/* 3 limit card placeholders */}
                {[0, 1, 2].map((i) => (
                    <View
                        key={i}
                        style={{
                            backgroundColor: Colors.primary_lighter,
                            borderRadius: 18,
                            padding: 14,
                            gap: 10,
                        }}
                    >
                        {/* Icon + title row */}
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                            <Skeleton.Item width={36} height={36} style={{ borderRadius: 10, marginTop: 0 }} />
                            <View style={{ flex: 1, gap: 8 }}>
                                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                    <Skeleton.Item
                                        width={(cardWidth - 80) * 0.45}
                                        height={14}
                                        style={{ borderRadius: 7, marginTop: 0 }}
                                    />
                                    <Skeleton.Item width={40} height={14} style={{ borderRadius: 7, marginTop: 0 }} />
                                </View>
                                {/* Progress bar */}
                                <Skeleton.Item
                                    width={cardWidth - 80}
                                    height={4}
                                    style={{ borderRadius: 2, marginTop: 0 }}
                                />
                                {/* Amount row */}
                                <Skeleton.Item
                                    width={(cardWidth - 80) * 0.55}
                                    height={11}
                                    style={{ borderRadius: 5, marginTop: 0 }}
                                />
                            </View>
                        </View>
                    </View>
                ))}
            </View>
        </Skeleton>
    )
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    content: {
        padding: 15,
        gap: 15,
        paddingBottom: 40,
        paddingTop: 45,
    },
    controlsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    chartWrap: {
        alignItems: "center",
        marginVertical: 5,
    },
    section: {
        backgroundColor: Colors.primary_lighter,
        borderRadius: 18,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: Color(Colors.primary_lighter).lighten(0.5).hex(),
    },
    catHeader: {
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        paddingBottom: 12,
    },
    catIcon: {
        padding: 0,
        marginRight: 12,
    },
    catInfo: {
        flex: 1,
        gap: 6,
    },
    catTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    catTitleRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    chevron: {
        color: "rgba(255,255,255,0.3)",
        fontSize: 10,
    },
    catName: {
        color: Colors.foreground,
        fontWeight: "600",
        fontSize: 15,
        textTransform: "capitalize",
    },
    pct: {
        fontSize: 13,
        fontWeight: "600",
    },
    progressBg: {
        height: 4,
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 2,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        borderRadius: 2,
    },
    amountRow: {
        color: "rgba(255,255,255,0.45)",
        fontSize: 12,
    },
    expenseRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        paddingVertical: 11,
        borderTopWidth: 0.5,
        borderTopColor: Color(Colors.primary_lighter).lighten(0.5).hex(),
        gap: 10,
    },
    expenseLeft: {
        flex: 1,
        gap: 2,
    },
    expenseDesc: {
        color: Colors.foreground,
        fontSize: 14,
        fontWeight: "500",
    },
    expenseDate: {
        color: "rgba(255,255,255,0.4)",
        fontSize: 11,
    },
    expenseAmount: {
        color: "#F07070",
        fontWeight: "600",
        fontSize: 14,
        flexShrink: 0,
    },
    expenseAmountCurrency: {
        color: "#F07070",
        fontSize: 11,
    },
    empty: {
        color: "rgba(255,255,255,0.3)",
        fontSize: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderTopWidth: 0.5,
        borderTopColor: Color(Colors.primary_lighter).lighten(0.5).hex(),
    },
})
