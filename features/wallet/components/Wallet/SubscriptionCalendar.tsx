import Colors from "@/constants/Colors"
import { CategoryIcon } from "@/features/wallet/components/Expense/ExpenseIcon"
import moment, { Moment } from "moment"
import { memo, useMemo, useState } from "react"
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native"
import SubscriptionItem from "../Subscription/SubscriptionItem"
import WalletItem from "./WalletItem"
import { useNavigation } from "@react-navigation/native"
import Color from "color"
import Layout from "@/constants/Layout"
import Section from "@/components/ui/Section"
import { Expense, Subscription } from "@/types"

interface Props {
    subscriptions?: Subscription[]
    expenses?: Expense[]

    style?: StyleProp<ViewStyle>
    width?: number
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function projectBillingDate(sub: Subscription, month: Moment): string | null {
    const anchor = moment(parseInt(sub.nextBillingDate))
    if (!anchor.isValid()) return null

    const monthStart = month.clone().startOf("month")
    const monthEnd = month.clone().endOf("month")
    const cycle = (sub.billingCycle ?? "").toLowerCase()

    if (cycle === "yearly") {
        const yearlyCandidate = anchor.clone().year(month.year())
        if (yearlyCandidate.isBetween(monthStart, monthEnd, "day", "[]")) {
            return yearlyCandidate.format("YYYY-MM-DD")
        }
        return null
    }

    if (cycle === "weekly") {
        let cur = anchor.clone()
        while (cur.isAfter(monthStart, "day")) cur.subtract(1, "week")
        while (cur.isBefore(monthStart, "day")) cur.add(1, "week")
        if (cur.isBetween(monthStart, monthEnd, "day", "[]")) {
            return cur.format("YYYY-MM-DD")
        }
        return null
    }

    if (cycle === "custom") {
        const monthNum = month.month() + 1
        const activeMonths = sub.customBillingMonths ?? []
        if (activeMonths.length > 0 && !activeMonths.includes(monthNum)) return null
        const day = sub.billingDay ?? anchor.date()
        const candidate = month.clone().date(day)
        if (candidate.isValid() && candidate.month() === month.month()) {
            return candidate.format("YYYY-MM-DD")
        }
        return null
    }

    const candidate = anchor.clone().year(month.year()).month(month.month())
    if (candidate.isBetween(monthStart, monthEnd, "day", "[]")) {
        return candidate.format("YYYY-MM-DD")
    }
    return null
}

interface DayCellProps {
    day: Moment
    isCurrentMonth: boolean
    isToday: boolean
    isSelected: boolean
    subs: Subscription[]
    dayExpenses: Expense[]
    cellSize: number
    onPress: () => void
}

const DayCell = memo(
    ({ day, isCurrentMonth, isToday, isSelected, subs, dayExpenses, cellSize, onPress }: DayCellProps) => {
        const icons = useMemo(() => {
            const result: { category: string; type: "income" | "expense" | "refunded" }[] = []
            for (const s of subs) {
                if (result.length >= 2) break
                result.push({ category: s.expenses?.[0]?.category ?? "subscriptions", type: "expense" })
            }
            for (const e of dayExpenses) {
                if (result.length >= 2) break
                result.push({ category: e.category, type: e.type as "income" | "expense" | "refunded" })
            }
            return result
        }, [subs, dayExpenses])

        return (
            <Pressable
                style={[
                    styles.dayCell,
                    { width: cellSize, height: cellSize * 1.15 },
                    !isCurrentMonth && styles.cellFaded,
                    isSelected && styles.daySelected,
                    isToday && !isSelected && styles.dayToday,
                ]}
                onPress={onPress}
            >
                <View style={{ width: "100%", alignItems: "center", paddingTop: 10 }}>
                    <Text
                        style={[
                            styles.dayNumber,
                            !isCurrentMonth && styles.dayFaded,
                            isToday && styles.dayTodayText,
                            isSelected && styles.daySelectedText,
                        ]}
                    >
                        {day.date()}
                    </Text>
                </View>
                <View style={[styles.dayInner]}>
                    {icons.length > 0 && (
                        <View style={styles.cellIcons}>
                            {icons.map((ic, idx) => (
                                <View key={idx} style={styles.cellIconClip}>
                                    <CategoryIcon
                                        category={ic.category as any}
                                        type={ic.type}
                                        size={14}
                                        style={styles.cellIcon}
                                    />
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </Pressable>
        )
    },
)

export default function SubscriptionCalendar({ subscriptions = [], expenses = [], style, width }: Props) {
    const currentMonth = moment().startOf("month")
    const [selectedDay, setSelectedDay] = useState<string | null>(null)
    const navigation = useNavigation<any>()

    const billingMap = useMemo(() => {
        const map = new Map<string, Subscription[]>()
        subscriptions.forEach((sub) => {
            const date = projectBillingDate(sub, currentMonth)
            if (!date) return
            if (!map.has(date)) map.set(date, [])
            map.get(date)!.push(sub)
        })
        return map
    }, [subscriptions, currentMonth])

    const expenseMap = useMemo(() => {
        const map = new Map<string, Expense[]>()
        expenses.forEach((e) => {
            const key = e.date?.slice(0, 10)
            if (!key) return
            if (!map.has(key)) map.set(key, [])
            map.get(key)!.push(e)
        })
        return map
    }, [expenses])

    const calendarDays = useMemo(() => {
        const start = currentMonth.clone().startOf("week")
        const end = currentMonth.clone().endOf("month").endOf("week")
        const days: Moment[] = []
        const cur = start.clone()
        while (cur.isSameOrBefore(end, "day")) {
            days.push(cur.clone())
            cur.add(1, "day")
        }
        return days
    }, [currentMonth])

    const today = moment().format("YYYY-MM-DD")
    const selectedSubs = selectedDay ? (billingMap.get(selectedDay) ?? []) : []
    const selectedExpenses = selectedDay ? (expenseMap.get(selectedDay) ?? []) : []

    const size = useMemo(() => ({ width: width ?? Layout.screen.width - 60 }), [width])

    const cellSize = size.width / 7 - 4

    const gridCells = useMemo(
        () =>
            calendarDays.map((day) => {
                const key = day.format("YYYY-MM-DD")
                return (
                    <DayCell
                        key={key}
                        day={day}
                        isCurrentMonth={day.month() === currentMonth.month()}
                        isToday={key === today}
                        isSelected={key === selectedDay}
                        subs={billingMap.get(key) ?? []}
                        dayExpenses={expenseMap.get(key) ?? []}
                        cellSize={cellSize}
                        onPress={() => setSelectedDay(key === selectedDay ? null : key)}
                    />
                )
            }),
        [calendarDays, billingMap, expenseMap, selectedDay, today, cellSize, currentMonth],
    )

    return (
        <View style={{ minHeight: 420 }}>
            <View style={[styles.calendarCard, style]}>
                <View style={styles.headerCenter}>
                    <View style={styles.monthNav}>
                        <Text style={styles.monthTitle}>{currentMonth.format("MMMM YYYY")}</Text>
                    </View>
                </View>

                <View style={styles.weekRow}>
                    {DAYS.map((d) => (
                        <Text key={d} style={styles.weekDayLabel}>
                            {d}
                        </Text>
                    ))}
                </View>

                <View style={styles.grid}>{gridCells}</View>
            </View>

            {selectedDay && (selectedSubs.length > 0 || selectedExpenses.length > 0) && (
                <View style={styles.detail}>
                    <Section title={moment(selectedDay).format("dddd, MMM D")}>
                        {selectedExpenses.length > 0 && (
                            <View style={styles.detailSection}>
                                {selectedExpenses.map((e, index) => (
                                    <WalletItem
                                        key={e.id}
                                        {...e}
                                        animatedStyle={{
                                            borderWidth: 0,
                                            marginBottom: 0,
                                            borderRadius: 0,
                                            borderBottomWidth: selectedExpenses.length - 1 === index ? 0 : 1,
                                            marginTop: 0,
                                        }}
                                        handlePress={() => {
                                            navigation.navigate("WalletScreens", {
                                                screen: "Expense",
                                                params: { expense: e },
                                            })
                                        }}
                                    />
                                ))}
                            </View>
                        )}

                        {selectedSubs.length > 0 && (
                            <View style={styles.detailSection}>
                                {selectedSubs.map((s, i) => (
                                    <SubscriptionItem
                                        key={s.id}
                                        subscription={s}
                                        index={i}
                                        onPress={() =>
                                            navigation.navigate("Subscription", {
                                                subscriptionId: s.id,
                                            })
                                        }
                                        style={{
                                            borderWidth: 0,
                                            marginBottom: 0,
                                            borderRadius: 0,
                                            borderBottomWidth: selectedSubs.length - 1 === i ? 0 : 1,
                                        }}
                                    />
                                ))}
                            </View>
                        )}
                    </Section>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    calendarCard: {
        borderRadius: 18,
    },
    headerCenter: {
        paddingTop: 5,
        marginBottom: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    monthNav: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    navBtn: {
        padding: 6,
    },
    monthTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: Colors.text_light,
        minWidth: 80,
        textAlign: "center",
        marginBottom: 10,
    },
    monthTotal: {
        fontSize: 12,
        fontWeight: "600",
        color: "#F07070",
    },
    weekRow: {
        flexDirection: "row",
        marginBottom: 8,
    },
    weekDayLabel: {
        flex: 1,
        textAlign: "center",
        fontSize: 11,
        fontWeight: "700",
        color: "rgba(255,255,255,0.3)",
        letterSpacing: 0.5,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 4,
    },
    dayCell: {
        backgroundColor: Colors.primary,
        borderRadius: 7.5,
    },
    cellBottom: {
        backgroundColor: Color(Colors.primary_lighter).lighten(0.3).hex(),
        justifyContent: "center",
        alignItems: "center",
        borderBottomRightRadius: 7.5,
        borderBottomLeftRadius: 7.5,
        padding: 3,
    },
    dayInner: {
        flex: 1,
        borderRadius: 7.5,
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
    },
    dayToday: {
        backgroundColor: Colors.secondary + "20",
    },
    daySelected: {
        backgroundColor: Colors.secondary + "80",
    },
    dayNumber: {
        fontSize: 11,
        fontWeight: "800",
        color: "rgba(255,255,255,0.75)",
    },
    dayFaded: {
        color: "rgba(255,255,255,0.18)",
    },
    cellFaded: {
        backgroundColor: Colors.primary_lighter,
    },
    dayTodayText: {
        color: Colors.text_light,
        fontWeight: "700",
    },
    daySelectedText: {
        color: Colors.secondary,
        fontWeight: "700",
    },
    cellIcons: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
    },
    cellIconClip: {
        width: 18,
        height: 18,
        borderRadius: 9,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
    },
    cellIcon: {
        margin: -12,
    },
    dots: {
        flexDirection: "row",
        gap: 2,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
    },
    legend: {
        flexDirection: "row",
        gap: 14,
        marginTop: 10,
        paddingHorizontal: 4,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    legendText: {
        fontSize: 10,
        color: "rgba(255,255,255,0.35)",
        fontWeight: "500",
    },
    detail: {
        marginTop: 30,
    },
    detailDate: {
        fontSize: 12,
        fontWeight: "700",
        color: "rgba(255,255,255,0.45)",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 15,
    },
    detailSection: {},
    expenseRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    expenseDesc: {
        flex: 1,
        fontSize: 13,
        fontWeight: "500",
        color: Colors.text_light,
        textTransform: "capitalize",
    },
    expenseAmount: {
        fontSize: 13,
        fontWeight: "700",
        color: "#F07070",
    },
})
