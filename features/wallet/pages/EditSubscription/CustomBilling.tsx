import { ModalHeader } from "@/components"
import Text from "@/components/ui/Text/Text"
import { calendarTheme } from "@/constants/Colors"
import Colors from "@/constants/Colors"
import { Feather } from "@expo/vector-icons"
import Color from "color"
import { useCallback, useMemo, useState } from "react"
import { ScrollView, StyleSheet, View } from "react-native"
import { Calendar } from "react-native-calendars"
import type { DateData, MarkedDates } from "react-native-calendars/src/types"
import Feedback from "react-native-haptic-feedback"
import Ripple from "react-native-material-ripple"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { EditSubscriptionStackParams } from "./Main"

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

type Props = NativeStackScreenProps<EditSubscriptionStackParams, "CustomBilling">

export default function CustomBilling({ route, navigation }: Props) {
    const { billingDay: initialDay, customBillingMonths: initialMonths } = route.params

    const [billingDay, setBillingDay] = useState(initialDay)
    const [months, setMonths] = useState(initialMonths)

    const handleDone = useCallback(() => {
        navigation.navigate("Form", {
            customBilling: { billingDay, customBillingMonths: months },
        })
    }, [billingDay, months, navigation])

    const markedDates = useMemo<MarkedDates>(() => {
        const day = Math.max(1, Math.min(31, parseInt(billingDay) || 1))
        const marks: MarkedDates = {}
        const year = new Date().getFullYear()
        for (let m = 1; m <= 12; m++) {
            const daysInMonth = new Date(year, m, 0).getDate()
            if (day > daysInMonth) continue
            const key = `${year}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`
            marks[key] = { selected: true, selectedColor: Colors.secondary }
        }
        return marks
    }, [billingDay])

    const handleDayPress = (day: DateData) => {
        Feedback.trigger("impactLight")
        setBillingDay(String(day.day))
    }

    const toggleMonth = (m: number) => {
        Feedback.trigger("impactLight")
        setMonths((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m].sort((a, b) => a - b)))
    }

    return (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <ModalHeader
                onClose={() => navigation.goBack()}
                title="Custom billing"
                saveIcon="checkmark"
                onSave={handleDone}
            />
            <View style={styles.summaryRow}>
                <Text style={styles.hint}>Tap a day to set billing day of month</Text>
                <View style={styles.daySummary}>
                    <Text style={styles.daySummaryText}>Day {billingDay}</Text>
                </View>
            </View>

            <Calendar
                onDayPress={handleDayPress}
                markedDates={markedDates}
                enableSwipeMonths
                theme={calendarTheme as any}
                style={styles.calendar}
            />

            <Text style={styles.sectionLabel}>Active months</Text>
            {MONTH_NAMES.map((name, i) => {
                const m = i + 1
                const active = months.includes(m)
                return (
                    <Ripple key={m} onPress={() => toggleMonth(m)} style={styles.monthRow}>
                        <Text style={[styles.monthLabel, active && { color: Colors.foreground }]}>{name}</Text>
                        <View style={[styles.toggle, active && styles.toggleActive]}>
                            {active && <Feather name="check" size={13} color={Colors.secondary} />}
                        </View>
                    </Ripple>
                )
            })}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    content: {
        padding: 20,
        paddingBottom: 60,
        paddingTop: 60,
    },
    summaryRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14,
    },
    hint: {
        color: Colors.foreground_disabled,
        fontSize: 13,
        flex: 1,
        marginRight: 12,
    },
    daySummary: {
        backgroundColor: Color(Colors.secondary).alpha(0.18).string(),
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderWidth: 1.5,
        borderColor: Color(Colors.secondary).alpha(0.4).string(),
    },
    daySummaryText: {
        color: Colors.secondary,
        fontWeight: "700",
        fontSize: 16,
    },
    calendar: {
        borderRadius: 14,
        marginBottom: 24,
    },
    sectionLabel: {
        color: Colors.foreground_disabled,
        fontSize: 12,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 10,
    },
    monthRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 13,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "rgba(255,255,255,0.06)",
    },
    monthLabel: {
        color: Colors.foreground_disabled,
        fontSize: 16,
        fontWeight: "500",
    },
    toggle: {
        width: 26,
        height: 26,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: "rgba(255,255,255,0.12)",
        alignItems: "center",
        justifyContent: "center",
    },
    toggleActive: {
        borderColor: Color(Colors.secondary).alpha(0.5).string(),
        backgroundColor: Color(Colors.secondary).alpha(0.15).string(),
    },
})
