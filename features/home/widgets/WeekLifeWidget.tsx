import { FONTS } from "@/constants/Fonts"
import Section from "@/components/ui/Section"
import Text from "@/components/ui/Text/Text"
import Colors, { secondary_candidates } from "@/constants/Colors"
import { GET_GOALS } from "@/features/goals/hooks/hooks"
import {
    CalendarOccurrenceItem,
    GET_OCCURRENCES_QUERY,
    OccurrenceItem,
} from "@/features/timeline/hooks/query/useGetOccurrencesQuery"
import TimelineItem from "@/features/timeline/components/TimelineItem"
import { Feather } from "@expo/vector-icons"
import { gql, useQuery } from "@apollo/client"
import { useNavigation } from "@react-navigation/native"
import Color from "color"
import dayjs from "dayjs"
import { memo, useMemo, useState } from "react"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import Feedback from "react-native-haptic-feedback"
import { Card } from "@/components"
import { navigationRef } from "@/navigation/ref"
import WalletItem from "@/features/wallet/components/Wallet/WalletItem"

const WEEK_CALENDAR_QUERY = gql`
    query WeekLifeCalendar($date: String, $endDate: String) {
        occurrences(date: $date, endDate: $endDate) {
            id
            title
            date
            beginTime
            endTime
            isCompleted
            priority
        }
    }
`

const WEEK_EXPENSES_QUERY = gql`
    query WeekLifeExpenses($filters: GetWalletFilters, $take: Int) {
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

const CARD_GAP = 12

function priorityAccent(priority: number | null | undefined): string {
    if (priority != null && priority >= 7) return "#FF5F57"
    if (priority != null && priority >= 4) return "#5B9CF6"
    return Color(Colors.foreground_secondary).alpha(0.5).string()
}

function formatTime(time: string): string {
    return dayjs(`2000-01-01T${time}`).format("HH:mm")
}

type FeedItem =
    | { kind: "event"; data: OccurrenceItem }
    | { kind: "expense"; data: any }
    | { kind: "goal"; data: any; color: string }

function StripRow({
    timeLabel,
    showLine,
    children,
}: {
    timeLabel?: string
    showLine: boolean
    children: React.ReactNode
}) {
    return (
        <View style={s.feedRow}>
            <View style={s.strip}>
                <View style={[s.stripHead, { backgroundColor: Colors.primary_lighter }]}>
                    {timeLabel !== undefined && <Text style={s.stripTime}>{timeLabel ?? ""}</Text>}
                    <View style={s.stripDot} />
                </View>
                <View style={s.stripLineCol}>{showLine && <View style={s.stripLine} />}</View>
            </View>
            <View style={s.cardWrapper}>{children}</View>
        </View>
    )
}

function EventStripRow({ event, showLine }: { event: OccurrenceItem; showLine: boolean }) {
    const accent = priorityAccent(event.priority)
    return (
        <StripRow timeLabel={formatTime(event.beginTime)} showLine={showLine}>
            <TimelineItem {...event} location="timeline" />
        </StripRow>
    )
}

function ExpenseCard({ expense, showLine }: { expense: any; showLine: boolean }) {
    const navigation = useNavigation<any>()
    const isIncome = expense.type === "INCOME" || expense.type === "income"
    const color = isIncome ? Colors.positive : Colors.negative
    const timeLabel = expense.date ? dayjs(expense.date).format("HH:mm") : undefined

    return (
        <StripRow timeLabel={timeLabel} showLine={showLine}>
            <WalletItem
                {...expense}
                handlePress={() =>
                    navigation.navigate("WalletScreens", { screen: "Expense", params: { expenseId: expense.id } })
                }
                containerStyle={s.walletItemOverride}
            />
        </StripRow>
    )
}

function GoalCard({ goal, color, date, showLine }: { goal: any; color: string; date: string; showLine: boolean }) {
    const navigation = useNavigation<any>()
    const entry = goal.entries?.find((e: any) => dayjs(e.date).format("YYYY-MM-DD") === date)
    const value = entry?.value ?? 0
    const progress = goal.target > 0 ? Math.min(value / goal.target, 1) : 0
    const met = value >= goal.target

    return (
        <StripRow showLine={showLine}>
            <Card
                onPress={() => navigation.navigate("GoalsScreens", { screen: "Goal", params: { id: goal.id } })}
                style={s.goalContainer}
            >
                <View style={s.goalInner}>
                    <View style={[s.goalIcon, { backgroundColor: Color(color).alpha(0.12).string() }]}>
                        <Feather name={goal.icon as any} size={18} color={color} />
                    </View>
                    <View style={s.goalDesc}>
                        <Text style={s.goalName} numberOfLines={1}>
                            {goal.name}
                        </Text>
                        <View style={s.goalTrack}>
                            <View
                                style={[
                                    s.goalFill,
                                    {
                                        width: `${progress * 100}%` as any,
                                        backgroundColor: met ? color : Color(color).alpha(0.55).string(),
                                    },
                                ]}
                            />
                        </View>
                    </View>
                    <View style={s.goalRight}>
                        <Text style={[s.goalValue, { color: met ? color : Colors.foreground_secondary }]}>
                            {value}/{goal.target}
                            {goal.unit ? ` ${goal.unit}` : ""}
                        </Text>
                    </View>
                </View>
            </Card>
        </StripRow>
    )
}

interface DayMeta {
    date: string
    eventCount: number
    hasExpense: boolean
    goalMet: boolean
}

function WeekStrip({
    weekDays,
    dayMeta,
    selected,
    onSelect,
}: {
    weekDays: dayjs.Dayjs[]
    dayMeta: Record<string, DayMeta>
    selected: string
    onSelect: (date: string) => void
}) {
    const navigation = useNavigation<any>()
    const today = dayjs().format("YYYY-MM-DD")

    return (
        <View style={s.weekRow}>
            {weekDays.map((day) => {
                const dateStr = day.format("YYYY-MM-DD")
                const isToday = dateStr === today
                const isSelected = dateStr === selected
                const meta = dayMeta[dateStr]
                return (
                    <TouchableOpacity
                        key={dateStr}
                        style={[s.dayTile, isSelected && s.selectedTile]}
                        onPress={() => onSelect(dateStr)}
                        onLongPress={() =>
                            navigation.navigate("TimelineScreens", { screen: "Timeline", params: { date: dateStr } })
                        }
                        activeOpacity={0.65}
                    >
                        <Text style={[s.dayLetter, (isToday || isSelected) && s.accentLabel]}>
                            {day.format("dd")[0]}
                        </Text>
                        <Text style={[s.dayNum, (isToday || isSelected) && s.accentLabel]}>{day.format("D")}</Text>
                        <View style={s.dotRow}>
                            {(meta?.eventCount ?? 0) > 0 && (
                                <View style={[s.dot, { backgroundColor: Colors.secondary }]} />
                            )}
                            {meta?.hasExpense && <View style={[s.dot, { backgroundColor: Colors.negative }]} />}
                            {meta?.goalMet && <View style={[s.dot, { backgroundColor: Colors.positive }]} />}
                            {!meta?.eventCount && !meta?.hasExpense && !meta?.goalMet && (
                                <View style={s.dotPlaceholder} />
                            )}
                        </View>
                    </TouchableOpacity>
                )
            })}
        </View>
    )
}

function WeekLifeWidget() {
    const navigation = useNavigation<any>()
    const today = dayjs().format("YYYY-MM-DD")
    const [selected, setSelected] = useState(today)

    const weekDays = useMemo(() => {
        const start = dayjs().startOf("week")
        return Array.from({ length: 7 }, (_, i) => start.add(i, "day"))
    }, [])

    const weekStart = weekDays[0].format("YYYY-MM-DD")
    const weekEnd = weekDays[6].format("YYYY-MM-DD")
    const weekEndExclusive = weekDays[6].add(1, "day").format("YYYY-MM-DD")

    const { data: calData } = useQuery<{ occurrences: (CalendarOccurrenceItem & { priority: number | null })[] }>(
        WEEK_CALENDAR_QUERY,
        { variables: { date: weekStart, endDate: weekEnd }, fetchPolicy: "cache-and-network" },
    )

    const { data: expData } = useQuery(WEEK_EXPENSES_QUERY, {
        variables: { filters: { date: { from: weekStart, to: weekEndExclusive } }, take: 2 },
        fetchPolicy: "cache-and-network",
    })

    const { data: goalsData } = useQuery(GET_GOALS)

    const { data: dayData } = useQuery<{ occurrences: OccurrenceItem[] }>(GET_OCCURRENCES_QUERY, {
        variables: { date: selected },
        fetchPolicy: "cache-and-network",
    })

    const weekExpenses: any[] = useMemo(
        () => expData?.wallet?.expenses2?.flatMap((m: any) => m.expenses) ?? [],
        [expData],
    )

    const goals: any[] = goalsData?.goals ?? []

    const dayMeta = useMemo(() => {
        const meta: Record<string, DayMeta> = {}
        weekDays.forEach((day) => {
            const dateStr = day.format("YYYY-MM-DD")
            const events = (calData?.occurrences ?? []).filter((e) => e.date === dateStr)
            const hasExpense = weekExpenses.some((e) => dayjs(e.date).format("YYYY-MM-DD") === dateStr)
            const goalMet = goals.some((g: any) => {
                const entry = g.entries?.find((e: any) => dayjs(e.date).format("YYYY-MM-DD") === dateStr)
                return entry && entry.value >= g.target
            })
            meta[dateStr] = { date: dateStr, eventCount: events.length, hasExpense, goalMet }
        })
        return meta
    }, [calData, weekExpenses, goals, weekDays])

    const feedItems: FeedItem[] = useMemo(() => {
        const sortKey = (item: FeedItem): string => {
            if (item.kind === "event") return item.data.beginTime ?? "00:00:00"
            if (item.kind === "expense") return dayjs(item.data.date).format("HH:mm:ss")
            return "00:00:00"
        }

        const events: FeedItem[] = (dayData?.occurrences ?? []).map((e) => ({ kind: "event", data: e }))

        const expenses: FeedItem[] = weekExpenses
            .filter((e) => dayjs(e.date).format("YYYY-MM-DD") === selected)
            .map((e) => ({ kind: "expense", data: e }))

        const goalRows: FeedItem[] = goals.map((g, idx) => ({
            kind: "goal",
            data: g,
            color: secondary_candidates[idx % secondary_candidates.length],
        }))

        return [...goalRows, ...events, ...expenses].sort((a, b) => sortKey(a).localeCompare(sortKey(b)))
    }, [dayData, weekExpenses, goals, selected])

    return (
        <Section
            title="Week"
            headerRight={
                <TouchableOpacity
                    onPress={() =>
                        navigation.navigate("TimelineScreens", { screen: "Timeline", params: { date: selected } })
                    }
                    activeOpacity={0.65}
                >
                    <Feather name="chevron-right" size={14} color={Colors.text_dark} />
                </TouchableOpacity>
            }
        >
            <View style={s.container}>
                <WeekStrip
                    weekDays={weekDays}
                    dayMeta={dayMeta}
                    selected={selected}
                    onSelect={(d) => {
                        Feedback.trigger("impactLight")
                        setSelected(d)
                    }}
                />

                <View style={s.separator} />

                {feedItems.length === 0 ? (
                    <TouchableOpacity
                        style={s.emptyRow}
                        onPress={() =>
                            navigation.navigate("TimelineScreens", { screen: "Timeline", params: { date: selected } })
                        }
                        activeOpacity={0.65}
                    >
                        <Text style={s.emptyText}>Nothing planned</Text>
                        <Feather name="plus" size={13} color={Colors.text_dark} />
                    </TouchableOpacity>
                ) : (
                    <View>
                        {feedItems.map((item, i) => {
                            const isLast = i === feedItems.length - 1
                            if (item.kind === "event") {
                                return <EventStripRow key={item.data.id} event={item.data} showLine={!isLast} />
                            }
                            if (item.kind === "expense") {
                                return <ExpenseCard key={item.data.id} expense={item.data} showLine={!isLast} />
                            }
                            return (
                                <GoalCard
                                    key={item.data.id}
                                    goal={item.data}
                                    color={item.color}
                                    date={selected}
                                    showLine={!isLast}
                                />
                            )
                        })}
                    </View>
                )}
            </View>
        </Section>
    )
}

export default memo(WeekLifeWidget)

const STRIP_W = 42

const s = StyleSheet.create({
    container: {
        padding: 14,
    },
    weekRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingBottom: 12,
    },
    dayTile: {
        flex: 1,
        alignItems: "center",
        gap: 3,
        paddingVertical: 6,
        borderRadius: 10,
    },
    selectedTile: {
        backgroundColor: Color(Colors.secondary).alpha(0.12).string(),
    },
    dayLetter: {
        fontSize: 10,
        fontFamily: FONTS.semibold,
        color: Colors.foreground_secondary,
        textTransform: "uppercase",
    },
    dayNum: {
        fontSize: 14,
        fontFamily: FONTS.bold,
        color: Colors.foreground,
    },
    accentLabel: {
        color: Colors.secondary,
        fontFamily: FONTS.bold,
    },
    dotRow: {
        flexDirection: "row",
        gap: 2,
        height: 5,
        alignItems: "center",
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
    },
    dotPlaceholder: {
        width: 4,
        height: 4,
    },
    separator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: "rgba(255,255,255,0.07)",
        marginBottom: 12,
    },
    dayHeading: {
        fontSize: 15,
        fontFamily: FONTS.bold,
        color: Colors.foreground,
        marginBottom: 10,
    },
    feedRow: {
        flexDirection: "row",
    },
    strip: {
        width: STRIP_W,
        alignItems: "center",
        alignSelf: "stretch",
    },
    stripHead: {
        backgroundColor: Colors.primary_light,
        paddingVertical: 5,
        alignItems: "center",
        gap: 3,
        width: "100%",
    },
    stripTime: {
        fontSize: 9,
        color: Colors.foreground_secondary,
        textAlign: "center",
    },
    stripDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "rgba(255,255,255,0.2)",
    },
    stripLineCol: {
        flex: 1,
        width: 14,
        alignItems: "center",
    },
    stripLine: {
        width: 2,
        flex: 1,
        marginTop: 2,
        marginBottom: -CARD_GAP,
        backgroundColor: "rgba(255,255,255,0.1)",
    },
    cardWrapper: {
        flex: 1,
        marginBottom: CARD_GAP,
    },
    walletItemOverride: {
        marginBottom: 0,
    },
    goalContainer: {
        marginBottom: 0,
    },
    goalInner: {
        flexDirection: "row",
        height: 40,
        alignItems: "center",
    },
    goalIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    goalDesc: {
        flex: 3,
        height: "100%",
        justifyContent: "center",
        paddingLeft: 10,
        gap: 5,
    },
    goalName: {
        color: Colors.foreground,
        fontSize: 14,
        fontFamily: FONTS.bold,
    },
    goalTrack: {
        height: 3,
        borderRadius: 2,
        backgroundColor: "rgba(255,255,255,0.08)",
        overflow: "hidden",
    },
    goalFill: {
        height: 3,
        borderRadius: 2,
    },
    goalRight: {
        flex: 2,
        justifyContent: "center",
        alignItems: "flex-end",
        paddingRight: 10,
    },
    goalValue: {
        fontSize: 15,
        fontFamily: FONTS.semibold,
    },
    emptyRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 12,
    },
    emptyText: {
        fontSize: 13,
        color: Colors.foreground_secondary,
    },
})
