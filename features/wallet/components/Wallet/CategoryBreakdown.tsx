import { useMemo, useState } from "react"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import moment from "moment"
import Colors, { secondary_candidates } from "@/constants/Colors"
import Color from "color"
import Text from "@/components/ui/Text/Text"
import { Ionicons } from "@expo/vector-icons"
import useGetWallet from "../../hooks/useGetWallet"
import { CategoryIcon, CategoryUtils, Icons } from "../Expense/ExpenseIcon"

const EXCLUDED = new Set(["income", "edit", "none"])

export default function CategoryBreakdown() {
    const [showLegend, setShowLegend] = useState(false)

    const { data } = useGetWallet({
        defaultFilters: {
            type: "expense",
            date: {
                from: moment().startOf("month").format("YYYY-MM-DD"),
                to: moment().endOf("month").format("YYYY-MM-DD"),
            },
        },
    })

    const { categories, total, income, monthlyPercentageTarget, targetBudget, remaining } = useMemo(() => {
        const wallet = data?.wallet
        const expenses = wallet?.expenses2?.[0]?.expenses ?? []
        const income = wallet?.income ?? 0
        const monthlyPercentageTarget = wallet?.monthlyPercentageTarget ?? null

        const map = new Map<string, number>()
        for (const e of expenses) {
            if (!e.category || EXCLUDED.has(e.category)) continue
            const root = e.category.split(":")[0]
            map.set(root, (map.get(root) ?? 0) + (e.amount ?? 0))
        }

        const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1])
        const total = sorted.reduce((s, [, v]) => s + v, 0)

        const main: typeof sorted = []
        let othersAmount = 0
        for (const entry of sorted) {
            if (total > 0 && entry[1] / total < 0.05) othersAmount += entry[1]
            else main.push(entry)
        }

        const targetBudget =
            monthlyPercentageTarget !== null && income > 0 ? income * (monthlyPercentageTarget / 100) : null

        const barTotal = targetBudget ?? total

        const categories = main.map(([cat, amount], i) => ({
            category: cat,
            amount,
            color:
                Icons[cat as keyof typeof Icons]?.backgroundColor ??
                secondary_candidates[i % secondary_candidates.length],
            flex: barTotal > 0 ? amount / barTotal : 0,
            pct: total > 0 ? (amount / total) * 100 : 0,
        }))

        if (othersAmount > 0) {
            categories.push({
                category: "others",
                amount: othersAmount,
                color: "#6B7280",
                flex: barTotal > 0 ? othersAmount / barTotal : 0,
                pct: total > 0 ? (othersAmount / total) * 100 : 0,
            })
        }

        const remaining = targetBudget !== null && total < targetBudget ? targetBudget - total : null

        return { categories, total, income, monthlyPercentageTarget, targetBudget, remaining }
    }, [data])

    const spentPct = income > 0 ? (total / income) * 100 : 0
    const targetPct = monthlyPercentageTarget ?? null
    const reachedTarget = targetPct !== null && spentPct >= targetPct

    if (categories.length === 0) return null

    const remainingFlex = targetBudget && remaining ? remaining / targetBudget : 0

    return (
        <View style={styles.container}>
            <View style={styles.topRow}>
                <Text style={styles.monthLabel}>{moment().format("MMMM YYYY")}</Text>

                <View style={styles.rightBlock}>
                    <Text style={styles.totalAmount}>{total.toFixed(2)} zł</Text>
                    {targetPct !== null && income > 0 && (
                        <Text style={[styles.targetInfo, reachedTarget ? styles.textOver : styles.textMuted]}>
                            {reachedTarget
                                ? "Target reached"
                                : `${(targetPct - spentPct).toFixed(0)}% left of ${targetPct}% target`}
                        </Text>
                    )}
                </View>
            </View>

            <View style={styles.barRow}>
                {categories.map((c, i) => (
                    <View
                        key={c.category}
                        style={[
                            styles.barSegment,
                            { flex: c.flex, backgroundColor: c.color },
                            i === 0 && styles.barFirst,
                            remaining === null && i === categories.length - 1 && styles.barLast,
                        ]}
                    />
                ))}
                {remaining !== null && remaining > 0 && (
                    <View style={[styles.barSegment, styles.barLast, styles.barEmpty, { flex: remainingFlex }]} />
                )}
            </View>

            <TouchableOpacity style={styles.toggleRow} onPress={() => setShowLegend((v) => !v)} activeOpacity={0.6}>
                <View style={styles.toggleDivider} />
                <View style={styles.toggleChip}>
                    <Ionicons
                        name={showLegend ? "chevron-up" : "chevron-down"}
                        size={13}
                        color={Colors.foreground_secondary}
                    />
                </View>
                <View style={styles.toggleDivider} />
            </TouchableOpacity>

            {showLegend && (
                <View style={styles.legendGrid}>
                    {categories.map((c) => (
                        <View key={c.category} style={styles.legendItem}>
                            <CategoryIcon
                                category={c.category as any}
                                type="expense"
                                size={16}
                                containerStyle={styles.iconContainer}
                            />
                            <View style={styles.legendMid}>
                                <Text style={styles.catName}>
                                    {c.category === "others"
                                        ? "Others"
                                        : CategoryUtils.getCategoryName(c.category).replace(/\b\w/g, (l) =>
                                              l.toUpperCase(),
                                          )}
                                </Text>
                                <View style={[styles.catBar, { backgroundColor: Color(c.color).alpha(0.15).string() }]}>
                                    <View
                                        style={[
                                            styles.catBarFill,
                                            { width: `${c.pct}%` as any, backgroundColor: c.color },
                                        ]}
                                    />
                                </View>
                            </View>
                            <View style={styles.legendRight}>
                                <Text style={[styles.catAmount, { color: c.color }]}>{c.amount.toFixed(0)} zł</Text>
                                <Text style={styles.catPct}>{c.pct.toFixed(0)}%</Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.primary_light,
        borderRadius: 20,
        padding: 16,
        gap: 14,
    },
    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: "600",
        color: Colors.foreground_secondary,
        textTransform: "uppercase",
        letterSpacing: 0.8,
    },
    monthLabel: {
        fontSize: 25,
        fontWeight: "700",
        color: Colors.foreground,
        marginTop: 2,
    },
    rightBlock: {
        alignItems: "flex-end",
        gap: 3,
    },
    totalAmount: {
        fontSize: 20,
        fontWeight: "700",
        color: Colors.foreground,
    },
    targetInfo: {
        fontSize: 11,
        fontWeight: "500",
    },
    textOver: {
        color: "#f44336",
    },
    textMuted: {
        color: Colors.foreground_secondary,
    },
    barRow: {
        flexDirection: "row",
        height: 25,
        overflow: "hidden",
        gap: 5,
    },
    barSegment: {
        height: "100%",
        borderRadius: 10,
    },
    barFirst: {
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
    },
    barLast: {
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
    },
    barEmpty: {
        backgroundColor: Colors.primary_lighter,
        borderWidth: 1,
        borderColor: Color(Colors.foreground).alpha(0.08).string(),
        borderStyle: "dashed",
    },
    toggleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    toggleDivider: {
        flex: 1,
        height: 1,
        backgroundColor: Color(Colors.foreground).alpha(0.07).string(),
    },
    toggleChip: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        backgroundColor: Colors.primary_lighter,
    },
    legendGrid: {
        gap: 8,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: Colors.primary_lighter,
        borderRadius: 14,
        paddingRight: 14,
        paddingVertical: 4,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 12,
    },
    legendMid: {
        flex: 1,
        gap: 5,
    },
    catName: {
        fontSize: 13,
        fontWeight: "600",
        color: Colors.foreground,
    },
    catBar: {
        height: 4,
        borderRadius: 4,
        overflow: "hidden",
    },
    catBarFill: {
        height: "100%",
        borderRadius: 4,
    },
    legendRight: {
        alignItems: "flex-end",
        gap: 1,
    },
    catAmount: {
        fontSize: 13,
        fontWeight: "700",
    },
    catPct: {
        fontSize: 11,
        color: Colors.foreground_secondary,
        fontWeight: "500",
    },
})
