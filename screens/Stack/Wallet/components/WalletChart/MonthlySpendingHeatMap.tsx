import Layout from "@/constants/Layout";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import Colors from "@/constants/Colors";
import Color from "color";
import Button from "@/components/ui/Button/Button";
import lowOpacity from "@/utils/functions/lowOpacity";
import DateTimePicker from "react-native-modal-datetime-picker";
import { gql, useQuery } from "@apollo/client";
import moment from "moment";

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

const MonthlyHeatmap: React.FC = () => {
  const [viewType, setViewType] = useState<"totalAmount" | "totalCount" | "averageAmount">("totalAmount");
  const [selectedDayInfo, setSelectedDayInfo] = useState<DayData | null>(null);

  const defaultMonths = useMemo(() => {
    // Use a 3-month range as default
    const lastDay = moment().format("YYYY-MM-DD");
    const firstDay = moment().subtract(2, "months").startOf("month").format("YYYY-MM-DD");
    return [firstDay, lastDay];
  }, []);

  const [selectedMonths, setSelectedMonths] = useState<string[]>(defaultMonths);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const { loading, error, data } = useQuery(GET_MONTHLY_DATE_SPENDINGS, {
    variables: { months: selectedMonths },
  });

  const handleDayPress = (dayData: DayData) => {
    setSelectedDayInfo(dayData);
    setTimeout(() => {
      setSelectedDayInfo(null);
    }, 3000);
  };

  const handleStartDateConfirm = (date: Date) => {
    const formattedDate = moment(date).format("YYYY-MM-DD");
    setSelectedMonths([formattedDate, selectedMonths[1]]);
    setShowStartDatePicker(false);
  };

  const handleEndDateConfirm = (date: Date) => {
    const formattedDate = moment(date).format("YYYY-MM-DD");
    setSelectedMonths([selectedMonths[0], formattedDate]);
    setShowEndDatePicker(false);
  };

  const { dayDataArray, maxValue } = useMemo(() => {
    if (!data?.monthlyDateSpendings || !Array.isArray(data.monthlyDateSpendings)) {
      return { dayDataArray: [], maxValue: 0 };
    }

    const sortedDays = [...data.monthlyDateSpendings].sort((a, b) => a.dayOfMonth - b.dayOfMonth);

    // Find max value for scaling intensity
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
    return Math.min(0.9, Math.max(0.1, value / maxValue));
  };

  const getCellColor = (value: number) => {
    const intensity = getIntensity(value);
    return Color(Colors.secondary).alpha(intensity).string();
  };

  const getLabel = (value: number) => {
    if (viewType === "totalCount") {
      return value.toString() + "tx";
    } else {
      return Math.round(value) + "zł";
    }
  };

  const button = {
    padding: 10,
    paddingHorizontal: 15,
    borderRadius: 7.5,
    backgroundColor: Colors.primary_light,
    flex: 1,
  };

  const blueText = Color(Colors.primary).lighten(10).string();

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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "600", marginBottom: 5 }}>Monthly Spending Heatmap</Text>
        <Text style={styles.subtitle}>See your spending patterns by day of month</Text>

        <View style={styles.dateRangeContainer}>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowStartDatePicker(true)}>
            <Text style={styles.dateButtonText}>From: {moment(selectedMonths[0]).format("MMM D, YYYY")}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dateButton} onPress={() => setShowEndDatePicker(true)}>
            <Text style={styles.dateButtonText}>To: {moment(selectedMonths[1]).format("MMM D, YYYY")}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.typeSelectorContainer}>
          {[
            { key: "totalAmount", label: "TOTAL" },
            { key: "averageAmount", label: "AVERAGE" },
            { key: "totalCount", label: "COUNT" },
          ].map((item) => (
            <Button
              variant="text"
              key={item.key}
              onPress={() => setViewType(item.key as "totalAmount" | "totalCount" | "averageAmount")}
              style={[
                button,
                {
                  borderWidth: 0.5,
                  borderColor: Colors.primary,
                  marginRight: 5,
                  ...(item.key === viewType && {
                    backgroundColor: lowOpacity(Colors.secondary, 0.15),
                    borderWidth: 0.5,
                    borderColor: lowOpacity(Colors.secondary, 0.5),
                  }),
                },
              ]}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: viewType === item.key ? Colors.secondary : blueText,
                  textAlign: "center",
                }}
              >
                {item.label}
              </Text>
            </Button>
          ))}
        </View>
      </View>

      <View style={styles.heatmapContainer}>
        <View style={styles.monthGrid}>
          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
            const dayData = dayDataArray.find((d) => d.dayOfMonth === day);
            const hasData = !!dayData && dayData[viewType] > 0;
            const value = hasData ? dayData[viewType] : 0;

            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayCell,
                  hasData ? { backgroundColor: getCellColor(value) } : { backgroundColor: lowOpacity(Colors.primary, 0.2) },
                ]}
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

      <DateTimePicker
        isVisible={showStartDatePicker}
        mode="date"
        onConfirm={handleStartDateConfirm}
        onCancel={() => setShowStartDatePicker(false)}
        date={moment(selectedMonths[0]).toDate()}
        maximumDate={moment(selectedMonths[1]).toDate()}
      />

      <DateTimePicker
        isVisible={showEndDatePicker}
        mode="date"
        onConfirm={handleEndDateConfirm}
        onCancel={() => setShowEndDatePicker(false)}
        date={moment(selectedMonths[1]).toDate()}
        minimumDate={moment(selectedMonths[0]).toDate()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: Layout.screen.width - 30,
    marginTop: 25,
    marginBottom: 25,
    minHeight: 400,
  },
  header: {
    marginBottom: 20,
  },
  subtitle: {
    color: "gray",
    fontSize: 16,
    marginBottom: 10,
  },
  dateRangeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  dateButton: {
    backgroundColor: lowOpacity(Colors.primary, 0.3),
    borderWidth: 1,
    borderColor: lowOpacity(Colors.primary, 0.5),
    borderRadius: 7.5,
    padding: 10,
    width: "48%",
    alignItems: "center",
  },
  dateButtonText: {
    color: "#fff",
    fontSize: 14,
  },
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
    minHeight: 350,
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

export default MonthlyHeatmap;
