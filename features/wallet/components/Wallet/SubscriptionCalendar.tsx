import Colors from "@/constants/Colors"
import { CategoryIcon } from "@/features/wallet/components/Expense/ExpenseIcon"
import { AntDesign } from "@expo/vector-icons"
import moment, { Moment } from "moment"
import { useMemo, useState } from "react"
import { Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native"
import Ripple from "react-native-material-ripple"
import Color from "color"
import SubscriptionItem from "../Subscription/SubscriptionItem"
import WalletItem from "./WalletItem"
import { useNavigation } from "@react-navigation/native"

interface Subscription {
    id: string
    amount: number
    nextBillingDate: string
    description: string
    billingCycle: string
    isActive: boolean
    dateStart: string
    dateEnd: string
    expenses: { amount: number; id: string; date: string; description: string; category: string }[]
}

interface Expense {
    id: string
    amount: number
    date: string
    description: string
    category: string
    type: string
}

interface Props {
    subscriptions: Subscription[]
    expenses?: Expense[]

    style?: StyleProp<ViewStyle>
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

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

    const candidate = anchor.clone().year(month.year()).month(month.month())
    if (candidate.isBetween(monthStart, monthEnd, "day", "[]")) {
        return candidate.format("YYYY-MM-DD")
    }
    return null
}

export default function SubscriptionCalendar({ subscriptions, expenses = [], style }: Props) {
    const [currentMonth, setCurrentMonth] = useState(moment().startOf("month"))
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

    const monthSubTotal = useMemo(
        () => subscriptions.reduce((acc, s) => acc + s.amount, 0),
        [subscriptions, currentMonth],
    )

    const today = moment().format("YYYY-MM-DD")
    const selectedSubs = selectedDay ? (billingMap.get(selectedDay) ?? []) : []
    const selectedExpenses = selectedDay ? (expenseMap.get(selectedDay) ?? []) : []

    return (
        <View>
            <View style={[styles.calendarCard, style]}>
                <View style={styles.headerCenter}>
                    <View style={styles.monthNav}>
                        <Ripple
                            onPress={() => setCurrentMonth((m) => m.clone().subtract(1, "month"))}
                            style={styles.navBtn}
                        >
                            <AntDesign name="left" size={13} color="rgba(255,255,255,0.5)" />
                        </Ripple>
                        <Text style={styles.monthTitle}>{currentMonth.format("MMM YYYY")}</Text>
                        <Ripple onPress={() => setCurrentMonth((m) => m.clone().add(1, "month"))} style={styles.navBtn}>
                            <AntDesign name="right" size={13} color="rgba(255,255,255,0.5)" />
                        </Ripple>
                    </View>
                    {monthSubTotal > 0 && <Text style={styles.monthTotal}>-{monthSubTotal.toFixed(2)} zł</Text>}
                </View>

                <View style={styles.weekRow}>
                    {DAYS.map((d) => (
                        <Text key={d} style={styles.weekDayLabel}>
                            {d}
                        </Text>
                    ))}
                </View>

                <View style={styles.grid}>
                    {calendarDays.map((day) => {
                        const key = day.format("YYYY-MM-DD")
                        const isCurrentMonth = day.month() === currentMonth.month()
                        const isToday = key === today
                        const isSelected = key === selectedDay
                        const subs = billingMap.get(key) ?? []
                        const dayExpenses = expenseMap.get(key) ?? []
                        const hasBilling = subs.length > 0
                        const hasExpenses = dayExpenses.length > 0

                        return (
                            <Pressable
                                key={key}
                                style={styles.dayCell}
                                onPress={() => setSelectedDay(isSelected ? null : key)}
                            >
                                <View
                                    style={[
                                        styles.dayInner,
                                        isSelected && styles.daySelected,
                                        isToday && !isSelected && styles.dayToday,
                                    ]}
                                >
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

                                    {(hasBilling || hasExpenses) && (
                                        <View style={styles.dots}>
                                            {hasBilling && (
                                                <View style={[styles.dot, { backgroundColor: Colors.secondary }]} />
                                            )}
                                            {hasExpenses && (
                                                <View style={[styles.dot, { backgroundColor: "#F6B161" }]} />
                                            )}
                                        </View>
                                    )}
                                </View>
                            </Pressable>
                        )
                    })}
                </View>

                <View style={styles.legend}>
                    <View style={styles.legendItem}>
                        <View style={[styles.dot, { backgroundColor: Colors.secondary }]} />
                        <Text style={styles.legendText}>Subscription</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.dot, { backgroundColor: "#F6B161" }]} />
                        <Text style={styles.legendText}>Expense</Text>
                    </View>
                </View>
            </View>

            {selectedDay && (selectedSubs.length > 0 || selectedExpenses.length > 0) && (
                <View style={styles.detail}>
                    <Text style={styles.detailDate}>{moment(selectedDay).format("dddd, MMM D")}</Text>

                    {selectedExpenses.length > 0 && (
                        <View style={styles.detailSection}>
                            {selectedExpenses.map((e) => (
                                <WalletItem
                                    key={e.id}
                                    {...e}
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
                                <SubscriptionItem key={s.id} subscription={s} index={i} onPress={() => {}} />
                            ))}
                        </View>
                    )}
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    calendarCard: {
        borderRadius: 18,
        backgroundColor: Color(Colors.primary_lighter).lighten(0.1).hex(),
        padding: 10,
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
        fontSize: 16,
        fontWeight: "700",
        color: Colors.text_light,
        minWidth: 80,
        textAlign: "center",
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
    },
    dayCell: {
        width: "14.285%",
        aspectRatio: 1,
        padding: 2,
    },
    dayInner: {
        flex: 1,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
    },
    dayToday: {
        backgroundColor: "rgba(255,255,255,0.08)",
    },
    daySelected: {
        backgroundColor: Colors.secondary,
    },
    dayNumber: {
        fontSize: 13,
        fontWeight: "500",
        color: "rgba(255,255,255,0.75)",
    },
    dayFaded: {
        color: "rgba(255,255,255,0.18)",
    },
    dayTodayText: {
        color: Colors.text_light,
        fontWeight: "700",
    },
    daySelectedText: {
        color: Colors.foreground,
        fontWeight: "700",
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
    detailSection: {
        gap: 8,
    },
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
