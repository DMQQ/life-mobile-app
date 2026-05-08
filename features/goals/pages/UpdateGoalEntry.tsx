import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import NumberPad from "@/components/ui/NumberPad"
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons"
import dayjs from "dayjs"
import moment from "moment"
import { useCallback, useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"
import { useGoal } from "../hooks/hooks"
import IconBackButton from "@/components/ui/Button/IconBackButton"
import IconSaveButton from "@/components/ui/Button/IconSaveButton"
import DatePicker from "@/components/DatePicker"
import GroupSelector from "@/components/ui/GroupSelector"

const quickActions: Record<string, { label: string; value: number }[]> = {
    target: [{ label: "1 goal", value: 1 }],
    dumbbell: [
        { label: "30 min", value: 30 },
        { label: "1h", value: 60 },
        { label: "100 reps", value: 100 },
    ],
    run: [
        { label: "2km", value: 2 },
        { label: "5km", value: 5 },
        { label: "10km", value: 10 },
    ],
    bike: [
        { label: "5km", value: 5 },
        { label: "10km", value: 10 },
        { label: "20km", value: 20 },
    ],
    meditation: [
        { label: "10 min", value: 10 },
        { label: "20 min", value: 20 },
        { label: "30 min", value: 30 },
    ],
    "food-apple": [
        { label: "Snack", value: 200 },
        { label: "Meal", value: 600 },
        { label: "Day", value: 2000 },
    ],
    water: [
        { label: "Cup", value: 250 },
        { label: "500ml", value: 500 },
        { label: "1L", value: 1000 },
    ],
    "book-open-page-variant": [
        { label: "10 pages", value: 10 },
        { label: "Chapter", value: 25 },
        { label: "1h", value: 60 },
    ],
    brain: [
        { label: "15 min", value: 15 },
        { label: "30 min", value: 30 },
        { label: "1h", value: 60 },
    ],
    cash: [
        { label: "$10", value: 10 },
        { label: "$50", value: 50 },
        { label: "$100", value: 100 },
    ],
    "heart-pulse": [
        { label: "15 min", value: 15 },
        { label: "30 min", value: 30 },
        { label: "60 min", value: 60 },
    ],
    "bed-clock": [
        { label: "7h", value: 7 },
        { label: "8h", value: 8 },
        { label: "9h", value: 9 },
    ],
    "language-javascript": [
        { label: "30 min", value: 30 },
        { label: "1h", value: 60 },
        { label: "Problem", value: 1 },
    ],
    "code-tags": [
        { label: "Bug fix", value: 1 },
        { label: "Feature", value: 1 },
        { label: "1h", value: 60 },
    ],
    music: [
        { label: "15 min", value: 15 },
        { label: "30 min", value: 30 },
        { label: "Song", value: 1 },
    ],
    coffee: [
        { label: "Cup", value: 1 },
        { label: "200ml", value: 200 },
    ],
    "smoking-off": [
        { label: "Day", value: 1 },
        { label: "Week", value: 7 },
    ],
    weight: [
        { label: "-0.5kg", value: -0.5 },
        { label: "-1kg", value: -1 },
    ],
    yoga: [
        { label: "15 min", value: 15 },
        { label: "30 min", value: 30 },
        { label: "1h", value: 60 },
    ],
    pill: [
        { label: "Dose", value: 1 },
        { label: "Day", value: 1 },
    ],
    emoticon: [
        { label: "😢 1", value: 1 },
        { label: "😐 3", value: 3 },
        { label: "😊 5", value: 5 },
    ],
    "emoticon-happy": [
        { label: "😔 2", value: 2 },
        { label: "😊 4", value: 4 },
        { label: "😁 5", value: 5 },
    ],
    "emoticon-sad": [
        { label: "😭 1", value: 1 },
        { label: "😢 2", value: 2 },
        { label: "😔 3", value: 3 },
    ],
    "weather-sunny": [
        { label: "🌧️ 1", value: 1 },
        { label: "⛅ 3", value: 3 },
        { label: "☀️ 5", value: 5 },
    ],
    "stress-level": [
        { label: "😌 Low", value: 1 },
        { label: "😐 Med", value: 3 },
        { label: "😫 High", value: 5 },
    ],
    "energy-level": [
        { label: "😴 Low", value: 1 },
        { label: "😐 Med", value: 3 },
        { label: "⚡ High", value: 5 },
    ],
    "check-circle": [
        { label: "Task", value: 1 },
        { label: "3 tasks", value: 3 },
        { label: "Project", value: 1 },
    ],
    timer: [
        { label: "Pomodoro", value: 1 },
        { label: "1h", value: 60 },
    ],
    "hammer-wrench": [
        { label: "Task", value: 1 },
        { label: "1h", value: 60 },
    ],
    "food-fork-drink": [
        { label: "Meal", value: 1 },
        { label: "500 cal", value: 500 },
        { label: "Snack", value: 1 },
    ],
    beer: [
        { label: "Drink", value: 1 },
        { label: "Day", value: 1 },
        { label: "Week", value: 7 },
    ],
    steps: [
        { label: "1k", value: 1000 },
        { label: "5k", value: 5000 },
        { label: "10k", value: 10000 },
    ],
    bank: [
        { label: "$10", value: 10 },
        { label: "$100", value: 100 },
        { label: "$1k", value: 1000 },
    ],
    "currency-usd": [
        { label: "Expense", value: -1 },
        { label: "Income", value: 1 },
    ],
    calendar: [
        { label: "Day", value: 1 },
        { label: "Week", value: 7 },
        { label: "Month", value: 30 },
    ],
    "calendar-check": [
        { label: "Streak", value: 1 },
        { label: "Week", value: 7 },
    ],
    school: [
        { label: "Lesson", value: 1 },
        { label: "1h", value: 60 },
    ],
    video: [
        { label: "Video", value: 1 },
        { label: "1h", value: 60 },
    ],
    pencil: [
        { label: "Page", value: 1 },
        { label: "Chapter", value: 1 },
    ],
    flask: [
        { label: "Experiment", value: 1 },
        { label: "1h", value: 60 },
    ],
    gamepad: [
        { label: "1h", value: 1 },
        { label: "Game", value: 1 },
    ],
    phone: [
        { label: "Call", value: 1 },
        { label: "15 min", value: 15 },
        { label: "1h", value: 60 },
    ],
    account: [
        { label: "Meeting", value: 1 },
        { label: "1h", value: 60 },
    ],
    home: [
        { label: "Chore", value: 1 },
        { label: "1h", value: 60 },
    ],
    car: [
        { label: "Trip", value: 1 },
        { label: "10km", value: 10 },
    ],
}

function parseAmount(v: string): number {
    if (v.endsWith(".")) return +v.slice(0, -1)
    if (v.includes(".")) {
        const [int, dec] = v.split(".")
        if (dec.length > 2) return +int + +`0.${dec.slice(0, 2)}`
    }
    return +v
}

export default function UpdateGoalEntry({ route, navigation }: any) {
    const { id } = route.params
    const { goals, upsertStats } = useGoal()
    const goal = goals.find((g: any) => g.id === id)

    const [amount, setAmount] = useState("0")
    const [dates, setDates] = useState({ start: new Date(), end: new Date() })
    const [loading, setLoading] = useState(false)

    const handleAmountChange = useCallback((value: string) => {
        setAmount((prev) => {
            if (value === "C") {
                const val = prev.slice(0, -1)
                return val.length === 0 ? "0" : val
            }
            if (typeof +value === "number" && prev.includes(".") && prev.split(".")[1].length === 2) return prev
            if (prev.length === 1 && prev === "0" && value !== ".") return value
            if (prev.includes(".") && value === ".") return prev
            if (prev.length === 0 && value === ".") return "0."
            return prev + value
        })
    }, [])

    const handleSubmit = async () => {
        if (!goal || amount === "0" || loading) return
        setLoading(true)

        const total = parseAmount(amount)
        const start = dayjs(dates.start)
        const end = dayjs(dates.end)
        const numDays = end.diff(start, "day") + 1
        const valuePerDay = Math.round(total / numDays)

        const dayList = Array.from({ length: numDays }, (_, i) => start.add(i, "day").format("YYYY-MM-DD"))

        try {
            await Promise.all(
                dayList.map((date) =>
                    upsertStats({
                        variables: { input: { goalsId: goal.id, value: valuePerDay, date } },
                        refetchQueries: ["GetGoal"],
                    }),
                ),
            )
            navigation.goBack()
        } catch (e) {
            console.error(JSON.stringify(e, null, 2))
        } finally {
            setLoading(false)
        }
    }

    const quickValues = goal?.icon ? (quickActions[goal.icon] ?? []) : []
    const isMultiDay = !dayjs(dates.start).isSame(dayjs(dates.end), "day")
    const numDays = dayjs(dates.end).diff(dayjs(dates.start), "day") + 1

    return (
        <View style={styles.root}>
            <IconBackButton style={styles.closeBtn} onPress={() => navigation.goBack()} />

            <IconSaveButton disabled={amount === "0" || loading} loading={loading} onPress={handleSubmit} />

            <View style={styles.amountDisplay}>
                <Text variant="title" style={styles.amountText}>
                    {amount}
                    <Text variant="body" style={styles.amountUnit}>
                        {" "}
                        {goal?.unit}
                    </Text>
                </Text>
                <View style={styles.goalLabel}>
                    <MaterialCommunityIcons name={goal?.icon || "progress-check"} size={16} color={Colors.secondary} />
                    <Text variant="body" style={styles.goalLabelText}>
                        {goal?.name}
                    </Text>
                    {isMultiDay && (
                        <View style={styles.multiDayBadge}>
                            <Text style={styles.multiDayText}>
                                / {numDays} days = {(parseAmount(amount) / numDays).toFixed(2)} {goal?.unit}/day
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            <View style={styles.card}>
                <View style={styles.optionsContainer}>
                    <DatePicker dates={dates} setDates={setDates} mode="period" />

                    <View style={{ flex: 1 }}>
                        <GroupSelector
                            options={quickValues.map((map) => ({ label: map.label, value: map.value })) as any}
                            value={quickValues.find((v) => v.value === parseAmount(amount))?.value}
                            onChange={(v) => setAmount(v?.toString() || amount)}
                        />
                    </View>
                </View>

                <NumberPad onKeyPress={handleAmountChange} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    closeBtn: {
        position: "absolute",
        top: 15,
        left: 15,
        zIndex: 100,
    },
    amountDisplay: {
        paddingTop: 120,
        alignItems: "center",
        paddingHorizontal: 30,
    },
    amountText: {
        color: Colors.foreground,
        fontWeight: "bold",
        fontSize: 90,
    },
    amountUnit: {
        color: "rgba(255,255,255,0.4)",
        fontSize: 20,
    },
    goalLabel: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 8,
        flexWrap: "wrap",
        justifyContent: "center",
    },
    goalLabelText: {
        color: "rgba(255,255,255,0.55)",
    },
    multiDayBadge: {
        backgroundColor: "rgba(255,255,255,0.08)",
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    multiDayText: {
        color: Colors.secondary,
        fontSize: 12,
        fontWeight: "600",
    },
    card: {
        padding: 15,
        gap: 8,
        backgroundColor: Colors.primary_light,
        borderTopRightRadius: 30,
        borderTopLeftRadius: 30,
        paddingBottom: 30,
        height: "60%",
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
    },
    optionsContainer: {
        borderRadius: 18,
        overflow: "hidden",
        flexDirection: "row",
        gap: 15,
        alignItems: "center",
    },
    optionRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 18,
        gap: 12,
    },
    optionRowBorder: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "rgba(255,255,255,0.07)",
    },
    optionLabel: {
        flex: 1,
        color: "rgba(255,255,255,0.75)",
        fontWeight: "500",
    },
    optionValue: {
        color: "rgba(255,255,255,0.45)",
        maxWidth: 160,
        textAlign: "right",
    },
    quickRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: "rgba(255,255,255,0.07)",
    },
    quickChip: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 10,
        backgroundColor: Colors.primary,
    },
    quickChipActive: {
        backgroundColor: Colors.secondary,
    },
    quickChipText: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 13,
        fontWeight: "500",
    },
    quickChipTextActive: {
        color: Colors.foreground,
        fontWeight: "700",
    },
})
