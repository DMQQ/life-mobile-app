import Colors, { secondary_candidates } from "@/constants/Colors"
import Layout from "@/constants/Layout"
import { useMemo, useState } from "react"
import { StyleSheet, View } from "react-native"
import Text from "@/components/ui/Text/Text"
import { CustomDayBarChart, DAY_LABELS, BarItem } from "@/features/wallet/components/WalletChart/SpendingsByDayOfWeek"
import Legend from "@/features/wallet/components/WalletChart/Legend"
import { Item } from "@/features/wallet/components/WalletChart/StatisticsSummary"
import { AnimatedLineChart } from "@/features/home/components/BalancePredictionChart"
import WalletItem from "@/features/wallet/components/Wallet/WalletItem"
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons"

const NOOP = () => {}

export function parseJson(str: string): any {
    if (!str) return null
    if (typeof str === "object") return str
    try {
        const first = JSON.parse(str)
        if (typeof first === "string") return JSON.parse(first)
        return first
    } catch {
        return null
    }
}

function safeMaxValue(bars: BarItem[]): number {
    if (!bars.length) return 100
    const m = Math.max(...bars.map((b) => b.value))
    return m > 0 ? m * 1.1 : 1
}

export function DayOfWeekView({ data }: { data: any[] }) {
    const items = Array.isArray(data) ? data : []
    const bars: BarItem[] = useMemo(
        () =>
            items.map((item, i) => ({
                label: DAY_LABELS[(item.day ?? i + 1) - 1]?.slice(0, 3) ?? String(item.day ?? i),
                value: item.total ?? item.value ?? 0,
                frontColor: secondary_candidates[i % secondary_candidates.length],
                day: item.day ?? i + 1,
            })),
        [items],
    )
    if (!bars.length) return null
    return <CustomDayBarChart data={bars} maxValue={safeMaxValue(bars)} type="total" />
}

export function DailySpendingsView({ data }: { data: any[] }) {
    const items = Array.isArray(data) ? data : []
    const bars: BarItem[] = useMemo(
        () =>
            items
                .filter((item) => (item.total ?? item.amount ?? item.value ?? 0) > 0)
                .map((item, i) => ({
                    label: item.date
                        ? new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        : String(i + 1),
                    value: item.total ?? item.amount ?? item.value ?? 0,
                    frontColor: secondary_candidates[i % secondary_candidates.length],
                    day: i + 1,
                })),
        [items],
    )
    if (!bars.length) return null
    return <CustomDayBarChart data={bars} maxValue={safeMaxValue(bars)} type="total" />
}

export function DailyBreakdownView({ data }: { data: any[] }) {
    const items = Array.isArray(data) ? data : []
    const bars: BarItem[] = useMemo(
        () =>
            items.map((item, i) => ({
                label: item.date
                    ? new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    : String(i + 1),
                value: item.total ?? item.amount ?? item.value ?? 0,
                frontColor: secondary_candidates[i % secondary_candidates.length],
                day: i + 1,
            })),
        [items],
    )
    if (!bars.length) return null
    return <CustomDayBarChart data={bars} maxValue={safeMaxValue(bars)} type="total" />
}

export function LegendView({ data, startDate, endDate }: { data: any[]; startDate: string; endDate: string }) {
    const items = Array.isArray(data) ? data : []
    const total = items.reduce((s, i) => s + (i.total || 0), 0)
    const [detailed, setDetailed] = useState("general")
    return (
        <Legend
            statisticsLegendData={{ statisticsLegend: items }}
            totalSum={total}
            selected=""
            onPress={NOOP}
            onLongPress={NOOP}
            excluded={[]}
            startDate={startDate}
            endDate={endDate}
            detailed={detailed}
            toggleMode={() => setDetailed((p) => (p === "general" ? "detailed" : "general"))}
        />
    )
}

export function ZeroExpenseDaysView({ data }: { data: any }) {
    const days = Array.isArray(data?.days) ? data.days.length : 0
    const saved = data?.saved ?? 0
    const avg = data?.avg ?? 0
    const streaks = Array.isArray(data?.streak) ? data.streak.length : 0

    const width = (Layout.screen.width - 30 - s.grid.gap * 2) / 2
    return (
        <View style={s.grid}>
            <Item
                width={width}
                label="Days saved"
                value={days}
                formatValue={false}
                icon={<MaterialIcons name="event-available" size={24} color={Colors.secondary} />}
            />
            <Item
                width={width}
                label="Money saved"
                value={saved}
                icon={<FontAwesome5 name="piggy-bank" size={24} color="lightgreen" />}
            />
            <Item
                width={width}
                label="Avg/day"
                value={avg}
                icon={<MaterialIcons name="attach-money" size={24} color="orange" />}
            />
            <Item
                width={width}
                label="Streaks"
                value={streaks}
                formatValue={false}
                icon={<Ionicons name="flame" size={24} color="orange" />}
            />
        </View>
    )
}

export function BalancePredictionView({ data }: { data: any }) {
    const projections = Array.isArray(data?.projections) ? data.projections : []
    const currentBalance = data?.currentBalance ?? 0
    if (!projections.length) return null
    return (
        <View style={s.stretch}>
            <AnimatedLineChart data={projections} currentBalance={currentBalance} index={0} onPositionChange={NOOP} />
        </View>
    )
}

export function RecentExpensesView({ data }: { data: any[] }) {
    const items = Array.isArray(data) ? data.slice(0, 8) : []
    return (
        <View style={s.stretch}>
            {items.map((item: any) => (
                <WalletItem key={item.id} {...item} handlePress={NOOP} animatedStyle={{}} />
            ))}
        </View>
    )
}

const s = StyleSheet.create({
    stretch: { alignSelf: "stretch" },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, alignSelf: "stretch", justifyContent: "space-between" },
})
