import { FONTS } from "@/constants/Fonts"
import React, { useEffect, useMemo, useRef } from "react"
import { View, ScrollView, StyleSheet } from "react-native"
import Colors, { secondary_candidates } from "@/constants/Colors"
import lowOpacity from "@/utils/functions/lowOpacity"
import dayjs from "dayjs"

interface ContributionData {
    date: string | Date
    count: number
}

interface CellInfo {
    date: dayjs.Dayjs
    count: number
    dateString: string
}

interface DayData {
    date: dayjs.Dayjs
    count: number
    dateStr: string
    isCurrentMonth: boolean
    goalMet: boolean
}

interface GridData {
    weeks: DayData[][]
    months: {
        name: string
        position: number
    }[]
}

interface GitHubActivityGridProps {
    primaryColor?: string
    contributionData?: ContributionData[]
    startDate?: string | Date
    endDate?: string | Date
    onCellPress?: (cellInfo: CellInfo) => void
    showWeekdays?: boolean
    showMonths?: boolean
    goalThreshold?: number
    isLimit?: boolean

    size?: number
}

/**
 * GitHubActivityGrid - A component that mimics GitHub's contribution calendar
 * Shows full color if goal is met, very low opacity if entry exists but goal not met
 */
const GitHubActivityGrid: React.FC<GitHubActivityGridProps> = ({
    primaryColor,
    contributionData = [],
    startDate,
    endDate,
    goalThreshold = 1,
    isLimit = false,
    size = 10,
}) => {
    const activityColor = primaryColor || secondary_candidates[0]

    const dateRange = useMemo(() => ({
        start: startDate ? dayjs(startDate) : dayjs().subtract(52, "weeks").startOf("week"),
        end: endDate ? dayjs(endDate) : dayjs(),
    }), [startDate, endDate])

    const contributionMap = useMemo(() => {
        const map: Record<string, number> = {}
        let maxCount = 1

        contributionData.forEach((item) => {
            const dateStr = dayjs(item.date).format("YYYY-MM-DD")
            map[dateStr] = item.count || 0
            if ((item.count || 0) > maxCount) maxCount = item.count || 0
        })

        return { map, maxCount }
    }, [contributionData])

    const gridData: GridData = useMemo(() => {
        const startWeek = dateRange.start.startOf("week")
        const totalDays = dateRange.end.diff(startWeek, "days") + 1
        const numWeeks = Math.ceil(totalDays / 7)

        const weeks: DayData[][] = []
        const months: { name: string; position: number }[] = []
        let currentDate = startWeek
        let prevMonth: number | null = null
        const today = dayjs()
        const todayMonth = today.month()
        const todayYear = today.year()

        for (let weekIndex = 0; weekIndex < numWeeks; weekIndex++) {
            const week: DayData[] = []

            for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
                const dateStr = currentDate.format("YYYY-MM-DD")
                const count = contributionMap.map[dateStr] || 0
                const currentMonth = currentDate.month()

                if (prevMonth !== currentMonth) {
                    months.push({ name: currentDate.format("MMM"), position: weekIndex })
                    prevMonth = currentMonth
                }

                week.push({
                    date: currentDate,
                    count,
                    dateStr,
                    isCurrentMonth: currentMonth === todayMonth && currentDate.year() === todayYear,
                    goalMet: count >= goalThreshold,
                })

                currentDate = currentDate.add(1, "day")
            }

            weeks.push(week)
        }

        return { weeks, months }
    }, [dateRange, contributionMap, goalThreshold])

    const renderedWeeks = useMemo(() =>
        gridData.weeks.map((week, weekIndex) => (
            <View key={`week-${weekIndex}`} style={styles.week}>
                {week.map((day, dayIndex) => {
                    const cellColor = isLimit
                        ? day.count > goalThreshold
                            ? "#F44336"
                            : day.count > 0
                              ? activityColor
                              : Colors.primary
                        : day.count === 0
                          ? Colors.primary
                          : day.goalMet
                            ? activityColor
                            : lowOpacity(activityColor, 0.1)
                    return (
                        <View
                            key={`${weekIndex}-${dayIndex}`}
                            style={[
                                styles.cell,
                                { width: size, height: size, backgroundColor: cellColor },
                                day.isCurrentMonth && styles.currentMonthCell,
                            ]}
                        />
                    )
                })}
            </View>
        )),
    [gridData.weeks, activityColor, isLimit, goalThreshold, size])

    const scrollViewRef = useRef<ScrollView>(null)

    useEffect(() => {
        const timer = setTimeout(() => {
            if (scrollViewRef.current) {
                scrollViewRef.current.scrollToEnd({ animated: false })
            }
        }, 100)

        return () => clearTimeout(timer)
    }, [gridData.weeks.length])

    return (
        <View style={styles.container}>
            <ScrollView
                keyboardDismissMode={"on-drag"}
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                scrollEnabled
            >
                <View style={styles.calendarContainer}>
                    <View style={styles.gridContainer}>
                        <View style={styles.grid}>
                            {renderedWeeks}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.primary_lighter,
        borderRadius: 6,
        position: "relative",
    },
    calendarContainer: {
        alignSelf: "center",
    },
    gridContainer: {
        flexDirection: "row",
    },
    grid: {
        flexDirection: "row",
        gap: 5,
    },
    week: {
        gap: 3.5,
    },
    cell: {
        borderRadius: 2,
    },
    currentMonthCell: {
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.05)",
    },
    tooltipContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
    },
    tooltipOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "transparent",
    },
    tooltip: {
        position: "absolute",
        backgroundColor: "rgba(0,0,0,0.8)",
        padding: 8,
        borderRadius: 4,
        zIndex: 1001,
        maxWidth: 180,
    },
    tooltipDate: {
        color: "#ffffff",
        fontSize: 12,
        fontFamily: FONTS.bold,
        marginBottom: 2,
    },
    tooltipCount: {
        color: "#ffffff",
        fontSize: 12,
    },
})

export default GitHubActivityGrid
