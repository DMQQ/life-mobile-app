import { FONTS } from "@/constants/Fonts"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import NumberPad from "@/components/ui/NumberPad"
import { Feather } from "@expo/vector-icons"
import dayjs from "dayjs"
import { useCallback, useState } from "react"
import { StyleSheet, View } from "react-native"
import { useGoal, useEditGoalEntry } from "../hooks/hooks"
import IconBackButton from "@/components/ui/Button/IconBackButton"
import IconSaveButton from "@/components/ui/Button/IconSaveButton"
import DatePicker from "@/components/DatePicker"
import GroupSelector from "@/components/ui/GroupSelector"

function getQuickActions(unit?: string): { label: string; value: number }[] {
    const u = (unit || "").toLowerCase()
    if (u === "min" || u === "minutes" || u === "hours") {
        return [
            { label: "15 min", value: 15 },
            { label: "30 min", value: 30 },
            { label: "1h", value: 60 },
        ]
    }
    if (u === "km" || u === "miles") {
        return [
            { label: "2", value: 2 },
            { label: "5", value: 5 },
            { label: "10", value: 10 },
        ]
    }
    if (u === "steps") {
        return [
            { label: "1k", value: 1000 },
            { label: "5k", value: 5000 },
            { label: "10k", value: 10000 },
        ]
    }
    if (u === "pages" || u === "chapters") {
        return [
            { label: "10", value: 10 },
            { label: "25", value: 25 },
            { label: "50", value: 50 },
        ]
    }
    if (u === "reps" || u === "sets") {
        return [
            { label: "5", value: 5 },
            { label: "10", value: 10 },
            { label: "20", value: 20 },
        ]
    }
    if (u === "cups" || u === "glasses") {
        return [
            { label: "1", value: 1 },
            { label: "3", value: 3 },
            { label: "6", value: 6 },
        ]
    }
    if (u === "liters" || u === "l") {
        return [
            { label: "0.5L", value: 0.5 },
            { label: "1L", value: 1 },
            { label: "2L", value: 2 },
        ]
    }
    if (u === "ml") {
        return [
            { label: "250ml", value: 250 },
            { label: "500ml", value: 500 },
            { label: "1000ml", value: 1000 },
        ]
    }
    if (u === "kg" || u === "lbs") {
        return [
            { label: "1", value: 1 },
            { label: "5", value: 5 },
            { label: "10", value: 10 },
        ]
    }
    return [
        { label: "1", value: 1 },
        { label: "5", value: 5 },
        { label: "10", value: 10 },
    ]
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
    const { id, entryId, entryValue, entryDate } = route.params
    const isEditing = !!entryId
    const { goals, upsertStats } = useGoal()
    const editGoalEntry = useEditGoalEntry()
    const goal = goals.find((g: any) => g.id === id)

    const [amount, setAmount] = useState(entryValue?.toString() || "0")
    const [dates, setDates] = useState({
        start: entryDate ? dayjs(entryDate).toDate() : new Date(),
        end: entryDate ? dayjs(entryDate).toDate() : new Date(),
    })
    const [loading, setLoading] = useState(false)

    const handleAmountChange = useCallback((value: string) => {
        setAmount((prev: string) => {
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

        try {
            if (isEditing) {
                console.log("Editing entry with id:", entryId, "new value:", total)
                await editGoalEntry({
                    variables: { id: entryId, value: total },
                    refetchQueries: ["GetGoal"],
                })
            } else {
                const start = dayjs(dates.start)
                const end = dayjs(dates.end)
                const numDays = end.diff(start, "day") + 1
                const valuePerDay = Math.round(total / numDays)
                const dayList = Array.from({ length: numDays }, (_, i) => start.add(i, "day").format("YYYY-MM-DD"))

                await Promise.all(
                    dayList.map((date) =>
                        upsertStats({
                            variables: { input: { goalsId: goal.id, value: valuePerDay, date } },
                            refetchQueries: ["GetGoal"],
                        }),
                    ),
                )
            }
            navigation.goBack()
        } catch (e) {
            console.error(JSON.stringify(e, null, 2))
        } finally {
            setLoading(false)
        }
    }

    const quickValues = getQuickActions(goal?.unit)
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
                    <Feather name={goal?.icon || "target"} size={16} color={Colors.secondary} />
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
        fontFamily: FONTS.bold,
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
        fontFamily: FONTS.semibold,
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
        fontFamily: FONTS.medium,
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
        fontFamily: FONTS.medium,
    },
    quickChipTextActive: {
        color: Colors.foreground,
        fontFamily: FONTS.bold,
    },
})
