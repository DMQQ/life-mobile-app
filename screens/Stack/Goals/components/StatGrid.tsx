import React, { useState, useEffect, useMemo, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import moment from "moment";
import Colors, { secondary_candidates } from "@/constants/Colors";

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
  intensity: number;
  dateStr: string;
  isCurrentMonth: boolean;
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
}

/**
 * GitHubActivityGrid - A component that mimics GitHub's contribution calendar
 */
const GitHubActivityGrid: React.FC<GitHubActivityGridProps> = ({ primaryColor, contributionData = [], startDate, endDate }) => {
  // Use single color from props with a default
  const activityColor = primaryColor || secondary_candidates[0];

  // Default view is 1 year
  const defaultEndDate = moment();
  const defaultStartDate = moment().subtract(52, "weeks").startOf("week");

  // Date range state
  const [dateRange, setDateRange] = useState({
    start: startDate ? moment(startDate) : defaultStartDate,
    end: endDate ? moment(endDate) : defaultEndDate,
  });

  // Convert contribution data to a map for quick lookup
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

  // Calculate grid data (weeks and days)
  const gridData: GridData = useMemo(() => {
    // Start from the first day of the week containing our start date
    const startWeek = moment(dateRange.start).startOf("week");
    const endDate = moment(dateRange.end);

    // Calculate the total number of weeks to display
    const totalDays = endDate.diff(startWeek, "days") + 1;
    const numWeeks = Math.ceil(totalDays / 7);

    // Generate weeks data
    const weeks: DayData[][] = [];
    const months: { name: string; position: number }[] = [];
    let currentDate = moment(startWeek);
    let prevMonth: number | null = null;

    for (let weekIndex = 0; weekIndex < numWeeks; weekIndex++) {
      const week: DayData[] = [];

      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const dateStr = currentDate.format("YYYY-MM-DD");
        const count = contributionMap.map[dateStr] || 0;
        const intensity = contributionMap.maxCount > 0 ? count / contributionMap.maxCount : 0;

        week.push({
          date: moment(currentDate),
          count,
          intensity,
          dateStr,
          isCurrentMonth: currentDate.month() === moment().month() && currentDate.year() === moment().year(),
        });

        // Check if we've moved to a new month for the month labels
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
  }, [dateRange, contributionMap]);

  // Get color based on intensity
  const getColorForIntensity = (intensity: number): string => {
    if (intensity === 0) return Colors.primary; // No contribution cell color

    // Calculate shade based on intensity
    // We'll create 4 intensity levels
    const intensityLevels = [
      { threshold: 0.25, factor: 0.75 }, // Very light shade
      { threshold: 0.5, factor: 0.5 }, // Light shade
      { threshold: 0.75, factor: 0.25 }, // Medium shade
      { threshold: 1, factor: 0 }, // Full color
    ];

    // Find appropriate level based on intensity
    for (const level of intensityLevels) {
      if (intensity <= level.threshold) {
        return lightenColor(activityColor, level.factor);
      }
    }

    return activityColor;
  };

  // Function to lighten a hex color
  const lightenColor = (color: string, factor: number): string => {
    // Convert hex to RGB
    let r = parseInt(color.slice(1, 3), 16);
    let g = parseInt(color.slice(3, 5), 16);
    let b = parseInt(color.slice(5, 7), 16);

    // Lighten
    r = Math.round(r + (255 - r) * factor);
    g = Math.round(g + (255 - g) * factor);
    b = Math.round(b + (255 - b) * factor);

    // Convert back to hex
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  };

  // Render an individual cell
  const renderCell = (day: DayData, weekIndex: number, dayIndex: number) => {
    const cellColor = getColorForIntensity(day.intensity);

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
      <ScrollView ref={scrollViewRef} horizontal showsHorizontalScrollIndicator={false} scrollEnabled>
        <View style={styles.calendarContainer}>
          <View style={styles.gridContainer}>
            {/* The actual grid */}
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
