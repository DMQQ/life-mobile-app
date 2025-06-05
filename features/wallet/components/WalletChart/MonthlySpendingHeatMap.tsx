import Layout from "@/constants/Layout";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import Colors, { secondary_candidates } from "@/constants/Colors";
import Color from "color";
import lowOpacity from "@/utils/functions/lowOpacity";
import { gql, useQuery } from "@apollo/client";
import ChartTemplate from "./ChartTemplate";

const GET_MONTHLY_DATE_SPENDINGS = gql`
  query MonthlyDateSpendings($months: [String!]!) {
    monthlyDateSpendings(months: $months) {
      dayOfMonth
      totalCount
      totalAmount
      averageAmount
    }
  }
`;

interface DayData {
  dayOfMonth: number;
  totalCount: number;
  totalAmount: number;
  averageAmount: number;
}

const MonthlyHeatmap = ({ dateRange, type }: { dateRange: [string, string]; type: string }) => {
  const viewType =
    {
      total: "totalAmount",
      avg: "averageAmount",
      count: "totalCount",
    }[type] || "totalAmount";

  const [selectedDayInfo, setSelectedDayInfo] = useState<DayData | null>(null);

  const { loading, error, data } = useQuery(GET_MONTHLY_DATE_SPENDINGS, {
    variables: { months: dateRange },
  });

  const handleDayPress = (dayData: DayData) => {
    setSelectedDayInfo(dayData);
    setTimeout(() => {
      setSelectedDayInfo(null);
    }, 3000);
  };

  const { dayDataArray, maxValue } = useMemo(() => {
    if (!data?.monthlyDateSpendings || !Array.isArray(data.monthlyDateSpendings)) {
      return { dayDataArray: [], maxValue: 0 };
    }

    const sortedDays = [...data.monthlyDateSpendings].sort((a, b) => a.dayOfMonth - b.dayOfMonth);

    let maxVal = 0;
    sortedDays.forEach((day) => {
      const value = day[viewType];
      if (value > maxVal) {
        maxVal = value;
      }
    });

    return {
      dayDataArray: sortedDays,
      maxValue: maxVal,
    };
  }, [data, viewType]);

  const getIntensity = (value: number) => {
    if (!maxValue || !value) return 0;
    return Math.min(0.9, Math.max(0.1, value / maxValue)) * 1.3;
  };

  const getCellColor = (value: number) => {
    const intensity = getIntensity(value);
    return Color(secondary_candidates[3]).alpha(intensity).string();
  };

  const getLabel = (value: number) => {
    if (viewType === "totalCount") {
      return value.toString() + "tx";
    } else {
      return Math.round(value) + "zł";
    }
  };

  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  if (error)
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </View>
    );

  return (
    <View>
      <View style={styles.heatmapContainer}>
        <View style={styles.monthGrid}>
          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
            const dayData = dayDataArray.find((d) => d.dayOfMonth === day);
            const hasData = !!dayData && dayData[viewType] > 0;
            const value = hasData ? dayData[viewType] : 0;

            return (
              <TouchableOpacity
                key={day}
                style={[styles.dayCell, hasData ? { backgroundColor: getCellColor(value) } : { backgroundColor: Colors.primary_light }]}
                onPress={() => dayData && handleDayPress(dayData)}
                disabled={!hasData}
              >
                <Text style={styles.dayNumber}>{day}</Text>
                {hasData && <Text style={styles.dayValue}>{getLabel(value)}</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedDayInfo && (
          <View style={styles.tooltip}>
            <Text style={styles.tooltipTitle}>Day {selectedDayInfo.dayOfMonth}</Text>
            <Text style={styles.tooltipValue}>Total: {selectedDayInfo.totalAmount.toFixed(2)}zł</Text>
            <Text style={styles.tooltipValue}>Average: {selectedDayInfo.averageAmount.toFixed(2)}zł</Text>
            <Text style={styles.tooltipValue}>Count: {selectedDayInfo.totalCount} transactions</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  typeSelectorContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  heatmapContainer: {
    backgroundColor: lowOpacity(Colors.primary, 0.15),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: lowOpacity(Colors.primary, 0.3),
    position: "relative",
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    width: Layout.screen.width - 30, // Account for padding
  },
  dayCell: {
    width: `${100 / 7 - 1}%`,
    height: Layout.screen.width / 7 - 10,
    aspectRatio: 1,
    padding: 6,
    margin: "0.5%",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: lowOpacity(Colors.primary, 0.4),
    borderRadius: 5,
  },
  dayNumber: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  dayValue: {
    color: "#fff",
    fontSize: 10,
    textAlign: "center",
    fontWeight: "500",
    height: 15,
    width: "100%",
  },
  tooltip: {
    position: "absolute",
    top: 100,
    left: 50,
    backgroundColor: Color(Colors.primary).lighten(0.5).string(),
    padding: 10,
    borderRadius: 5,
    width: 180,
    zIndex: 10,
  },
  tooltipTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
  },
  tooltipValue: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 4,
  },
  legendContainer: {
    marginTop: 10,
    padding: 15,
    backgroundColor: lowOpacity(Colors.primary, 0.15),
    borderRadius: 10,
  },
  legendTitle: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 10,
  },
  legendItems: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  legendItem: {
    alignItems: "center",
  },
  legendColor: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: lowOpacity(Colors.primary, 0.4),
    borderRadius: 3,
    marginBottom: 5,
  },
  legendText: {
    color: "#fff",
    fontSize: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
  },
  errorContainer: {
    padding: 20,
    backgroundColor: lowOpacity("#ff0000", 0.1),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: lowOpacity("#ff0000", 0.3),
    marginVertical: 20,
  },
  errorText: {
    color: "#ff7777",
    fontSize: 16,
  },
});

export default function HeatMap() {
  return (
    <ChartTemplate types={["total", "avg", "count"]} title="Spendings Heatmap" description="See you spendings patterns as heatmap">
      {({ dateRange, type }) => <MonthlyHeatmap type={type} dateRange={dateRange} />}
    </ChartTemplate>
  );
}
