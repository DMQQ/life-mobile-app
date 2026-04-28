import DatePicker from "@/components/DatePicker"
import GlassView from "@/components/ui/GlassView"
import IconButton from "@/components/ui/IconButton/IconButton"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import NumberPad from "@/components/ui/NumberPad"
import lowOpacity from "@/utils/functions/lowOpacity"
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons"
import Color from "color"
import dayjs from "dayjs"
import moment from "moment"
import { useCallback, useState } from "react"
import { Pressable, ScrollView, StyleSheet, View } from "react-native"
import { LiquidGlassView } from "@callstack/liquid-glass"
import Animated, {
    cancelAnimation,
    FadeIn,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useGoal } from "../hooks/hooks"

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

export default function AddGoalEntry({ route, navigation }: any) {
    const { id } = route.params
    const { goals, upsertStats } = useGoal()
    const goal = goals.find((g: any) => g.id === id)

    const [amount, setAmount] = useState("0")
    const [dates, setDates] = useState({ start: new Date(), end: new Date() })
    const [selectedQuickValue, setSelectedQuickValue] = useState<number | null>(null)
    const [loading, setLoading] = useState(false)

    const insets = useSafeAreaInsets()
    const transformX = useSharedValue(0)
    const isAnimating = useSharedValue(false)

    const shake = () => {
        if (isAnimating.value) return
        isAnimating.value = true
        cancelAnimation(transformX)
        transformX.value = withSpring(15, { damping: 2, stiffness: 200, mass: 0.5 })
        setTimeout(() => {
            transformX.value = withSpring(-15, { damping: 2, stiffness: 200, mass: 0.5 })
            setTimeout(() => {
                transformX.value = withSpring(0, { damping: 2, stiffness: 200, mass: 0.5 }, (finished) => {
                    if (finished) isAnimating.value = false
                })
            }, 50)
        }, 50)
    }

    const handleAmountChange = useCallback((value: string) => {
        setAmount((prev) => {
            if (value === "C") {
                const val = prev.slice(0, -1)
                return val.length === 0 ? "0" : val
            }
            if (typeof +value === "number" && prev.includes(".") && prev.split(".")[1].length === 2) {
                shake()
                return prev
            }
            if (prev.length === 1 && prev === "0" && value !== ".") return value
            if (prev.includes(".") && value === ".") {
                shake()
                return prev
            }
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

    const animatedAmount = useAnimatedStyle(
        () => ({
            transform: [{ translateX: transformX.value }],
            fontSize: withTiming(interpolate(amount.length, [0, 10, 15], [80, 55, 35], "clamp"), { duration: 100 }),
        }),
        [amount],
    )

    const quickValues = goal?.icon ? (quickActions[goal.icon] ?? []) : []

    const isMultiDay = !dayjs(dates.start).isSame(dayjs(dates.end), "day")
    const numDays = dayjs(dates.end).diff(dayjs(dates.start), "day") + 1

    return (
        <View style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                <View style={{ flex: 1 }}>
                    <View style={styles.container}>
                        <GlassView style={styles.closeButton}>
                            <IconButton
                                onPress={() => navigation.goBack()}
                                icon={<AntDesign name="close" size={20} color="#fff" />}
                            />
                        </GlassView>

                        <View style={styles.amountDisplay}>
                            <Animated.Text style={[styles.amountText, animatedAmount]}>
                                {amount}
                                <Text variant="body" style={{ color: "rgba(255,255,255,0.4)", fontSize: 22 }}>
                                    {" "}
                                    {goal?.unit}
                                </Text>
                            </Animated.Text>

                            <View style={styles.goalLabel}>
                                <MaterialCommunityIcons
                                    name={goal?.icon || "progress-check"}
                                    size={16}
                                    color={Colors.secondary}
                                />
                                <Text variant="body" style={{ color: "rgba(255,255,255,0.55)" }}>
                                    {goal?.name}
                                </Text>
                                {isMultiDay && (
                                    <View style={styles.multiDayBadge}>
                                        <Text style={styles.multiDayText}>
                                            ÷ {numDays} days = {(parseAmount(amount) / numDays).toFixed(2)}
                                            {goal?.unit}/day
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        <View style={styles.contentContainer}>
                            <Animated.View entering={FadeIn} style={styles.chipsRow}>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={{ gap: 10, alignItems: "center" }}
                                    style={{ flex: 1 }}
                                >
                                    <DatePicker
                                        mode="period"
                                        dates={dates}
                                        setDates={setDates}
                                        buttonComponent={({ start, end }) => (
                                            <Pressable
                                                style={({ pressed }) => [styles.chip, pressed && { opacity: 0.7 }]}
                                            >
                                                <AntDesign name="calendar" size={14} color="rgba(255,255,255,0.7)" />
                                                <Text style={styles.chipText}>
                                                    {dayjs(start).isSame(dayjs(end), "day")
                                                        ? moment(start).format("DD.MM.YYYY")
                                                        : `${moment(start).format("DD.MM")} – ${moment(end).format("DD.MM")}`}
                                                </Text>
                                            </Pressable>
                                        )}
                                    />

                                    {quickValues.map((item, index) => {
                                        const active = selectedQuickValue === item.value
                                        return (
                                            <Pressable
                                                key={`${item.label}-${index}`}
                                                style={({ pressed }) => [
                                                    styles.chip,
                                                    active && styles.chipActive,
                                                    pressed && { opacity: 0.7 },
                                                ]}
                                                onPress={() => {
                                                    setAmount(item.value.toString())
                                                    setSelectedQuickValue(item.value)
                                                }}
                                            >
                                                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                                                    {item.label}
                                                </Text>
                                            </Pressable>
                                        )
                                    })}
                                </ScrollView>

                                <LiquidGlassView
                                    interactive
                                    tintColor={amount === "0" ? Colors.primary_light : Colors.secondary}
                                    style={[styles.saveGlass, { opacity: loading ? 0.5 : 1 }]}
                                >
                                    <Pressable
                                        onPress={handleSubmit}
                                        disabled={amount === "0" || loading}
                                        style={({ pressed }) => [styles.saveGlassInner, pressed && { opacity: 0.7 }]}
                                    >
                                        <AntDesign name="check" size={18} color={"#fff"} />
                                    </Pressable>
                                </LiquidGlassView>
                            </Animated.View>

                            <NumberPad onKeyPress={handleAmountChange} onBackPress={amount === "0" ? () => navigation.goBack() : undefined} />
                        </View>
                    </View>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 15,
        justifyContent: "space-between",
    },
    closeButton: {
        position: "absolute",
        top: 15,
        left: 15,
        zIndex: 100,
        padding: 10,
        borderRadius: 100,
    },
    amountDisplay: {
        height: 250,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 45,
    },
    amountText: {
        color: Colors.foreground,
        fontWeight: "bold",
        textAlign: "center",
    },
    goalLabel: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 8,
        flexWrap: "wrap",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    multiDayBadge: {
        backgroundColor: lowOpacity(Colors.secondary, 0.15),
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderWidth: 1,
        borderColor: lowOpacity(Colors.secondary, 0.3),
    },
    multiDayText: {
        color: Colors.secondary,
        fontSize: 12,
        fontWeight: "600",
    },
    contentContainer: {
        paddingTop: 12,
        paddingHorizontal: 12,
        flex: 1,
        gap: 10,
        backgroundColor: Colors.primary_light,
        borderTopRightRadius: 30,
        borderTopLeftRadius: 30,
        maxHeight: Layout.screen.height / 1.8,
    },
    chipsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    chip: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 15,
        backgroundColor: Colors.primary_lighter,
        borderWidth: 2,
        borderColor: Color(Colors.primary_lighter).lighten(0.25).hex(),
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        height: 45,
    },
    chipActive: {
        backgroundColor: lowOpacity(Colors.secondary, 0.2),
        borderColor: Color(Colors.secondary).alpha(0.5).string(),
    },
    chipText: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 13,
        fontWeight: "500",
    },
    chipTextActive: {
        color: Colors.secondary,
        fontWeight: "700",
    },
    saveGlass: {
        borderRadius: 15,
        overflow: "hidden",
        height: 45,
        width: 52,
    },
    saveGlassInner: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
})
