import { AnimatedNumber } from "@/components"
import ChipButton from "@/components/ui/Button/ChipButton"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import { useRefresh } from "@/utils/context/RefreshContext"
import { gql, useQuery } from "@apollo/client"
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons"
import { MenuView } from "@react-native-menu/menu"
import moment from "moment"
import React, { useMemo, useState } from "react"
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native"
import Ripple from "react-native-material-ripple"
import DateTimePicker from "react-native-modal-datetime-picker"
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated"

interface ZeroExpenseStreak {
    start: string
    end: string
    length: number
}

interface ZeroExpenseDays {
    days: string[]
    avg: number
    streak: ZeroExpenseStreak[]
    saved: number
}

const GET_ZERO_SPENDINGS = gql`
    query GetZeroSpendings($startDate: String!, $endDate: String!) {
        statisticsZeroExpenseDays(startDate: $startDate, endDate: $endDate) {
            days
            avg
            streak {
                start
                end
                length
            }
            saved
        }
    }
`

const getStreakLength = (start: string, end: string): number => {
    return moment(end).diff(moment(start), "days") + 1
}

const AnimatedItem = ({
    label,
    value,
    previousValue,
    icon,
    formatType = "currency",
    width,
    index,
}: {
    label: string
    value: number | string
    previousValue?: number
    icon?: React.ReactNode
    formatType?: "currency" | "percentage" | "number" | "days"
    width?: number
    index: number
}) => {
    const numericValue = typeof value === "string" ? parseFloat(value.replace(/[^0-9.-]/g, "")) || 0 : value

    const getFormatValue = () => {
        switch (formatType) {
            case "currency":
                return (val: number) => `${val.toFixed(2)}zł`
            case "percentage":
                return (val: number) => `${val.toFixed(1)}%`
            case "days":
                return (val: number) => `${Math.round(val)} day${val !== 1 ? "s" : ""}`
            case "number":
            default:
                return (val: number) => Math.round(val).toString()
        }
    }

    const getComparisonText = () => {
        if (previousValue === undefined || previousValue === 0) return null

        const formatValue = getFormatValue()
        const change = ((numericValue - previousValue) / previousValue) * 100
        const isPositive = change > 0
        const isNeutral = Math.abs(change) < 0.1

        if (isNeutral)
            return (
                <Text variant="caption" style={[styles.comparisonText]}>
                    vs {formatValue(previousValue)}
                </Text>
            )

        const arrow = isPositive ? "↗" : "↘"
        const color = isPositive ? "#4CAF50" : "#F44336"

        return (
            <Text variant="caption" style={[styles.comparisonText, { color }]}>
                {arrow} vs {formatValue(previousValue)}
            </Text>
        )
    }

    return (
        <Animated.View entering={FadeInDown.delay(index * 75)}>
            <Ripple style={[styles.item, { width: width || (Layout.screen.width - 30 - 10) / 2, height: 90 }]}>
                <Animated.View entering={FadeIn.delay((index + 1) * 85)}>{icon}</Animated.View>
                <View style={styles.itemContent}>
                    {typeof value === "string" && isNaN(numericValue) ? (
                        <Text variant="heading" style={styles.itemValue}>
                            {value}
                        </Text>
                    ) : (
                        <AnimatedNumber style={styles.itemValue} value={numericValue} formatValue={getFormatValue()} />
                    )}

                    {getComparisonText()}

                    <Text variant="caption" style={styles.itemLabel}>
                        {label}
                    </Text>
                </View>
            </Ripple>
        </Animated.View>
    )
}

const StreakTile = ({
    streak,
    isLongest = false,
    onPress,
    index,
}: {
    streak: ZeroExpenseStreak
    isLongest?: boolean
    onPress?: () => void
    index: number
}) => {
    const colors = [
        { bg: Colors.secondary, accent: Colors.secondary_light_1 },
        { bg: "#FF6B6B", accent: "#FF8E8E" },
        { bg: "#4ECDC4", accent: "#6FDED7" },
        { bg: "#45B7D1", accent: "#68C5D9" },
        { bg: "#96CEB4", accent: "#A8D4C0" },
        { bg: "#FFEAA7", accent: "#FFF0C4" },
        { bg: "#DDA0DD", accent: "#E6B3E6" },
        { bg: "#FFB347", accent: "#FFC56B" },
    ]

    const colorSet = isLongest ? { bg: "#FFD700", accent: "#FFE55C" } : colors[index % colors.length]
    const actualLength = getStreakLength(streak.start, streak.end)

    return (
        <Ripple onPress={onPress} style={[styles.streakTileHorizontal, { backgroundColor: colorSet.bg }]}>
            <View style={styles.streakContentRow}>
                {isLongest && (
                    <View style={styles.crownIcon}>
                        <Text variant="body" style={styles.crownEmoji}>
                            👑
                        </Text>
                    </View>
                )}
                <View style={styles.streakMainContent}>
                    <Text
                        variant="body"
                        style={[
                            styles.streakLengthHorizontal,
                            { color: isLongest ? "#000" : Colors.foreground, fontWeight: "bold" },
                        ]}
                    >
                        {actualLength} days
                    </Text>
                    <Text
                        variant="caption"
                        style={[styles.streakDateHorizontal, { color: isLongest ? "#555" : "rgba(255,255,255,0.9)" }]}
                    >
                        {moment(streak.start).format("MMM D")} - {moment(streak.end).format("MMM D")}
                    </Text>
                </View>
            </View>
        </Ripple>
    )
}

export default function ZeroExpenseStats() {
    const [dateRange, setDateRange] = useState<[string, string]>([
        moment().startOf("month").format("YYYY-MM-DD"),
        moment().format("YYYY-MM-DD"),
    ])
    const [showStartDatePicker, setShowStartDatePicker] = useState(false)
    const [showEndDatePicker, setShowEndDatePicker] = useState(false)

    const lastMonthRange = useMemo<[string, string]>(() => {
        const currentStart = moment(dateRange[0])
        const currentEnd = moment(dateRange[1])
        const daysDiff = currentEnd.diff(currentStart, "days")

        const lastMonthEnd = currentStart.clone().subtract(1, "day")
        const lastMonthStart = lastMonthEnd.clone().subtract(daysDiff, "days")

        return [lastMonthStart.format("YYYY-MM-DD"), lastMonthEnd.format("YYYY-MM-DD")]
    }, [dateRange])

    const {
        data: zeroSpendings,
        loading,
        error,
        refetch,
    } = useQuery(GET_ZERO_SPENDINGS, {
        variables: { startDate: dateRange[0], endDate: dateRange[1] },
    })

    const { data: lastMonthSpendings, refetch: refetchZeroLast } = useQuery(GET_ZERO_SPENDINGS, {
        variables: { startDate: lastMonthRange[0], endDate: lastMonthRange[1] },
    })

    useRefresh([refetch, refetchZeroLast], [dateRange])

    const data: ZeroExpenseDays | null = zeroSpendings?.statisticsZeroExpenseDays
    const lastMonthData: ZeroExpenseDays | null = lastMonthSpendings?.statisticsZeroExpenseDays

    const currentStreak = useMemo(() => {
        if (!data?.streak?.length) return null
        const today = moment().format("YYYY-MM-DD")
        return data.streak.find((s) => moment(s.end).format("YYYY-MM-DD") === today)
    }, [data?.streak])

    const totalDays = moment(dateRange[1]).diff(moment(dateRange[0]), "days") + 1
    const lastMonthTotalDays = moment(lastMonthRange[1]).diff(moment(lastMonthRange[0]), "days") + 1

    const successRate = data ? (data.days.length / totalDays) * 100 : 0
    const lastMonthSuccessRate = lastMonthData ? (lastMonthData.days.length / lastMonthTotalDays) * 100 : 0

    const handleStartDateConfirm = (date: Date) => {
        const formattedDate = moment(date).format("YYYY-MM-DD")
        setDateRange([formattedDate, dateRange[1]])
        setShowStartDatePicker(false)
    }

    const handleEndDateConfirm = (date: Date) => {
        const formattedDate = moment(date).format("YYYY-MM-DD")
        setDateRange([dateRange[0], formattedDate])
        setShowEndDatePicker(false)
    }

    if (loading) {
        return (
            <Animated.View entering={FadeIn} style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.secondary} />
            </Animated.View>
        )
    }

    if (error || !data) {
        return (
            <View style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text variant="subtitle" color={Colors.error}>
                        Unable to load zero expense data
                    </Text>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View style={{ flex: 1 }}>
                        <Text variant="body" style={styles.headerTitle}>
                            Zero Expense Analytics
                        </Text>
                        <Text variant="caption" style={styles.headerSubtitle}>
                            {moment(dateRange[0]).format("MMM D")} - {moment(dateRange[1]).format("MMM D, YYYY")}
                        </Text>
                    </View>
                    <MenuView
                        onPressAction={(ev) => {
                            if (ev.nativeEvent.event === "1") {
                                setShowStartDatePicker(true)
                            } else if (ev.nativeEvent.event === "2") {
                                setShowEndDatePicker(true)
                            }
                        }}
                        title="Select date range"
                        themeVariant="dark"
                        actions={[
                            {
                                id: "1",
                                title: "Date start",
                                state: "off",
                                subtitle: moment(dateRange[0]).format("DD MMMM YYYY"),
                                image: "calendar",
                            },
                            {
                                id: "2",
                                title: "Date end",
                                state: "off",
                                subtitle: moment(dateRange[1]).format("DD MMMM YYYY"),
                                image: "calendar",
                            },
                        ]}
                    >
                        <ChipButton icon="clockcircleo">
                            {`${moment(dateRange[0]).format("DD.MM")} - ${moment(dateRange[1]).format("DD.MM")}`}
                        </ChipButton>
                    </MenuView>
                </View>

                {currentStreak && (
                    <View style={styles.currentStreakAlert}>
                        <Text variant="subtitle" style={styles.currentStreakText}>
                            🔥 Current streak: {getStreakLength(currentStreak.start, currentStreak.end)} days!
                        </Text>
                        <Text variant="caption" style={styles.currentStreakSubtext}>
                            Started {moment(currentStreak.start).format("MMM D, YYYY")}
                        </Text>
                    </View>
                )}

                <View style={styles.statsGrid}>
                    <AnimatedItem
                        label="Saved days"
                        value={data.days.length + "days"}
                        previousValue={lastMonthData?.days.length}
                        icon={<MaterialIcons name="event-available" size={30} color={Colors.secondary} />}
                        formatType="days"
                        index={0}
                    />
                    <AnimatedItem
                        label="Success rate"
                        value={successRate}
                        previousValue={lastMonthSuccessRate}
                        icon={<Ionicons name="trending-up" size={30} color="lightgreen" />}
                        formatType="percentage"
                        index={1}
                    />
                    <AnimatedItem
                        label="Money saved"
                        value={data.saved}
                        previousValue={lastMonthData?.saved}
                        icon={<FontAwesome5 name="piggy-bank" size={30} color="lightgreen" />}
                        formatType="currency"
                        index={2}
                    />
                    <AnimatedItem
                        label="Avg saved/day"
                        value={data.avg}
                        previousValue={lastMonthData?.avg}
                        icon={<MaterialIcons name="attach-money" size={30} color={Colors.warning} />}
                        formatType="currency"
                        index={3}
                    />
                </View>

                {data?.streak?.length > 0 && (
                    <Animated.View entering={FadeInDown.delay(75 * 6 + 50)} style={styles.streaksSection}>
                        <Text variant="body" style={styles.sectionTitle}>
                            Streak History {data?.streak?.length && `(${data.streak.length})`}
                        </Text>
                        {data.streak.length === 0 ? (
                            <View style={styles.noStreaksContainer}>
                                <Text variant="heading" style={styles.noStreaksIcon}>
                                    🎯
                                </Text>
                                <Text variant="subtitle" style={styles.noStreaksText}>
                                    No streaks recorded yet. Start your first streak today!
                                </Text>
                                <Text variant="caption" style={styles.noStreaksSubtext}>
                                    A streak starts when you have consecutive days without expenses
                                </Text>
                            </View>
                        ) : (
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.streaksScrollView}
                                contentContainerStyle={styles.streaksScrollContent}
                            >
                                {[...data.streak]
                                    .sort((a, b) => getStreakLength(b.start, b.end) - getStreakLength(a.start, a.end))
                                    .slice(0, 8)
                                    .map((s, index) => (
                                        <StreakTile
                                            key={`${s.start}-${s.end}`}
                                            streak={s}
                                            isLongest={index === 0}
                                            index={index}
                                            onPress={() => console.log("Streak details:", s)}
                                        />
                                    ))}
                            </ScrollView>
                        )}
                    </Animated.View>
                )}
            </ScrollView>

            <DateTimePicker
                isVisible={showStartDatePicker}
                mode="date"
                onConfirm={handleStartDateConfirm}
                onCancel={() => setShowStartDatePicker(false)}
                date={moment(dateRange[0]).toDate()}
                maximumDate={moment(dateRange[1]).toDate()}
            />

            <DateTimePicker
                isVisible={showEndDatePicker}
                mode="date"
                onConfirm={handleEndDateConfirm}
                onCancel={() => setShowEndDatePicker(false)}
                date={moment(dateRange[1]).toDate()}
                minimumDate={moment(dateRange[0]).toDate()}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.primary,
        width: Layout.screen.width - 30,
        marginTop: 10,
    },
    loadingContainer: {
        backgroundColor: Colors.primary,
        padding: 40,
        borderRadius: 15,
        alignItems: "center",
        height: 587,
    },
    loadingText: {
        color: Colors.text_light,
        fontSize: 16,
    },
    errorContainer: {
        backgroundColor: Colors.primary_light,
        padding: 40,
        borderRadius: 15,
        alignItems: "center",
    },
    errorText: {
        textAlign: "center",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 25,
    },
    headerTitle: {
        color: Colors.foreground,
        fontSize: 18,
        fontWeight: "bold",
    },
    headerSubtitle: {
        color: "gray",
        marginTop: 5,
    },
    dateToggleButton: {
        backgroundColor: Colors.secondary,
        padding: 4,
        paddingHorizontal: 8,
        flexDirection: "row",
        borderRadius: 100,
        alignItems: "center",
        gap: 4,
    },
    dateToggleText: {
        color: Colors.foreground,
        textAlign: "center",
        fontWeight: "600",
        fontSize: 13,
    },
    currentStreakAlert: {
        backgroundColor: Colors.secondary,
        padding: 15,
        borderRadius: 15,
        marginBottom: 20,
        alignItems: "center",
    },
    currentStreakText: {
        color: Colors.foreground,
    },
    currentStreakSubtext: {
        color: Colors.foreground,
        opacity: 0.8,
        marginTop: 4,
    },
    statsGrid: {
        flexDirection: "row",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 10,
        marginBottom: 25,
    },
    item: {
        marginTop: 5,
        flexDirection: "row",
        gap: 15,
        padding: 25,
        backgroundColor: Colors.primary_light,
        borderRadius: 15,
        alignItems: "center",
    },
    itemContent: {
        flex: 1,
    },
    itemValue: {
        color: Colors.foreground,
        fontWeight: "bold",
        fontSize: 17,
    },
    itemLabel: {
        color: "grey",
        marginTop: 2,
        fontSize: 12,
    },
    comparisonText: {
        marginTop: 1,
        fontSize: 12,
    },
    sectionTitle: {
        color: Colors.foreground,
        marginBottom: 15,
        fontWeight: "bold",
    },
    streaksSection: {
        marginBottom: 0,
    },
    streaksScrollView: {
        marginHorizontal: -15,
        paddingHorizontal: 15,
    },
    streaksScrollContent: {
        paddingRight: 15,
    },
    noStreaksContainer: {
        backgroundColor: Colors.primary_light,
        padding: 30,
        borderRadius: 15,
        alignItems: "center",
    },
    noStreaksIcon: {
        marginBottom: 10,
    },
    noStreaksText: {
        color: Colors.text_light,
        textAlign: "center",
        marginBottom: 8,
    },
    noStreaksSubtext: {
        color: Colors.text_dark,
        textAlign: "center",
    },
    streakTileHorizontal: {
        width: 180,
        height: 80,
        padding: 16,
        borderRadius: 15,
        marginRight: 12,
        position: "relative",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    streakContentRow: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    crownIcon: {
        marginRight: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    crownEmoji: {},
    streakMainContent: {
        flex: 1,
        justifyContent: "center",
    },
    streakLengthHorizontal: {
        marginBottom: 2,
    },
    streakDateHorizontal: {},
    streakProgressHorizontal: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 4,
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 18,
    },
})
