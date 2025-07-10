import React, { useState, useEffect, useMemo, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import moment from "moment";
import Colors, { secondary_candidates } from "@/constants/Colors";
import lowOpacity from "@/utils/functions/lowOpacity";

// TypeScript interfaces
interface ContributionData {
  date: string | Date;
  count: number;
}

interface ToolTipData {
  date: moment.Moment;
  count: number;
  position: {
    weekIndex: number;
    dayIndex: number;
  };
}

interface CellInfo {
  date: moment.Moment;
  count: number;
  dateString: string;
}

interface DayData {
  date: moment.Moment;
  count: number;
  dateStr: string;
  isCurrentMonth: boolean;
  goalMet: boolean;
}

interface GridData {
  weeks: DayData[][];
  months: {
    name: string;
    position: number;
  }[];
}

interface GitHubActivityGridProps {
  primaryColor?: string;
  contributionData?: ContributionData[];
  startDate?: string | Date;
  endDate?: string | Date;
  onCellPress?: (cellInfo: CellInfo) => void;
  showWeekdays?: boolean;
  showMonths?: boolean;
  goalThreshold?: number;
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
}) => {
  const activityColor = primaryColor || secondary_candidates[0];

  const defaultEndDate = moment();
  const defaultStartDate = moment().subtract(52, "weeks").startOf("week");

  const [dateRange, setDateRange] = useState({
    start: startDate ? moment(startDate) : defaultStartDate,
    end: endDate ? moment(endDate) : defaultEndDate,
  });

  const contributionMap = useMemo(() => {
    const map: Record<string, number> = {};
    let maxCount = 1;

    contributionData.forEach((item) => {
      const dateStr = moment(item.date).format("YYYY-MM-DD");
      map[dateStr] = item.count || 0;
      if ((item.count || 0) > maxCount) maxCount = item.count || 0;
    });

    return { map, maxCount };
  }, [contributionData]);

  const gridData: GridData = useMemo(() => {
    const startWeek = moment(dateRange.start).startOf("week");
    const endDate = moment(dateRange.end);

    const totalDays = endDate.diff(startWeek, "days") + 1;
    const numWeeks = Math.ceil(totalDays / 7);

    const weeks: DayData[][] = [];
    const months: { name: string; position: number }[] = [];
    let currentDate = moment(startWeek);
    let prevMonth: number | null = null;

    for (let weekIndex = 0; weekIndex < numWeeks; weekIndex++) {
      const week: DayData[] = [];

      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const dateStr = currentDate.format("YYYY-MM-DD");
        const count = contributionMap.map[dateStr] || 0;

        const goalMet = count >= goalThreshold;

        week.push({
          date: moment(currentDate),
          count,
          dateStr,
          isCurrentMonth: currentDate.month() === moment().month() && currentDate.year() === moment().year(),
          goalMet,
        });

        const currentMonth = currentDate.month();
        if (prevMonth !== currentMonth) {
          months.push({
            name: currentDate.format("MMM"),
            position: weekIndex,
          });
          prevMonth = currentMonth;
        }

        currentDate.add(1, "day");
      }

      weeks.push(week);
    }

    return { weeks, months };
  }, [dateRange, contributionMap, goalThreshold]);

  const renderCell = (day: DayData, weekIndex: number, dayIndex: number) => {
    const cellColor = day.count === 0 ? Colors.primary : day.goalMet ? activityColor : lowOpacity(activityColor, 0.1);

    return (
      <View
        key={`${weekIndex}-${dayIndex}`}
        style={[styles.cell, { backgroundColor: cellColor }, day.isCurrentMonth && styles.currentMonthCell]}
      />
    );
  };

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: false });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [gridData.weeks.length]);

  return (
    <View style={styles.container}>
      <ScrollView keyboardDismissMode={"on-drag"} ref={scrollViewRef} horizontal showsHorizontalScrollIndicator={false} scrollEnabled>
        <View style={styles.calendarContainer}>
          <View style={styles.gridContainer}>
            <View style={styles.grid}>
              {gridData.weeks.map((week, weekIndex) => (
                <View key={`week-${weekIndex}`} style={styles.week}>
                  {week.map((day, dayIndex) => renderCell(day, weekIndex, dayIndex))}
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

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
    gap: 5,
  },
  cell: {
    width: 15,
    height: 15,
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
    fontWeight: "bold",
    marginBottom: 2,
  },
  tooltipCount: {
    color: "#ffffff",
    fontSize: 12,
  },
});

export default GitHubActivityGrid;
