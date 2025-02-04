import Color from "color";
import moment from "moment";
import { StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/Colors";
import lowOpacity from "@/utils/functions/lowOpacity";

interface Entry {
  id: string;
  value: number;
  date: string;
  unit?: string;
  min?: number;
  max?: number;
  target?: number;
}

interface DayEntryProps {
  entry: Entry;

  index: number;
}

const DayEntry = ({ entry, index }: DayEntryProps) => {
  const date = moment(entry.date);
  const isCurrentDay = date.isSame(moment(), "day");

  const getProgressColor = () => {
    if (!entry.min || !entry.max || !entry.target) return "#fff";

    if (entry.value < entry.min) return "#F44336"; // Red
    if (entry.value > entry.max) return "#F44336"; // Red
    if (entry.value === entry.target) return "#4CAF50"; // Green

    const isCloserToTarget =
      Math.abs(entry.value - entry.target) < Math.abs(entry.value - entry.min) &&
      Math.abs(entry.value - entry.target) < Math.abs(entry.value - entry.max);

    return isCloserToTarget ? "#4CAF50" : "#FFC107"; // Green or Yellow
  };

  return (
    <View
      style={[
        styles.dayContainer,
        index === 0 && {
          borderWidth: 2,
          borderColor: lowOpacity(Colors.secondary, 0.7),
          backgroundColor: lowOpacity(Colors.secondary, 0.15),
        },
      ]}
    >
      <View style={styles.dateSection}>
        <Text style={[styles.day, isCurrentDay && styles.currentDay]}>{date.format("D")}</Text>
        <Text style={styles.month}>{date.format("MMM")}</Text>
      </View>

      <View style={[styles.valueContainer, { flex: 2 }]}>
        <View
          style={{
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={styles.value}>{entry.min}</Text>
          <Text style={{ color: "gray", fontSize: 12 }}>Min</Text>
        </View>

        <View style={styles.separator} />

        <View
          style={{
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={styles.value}>{entry.target}</Text>
          <Text style={{ color: "gray", fontSize: 12 }}>Goal</Text>
        </View>

        <View style={styles.separator} />

        <View
          style={{
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={[styles.target, { color: getProgressColor() }]}>{entry.value}</Text>
          <Text style={{ color: "gray", fontSize: 12 }}>You</Text>
        </View>
      </View>

      <View style={[styles.valueContainer, { alignSelf: "center" }]}>
        <Text
          style={{
            color: entry.value > (entry?.target || 0) ? "#4CAF50" : isCurrentDay ? "#FFC107" : "#F44336",
            fontWeight: "bold",
            width: 110,
            textAlign: "center",
          }}
        >
          {entry.value > (entry?.target || 0) ? "🎉  Good Job!" : isCurrentDay ? "👀 Keep trying" : "You didn't meet your goal"}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dayContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Color(Colors.primary_lighter).lighten(1).hex(),
    backgroundColor: Colors.primary_lighter,
  },
  dateSection: {
    alignItems: "center",
    minWidth: 50,
  },
  day: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
  currentDay: {
    color: "#2196F3",
  },
  month: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  valueContainer: {
    flex: 1,
    flexDirection: "row",
    gap: 15,
    alignSelf: "flex-end",
    justifyContent: "center",
  },
  valueWrapper: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: "400",
    color: "rgba(255,255,255,0.85)",
  },
  unit: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  range: {
    fontSize: 12,
    color: "#666",
  },
  target: {
    fontSize: 20,
    fontWeight: "600",
    color: "#666",
  },

  separator: {
    width: 1,
    height: 35,
    backgroundColor: "gray",
  },
});

export default DayEntry;
