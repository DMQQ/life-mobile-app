import Colors, { secondary_candidates } from "@/constants/Colors"
import { Item } from "@/features/wallet/components/WalletChart/StatisticsSummary"
import Legend from "@/features/wallet/components/WalletChart/Legend"
import { CustomDayBarChart, DAY_LABELS, BarItem } from "@/features/wallet/components/WalletChart/SpendingsByDayOfWeek"
import { LimitsComparisonComponent } from "@/features/wallet/components/WalletChart/LimitsComparison"
import { AnimatedLineChart } from "@/features/home/components/BalancePredictionChart"
import WalletItem from "@/features/wallet/components/Wallet/WalletItem"
import SubscriptionItem from "@/features/wallet/components/Subscription/SubscriptionItem"
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons"
import { useMemo, useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"
import Layout from "@/constants/Layout"
import Text from "@/components/ui/Text/Text"
import Color from "color"
import TimelineItem from "@/features/timeline/components/TimelineItem"
import { AiChatMessageItem } from "../../pages/AiStatsChat"
import GoalCategory from "@/features/goals/components/GoalCategory"
import FlashCardGroup from "@/features/flashcards/components/FlashCardGroup"

const NOOP = () => {}

interface SkillCardProps {
    skill: AiChatMessageItem
    startDate: string
    endDate: string
}

export default function SkillCard({ skill, startDate, endDate }: SkillCardProps) {
    const data = useMemo(() => {
        return parseJson(skill.data || "")
    }, [skill.data])

    if (skill.type === "expense") {
        return (
            <View style={s.stretch}>
                <WalletItem {...data} handlePress={NOOP} animatedStyle={{}} />
            </View>
        )
    }
    if (skill.type === "subscription") {
        return (
            <View style={[]}>
                <SubscriptionItem index={0} onPress={NOOP} subscription={data} />
            </View>
        )
    }

    if (skill.type === "event") {
        console.log("Rendering event skill with data:", data)
        return (
            <View style={{ height: 120, overflow: "hidden", width: "100%" }}>
                <TimelineItem styles={{ height: 120 }} {...data} />
            </View>
        )
    }
    if (skill.type === "goals") return <GoalCategory {...data} />
    if (skill.type === "flashcards") return <FlashCardGroup {...data} />

    if (skill.type === "chart" && skill.data) {
        return (
            <View style={{ marginBottom: 15, maxHeight: 400, overflow: "hidden", alignSelf: "stretch" }}>
                <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>{skill.subtype}</Text>
                <SkillWidget skill={skill} startDate={startDate} endDate={endDate} />
            </View>
        )
    }

    return null
}

const SkillWidget = ({ skill, startDate, endDate }: SkillCardProps) => {
    const data = useMemo(() => parseJson(skill?.data || ""), [skill?.data])

    if (!data) return null

    switch (skill.subtype) {
        case "legend":
            return <LegendView data={data} startDate={startDate} endDate={endDate} />
        case "dayOfWeek":
            return <DayOfWeekView data={data} />
        case "dailySpendings":
            return <DailySpendingsView data={data} />
        case "dailyBreakdown":
            return <DailyBreakdownView data={data} />
        case "zeroExpenseDays":
            return <ZeroExpenseDaysView data={data} />
        case "spendingsLimits":
            return (
                <View style={s.stretch}>
                    <LimitsComparisonComponent dateRange={[startDate, endDate]} />
                </View>
            )
        case "balancePrediction":
            return <BalancePredictionView data={data} />
        case "recentExpenses":
            return <RecentExpensesView data={data} />
        default:
            return null
    }
}

function parseJson(str: string): any {
    if (!str) return null
    if (typeof str === "object") return str
    try {
        return JSON.parse(str)
    } catch {
        return null
    }
}

function DayOfWeekView({ data }: { data: any[] }) {
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
    const maxValue = bars.length ? Math.max(...bars.map((b) => b.value)) * 1.1 : 100
    return <CustomDayBarChart data={bars} maxValue={maxValue} type="total" />
}

function DailySpendingsView({ data }: { data: any[] }) {
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
    const maxValue = bars.length ? Math.max(...bars.map((b) => b.value)) * 1.1 : 100
    return <CustomDayBarChart data={bars} maxValue={maxValue} type="total" />
}

function DailyBreakdownView({ data }: { data: any[] }) {
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
    const maxValue = bars.length ? Math.max(...bars.map((b) => b.value)) * 1.1 : 100
    return <CustomDayBarChart data={bars} maxValue={maxValue} type="total" />
}

function LegendView({ data, startDate, endDate }: { data: any[]; startDate: string; endDate: string }) {
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

function ZeroExpenseDaysView({ data }: { data: any }) {
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

function BalancePredictionView({ data }: { data: any }) {
    const projections = Array.isArray(data?.projections) ? data.projections : []
    const currentBalance = data?.currentBalance ?? 0
    if (!projections.length) return null
    return (
        <View style={s.stretch}>
            <AnimatedLineChart data={projections} currentBalance={currentBalance} index={0} onPositionChange={NOOP} />
        </View>
    )
}

function RecentExpensesView({ data }: { data: any[] }) {
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
    card: {
        backgroundColor: Colors.primary_light,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: Colors.primary_lighter,
        padding: 12,
        gap: 8,
    },
    cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
    cardTitle: { fontSize: 15, fontWeight: "600", color: Colors.foreground, flex: 1 },
    cardSub: { fontSize: 13, color: Colors.foreground_secondary, lineHeight: 18 },
    cardMeta: { fontSize: 12, color: Colors.foreground_secondary },
    badgeRow: { flexDirection: "row", gap: 5 },
    badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100, backgroundColor: Colors.primary_lighter },
    badgeText: { fontSize: 11, color: "#fff", fontWeight: "600" },
    badgeDone: { backgroundColor: Color("#34C759").alpha(0.25).string() },
    badgeTodo: { backgroundColor: Colors.primary_lighter },
    tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
    tag: {
        backgroundColor: Color(Colors.secondary).alpha(0.15).string(),
        borderRadius: 100,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    tagText: { fontSize: 11, color: Colors.secondary },
    goalValueRow: { flexDirection: "row", alignItems: "baseline" },
    goalValue: { fontSize: 22, fontWeight: "700", color: Colors.foreground },
    progressTrack: { height: 5, borderRadius: 100, backgroundColor: Colors.primary_lighter, overflow: "hidden" },
    progressFill: { height: 5, borderRadius: 100 },
    flashcard: { gap: 10 },
    flashcardLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: Colors.secondary,
        textTransform: "uppercase",
        letterSpacing: 0.8,
    },
    flashcardContent: { fontSize: 15, color: Colors.foreground, lineHeight: 22 },
    tapHint: { fontSize: 11, color: Colors.foreground_disabled, fontStyle: "italic" },
})
